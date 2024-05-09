#pragma once

#include <drogon/HttpController.h>
#include <drogon/HttpRequest.h>

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
  ADD_METHOD_TO(user_ctl::modify_user_info, "/lawdoc/user/update", Post);
  ADD_METHOD_TO(user_ctl::recover_passwd, "/lawdoc/user/recover", Post);
  ADD_METHOD_TO(user_ctl::get_user_info, "/lawdoc/user/info", Post);
  ADD_METHOD_TO(user_ctl::admin_signin, "/lawdoc/admin/signin", Post);
  ADD_METHOD_TO(user_ctl::admin_get_user_list, "/lawdoc/admin/user_list", Post);
  ADD_METHOD_TO(user_ctl::admin_get_all_user_list, "/lawdoc/admin/all_user_list", Post);
  ADD_METHOD_TO(user_ctl::upload_head_img, "/lawdoc/upload_head_img", Post);
  ADD_METHOD_TO(user_ctl::get_head_img, "/lawdoc/head_img", Post);

  METHOD_LIST_END

  Task<> signin_by_captcha(HttpRequestPtr req, FUNCTION callback);
  Task<> signin_by_passwd(HttpRequestPtr req, FUNCTION callback);
  Task<> signup_by_passwd(HttpRequestPtr req, FUNCTION callback);
  void get_captcha(const HttpRequestPtr &req, FUNCTION &&callback);
  Task<> modify_user_info(HttpRequestPtr req, FUNCTION callback);
  Task<> recover_passwd(HttpRequestPtr req, FUNCTION callback);
  Task<> get_user_info(HttpRequestPtr req, FUNCTION callback);
  Task<> admin_signin(HttpRequestPtr req, FUNCTION callback);
  Task<> admin_get_user_list(HttpRequestPtr req, FUNCTION callback);
  Task<> admin_get_all_user_list(HttpRequestPtr req, FUNCTION callback);
  Task<> upload_head_img(HttpRequestPtr req, FUNCTION callback);
  Task<> get_head_img(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
