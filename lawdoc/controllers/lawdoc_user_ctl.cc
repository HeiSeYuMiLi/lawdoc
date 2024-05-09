#include "lawdoc_user_ctl.h"
#include "db/entity.h"
#include "src/captcha.h"
#include "utils/error.h"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/utils/Utilities.h>
#include <string>
#include <string_view>

using namespace lawdoc;
using jsonv = Json::Value;

// 密码加密
auto encry_str{"wtsg7485"};
std::string encry_passwd(std::string_view passwd) {
  auto res = drogon::utils::getMd5(std::string(passwd).append(encry_str));
  return res;
}

Task<bool> signup(std::string_view uuid, std::string_view phone,
                  std::string_view passwd = "") {
  // 手机注册
  t_user::modelt model{};
  model.setPhone(std::string(phone));
  model.setUuid(std::string(uuid));
  model.setPassword(std::string(passwd));
  model.setName("游客");
  co_return co_await t_user::coro_insert(model);
}

Task<> user_ctl::signin_by_captcha(HttpRequestPtr req, FUNCTION callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto phone = req_json["phone"].asString();
  auto captcha = req_json["captcha"].asString();

  // 先检查验证码是否正确
  if (!captcha::find_captcha(phone, captcha)) {
    // 验证码错误
    callback(utils::error("验证码错误", 456));
    co_return;
  }

  auto uuid = drogon::utils::getUuid();
  jsonv resp_json{utils::cb_json()};
  resp_json["data"]["token"] = uuid;
  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    if (co_await signup(uuid, phone)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
    } else {
      callback(utils::error("注册失败", 456));
    }
  } else {
    // 已注册，修改uuid
    auto user = users[0];
    user.setUuid(uuid);
    if (co_await t_user::coro_update(user)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
    } else {
      callback(utils::error("系统错误，请联系管理员！", 456));
    }
  }
}

Task<> user_ctl::signin_by_passwd(HttpRequestPtr req, FUNCTION callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto phone = req_json["phone"].asString();
  auto passwd = req_json["passwd"].asString();

  auto uuid = drogon::utils::getUuid();
  jsonv resp_json{utils::cb_json()};
  resp_json["data"]["token"] = uuid;

  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    callback(utils::error("账号未注册", 456));
  } else {
    // 已注册，检查密码
    auto user = users[0];
    if (encry_passwd(passwd) == user.getValueOfPassword()) {
      // 修改uuid
      user.setUuid(uuid);
      if (co_await t_user::coro_update(user))
        callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
      else
        callback(utils::error("系统错误，请联系管理员！", 456));
    } else
      callback(utils::error("登录失败，密码错误！", 456));
  }
}

Task<> user_ctl::signup_by_passwd(HttpRequestPtr req, FUNCTION callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto phone = req_json["phone"].asString();
  auto passwd = req_json["passwd"].asString();
  auto captcha = req_json["captcha"].asString();

  // 先检查验证码是否正确
  if (!captcha::find_captcha(phone, captcha)) {
    // 验证码错误
    callback(utils::error("验证码错误", 456));
    co_return;
  }

  auto uuid = drogon::utils::getUuid();
  jsonv resp_json{utils::cb_json()};
  resp_json["data"]["token"] = uuid;

  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    if (co_await signup(uuid, phone, encry_passwd(passwd)))
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
    else
      callback(utils::error("注册失败", 456));
  } else {
    // 已注册
    callback(utils::error("账号已经注册！", 456));
  }
}

void user_ctl::get_captcha(const HttpRequestPtr &req, FUNCTION &&callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    return;
  }
  auto req_json{*json_ptr};

  auto account = req_json["account"].asString();
  if (account.empty()) {
    callback(utils::error("请输入手机号", 456));
    return;
  }

  auto captcha = captcha::get_captcha(account);
  if (captcha.empty()) {
    callback(utils::error("验证码获取失败", 456));
    return;
  }
  auto json{utils::cb_json()};
  json["data"]["captcha"] = captcha;
  callback(drogon::HttpResponse::newHttpJsonResponse(json));
}

Task<> user_ctl::modify_user_info(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto name = req_json["name"].asString();
  auto sex = req_json["sex"].asInt();
  auto passwd = req_json["passwd"].asString();

  auto targ = co_await t_user::async_update_by_uuid(token, name,
                                                    encry_passwd(passwd), sex);
  callback(targ ? HttpResponse::newHttpJsonResponse(utils::cb_json())
                : utils::error("系统错误，请联系管理员！", 753));
}

