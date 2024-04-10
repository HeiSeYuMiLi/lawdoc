#include "lawdoc_user_ctl.h"
#include "db/entity.h"
#include "src/captcha.h"
#include "utils/error.h"

using namespace lawdoc;

Task<bool> signup_by_phone(std::string_view uuid, std::string_view phone) {
  // 手机注册
  t_user::modelt model{};
  model.setPhone(std::string(phone));
  model.setUuid(std::string(uuid));
  model.setName("游客");
  co_return co_await t_user::coro_insert(model);
}

Task<bool> signup_by_mail(std::string_view uuid, std::string_view mail) {
  // 邮箱注册
  t_user::modelt model{};
  model.setMail(std::string(mail));
  model.setUuid(std::string(uuid));
  model.setName("游客");
  co_return co_await t_user::coro_insert(model);
}

Task<> user_ctl::signin_by_phone(HttpRequestPtr req, FUNCTION callback) {
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
  // 检查是否已注册
  criteria crit{};
  crit.set_crit("phone", "=", phone);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    if (co_await signup_by_phone(uuid, phone)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
    } else {
      callback(utils::error("注册失败", 456));
    }
  } else {
    // 已注册，修改uuid
    auto user = users[0];
    user.setUuid(uuid);
    if (co_await t_user::coro_update(user)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
    } else {
      callback(utils::error("登录失败", 456));
    }
  }
}

Task<> user_ctl::signin_by_mail(HttpRequestPtr req, FUNCTION callback) {
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto mail = req_json["mail"].asString();
  auto captcha = req_json["captcha"].asString();

  // 先检查验证码是否正确
  if (!captcha::find_captcha(mail, captcha)) {
    // 验证码错误
    callback(utils::error("验证码错误", 456));
    co_return;
  }

  auto uuid = drogon::utils::getUuid();
  // 检查是否已注册
  criteria crit{};
  crit.set_crit("mail", "=", mail);
  auto users = co_await t_user::coro_query(crit);
  if (users.size() == 0) {
    // 未注册
    if (co_await signup_by_mail(uuid, mail))
      callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
    else
      callback(utils::error("注册失败", 456));
  } else {
    // 已注册，修改uuid
    auto user = users[0];
    user.setUuid(uuid);
    if (co_await t_user::coro_update(user))
      callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
    else
      callback(utils::error("登录失败", 456));
  }
}

void user_ctl::signout(const HttpRequestPtr &req, FUNCTION &&callback) {}

void user_ctl::get_captcha(const HttpRequestPtr &req, FUNCTION &&callback) {
  std::cout << req->getBody() << std::endl;
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