#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

namespace lawdoc {
class user_ctl : public drogon::HttpController<user_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(user_ctl::signin_by_captcha, "/lawdoc/signin/captcha", Post);
  ADD_METHOD_TO(user_ctl::signin_by_passwd, "/lawdoc/signin/passwd", Post);
  ADD_METHOD_TO(user_ctl::signup_by_passwd, "/lawdoc/signup/passwd", Post);
  ADD_METHOD_TO(user_ctl::get_captcha, "/lawdoc/signin/get_captcha", Post);
  ADD_METHOD_TO(user_ctl::modify_passwd, "/lawdoc/user/passwd", Post);
  ADD_METHOD_TO(user_ctl::recover_passwd, "/lawdoc/user/recover", Post);

  METHOD_LIST_END

  Task<> signin_by_captcha(HttpRequestPtr req, FUNCTION callback);
  Task<> signin_by_passwd(HttpRequestPtr req, FUNCTION callback);
  Task<> signup_by_passwd(HttpRequestPtr req, FUNCTION callback);
  void get_captcha(const HttpRequestPtr &req, FUNCTION &&callback);
  void modify_passwd(const HttpRequestPtr &req, FUNCTION &&callback);
  Task<> recover_passwd(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