Task<> user_ctl::recover_passwd(HttpRequestPtr req, FUNCTION callback) {
  // 找回密码，就相当于是验证码登录
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto phone = req_json["phone"].asString();
  auto captcha = req_json["captcha"].asString();

  // 先检查验证码是否正确
  if (!captcha::find_captcha(phone, captcha)) {
    // 验证码错误
    callback(utils::error("验证码错误", 456));
    co_return;
  }

  auto uuid = drogon::utils::getUuid();
  jsonv resp_json{utils::cb_json()};
  resp_json["data"]["token"] = uuid;
  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    callback(utils::error("账号未注册", 456));
  } else {
    // 已注册，修改uuid
    auto user = users[0];
    user.setUuid(uuid);
    if (co_await t_user::coro_update(user)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
    } else {
      callback(utils::error("系统错误，请联系管理员！", 456));
    }
  }
}

Task<> user_ctl::get_user_info(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }
  auto user = co_await t_user::query_by_uuid(token);
  auto json{utils::cb_json()};
  json["data"] = user.toJson();
  criteria crit{};
  crit.set_crit("user_id", "=", std::to_string(user.getValueOfId()))
      .set_crit("file_name", "!=", "");
  auto count = co_await t_file::coro_count(crit);
  json["data"]["file_count"] = count;
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> user_ctl::admin_signin(HttpRequestPtr req, FUNCTION callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto phone = req_json["phone"].asString();
  auto passwd = req_json["passwd"].asString();

  auto uuid = drogon::utils::getUuid();

  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone)
      .set_crit("password", "=", encry_passwd(passwd))
      .set_crit("is_system", "=", "1");
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    callback(utils::error("账号或密码错误", 456));
  } else {
    // 已注册
    auto user = users[0];
    // 修改uuid
    user.setUuid(uuid);
    if (co_await t_user::coro_update(user)) {
      jsonv resp_json{utils::cb_json()};
      resp_json["data"]["token"] = uuid;
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
    } else
      callback(utils::error("系统错误，请联系管理员！", 456));
  }
}

Task<> user_ctl::admin_get_user_list(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto name = req_json["name"].asString();
  auto sex = req_json["sex"].asString();
  auto page = req_json.get("page", 1).asInt();

  criteria crit{};
  crit.page = page - 1;
  crit.set_crit("is_system", "=", "0");

  if (!name.empty())
    crit.set_crit("name", " like ", "%" + name + "%");
  if (!sex.empty())
    crit.set_crit("sex", "=", sex);

  auto users = co_await t_user::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["count"] = co_await t_user::coro_count(crit);
  json["data"]["users"] = Json::arrayValue;
  for (auto &&user : users) {
    jsonv j{};
    j["id"] = user.getValueOfId();
    j["name"] = user.getValueOfName();
    j["sex"] = user.getValueOfSex();
    j["phone"] = user.getValueOfPhone();
    j["create_time"] = user.getValueOfCreateTime().toDbStringLocal();
    criteria crit2{};
    crit2.set_crit("user_id", "=", std::to_string(user.getValueOfId()));
    j["file_count"] = co_await t_file::coro_count(crit2);
    json["data"]["users"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> user_ctl::admin_get_all_user_list(HttpRequestPtr req,
                                         FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  criteria crit{};
  crit.size = -1;
  crit.set_crit("is_system", "=", "0");

  auto users = co_await t_user::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["users"] = Json::arrayValue;
  for (auto &&user : users) {
    jsonv j{};
    j["id"] = user.getValueOfId();
    j["sex"] = user.getValueOfSex();
    j["create_time"] = user.getValueOfCreateTime().toDbStringLocal();
    json["data"]["users"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> user_ctl::upload_head_img(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  using namespace std::literals;
  // 检查文件数量
  MultiPartParser file_upload;
  if (file_upload.parse(req) != 0 || file_upload.getFiles().size() != 1) {
    callback(utils::error("必须且只能传一个文件！"sv, 403));
    co_return;
  }

  auto &file = file_upload.getFiles()[0];

  // 检查文件类型
  auto type = file.getFileExtension();
  if (type != "png" && type != "jpg") {
    callback(utils::error("文件类型错误！"sv, 403));
    co_return;
  }

  // 保存文件到本地，本地存储的文件名通过uuid命名
  auto uuid = drogon::utils::getUuid();
  auto path = "../userImg/" + uuid + "." + std::string(type);
  file.saveAs(path);

  auto user = co_await t_user::query_by_uuid(token);
  user.setImgPath(path);
  if (co_await t_user::coro_update(user))
    callback(HttpResponse::newHttpJsonResponse(utils::cb_json()));
  else
    callback(utils::error("error", 123));
}

Task<> user_ctl::get_head_img(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }
  auto user = co_await t_user::query_by_uuid(token);
  auto path = user.getValueOfImgPath();
  if (path.empty()) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k404NotFound);
    callback(resp);
    co_return;
  }
  auto resp = HttpResponse::newFileResponse(path);
  callback(resp);
}