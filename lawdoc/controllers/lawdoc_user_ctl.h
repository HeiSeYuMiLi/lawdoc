#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

namespace lawdoc {
class user_ctl : public drogon::HttpController<user_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(user_ctl::signin_by_phone, "/lawdoc/signin/phone", Post);
  ADD_METHOD_TO(user_ctl::signin_by_mail, "/lawdoc/signin/mail", Post);
  ADD_METHOD_TO(user_ctl::signout, "/lawdoc/signout", Post);
  ADD_METHOD_TO(user_ctl::get_captcha, "/lawdoc/signin/captcha", Get);

  METHOD_LIST_END

  Task<> signin_by_phone(HttpRequestPtr req, FUNCTION callback);
  Task<> signin_by_mail(HttpRequestPtr req, FUNCTION callback);
  void signout(const HttpRequestPtr &req, FUNCTION &&callback);
  void get_captcha(const HttpRequestPtr &req, FUNCTION &&callback);
};
} // namespace lawdoc
