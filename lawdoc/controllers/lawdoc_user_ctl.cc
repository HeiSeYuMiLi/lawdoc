#include "lawdoc_user_ctl.h"
#include "db/entity.h"
#include "src/captcha.h"
#include "utils/error.h"
#include <drogon/HttpResponse.h>
#include <drogon/utils/Utilities.h>
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

void user_ctl::modify_passwd(const HttpRequestPtr &req, FUNCTION &&callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    return;
  }
  auto req_json{*json_ptr};

  auto passwd = req_json["passwd"].asString();
  auto token = req->getHeader("Authorization");

  t_user::async_update_passwd_by_uuid(
      token, passwd, [callback = std::move(callback)](bool targ) {
        callback(targ ? HttpResponse::newHttpJsonResponse(utils::cb_json())
                      : utils::error("系统错误，请联系管理员！", 753));
      });
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