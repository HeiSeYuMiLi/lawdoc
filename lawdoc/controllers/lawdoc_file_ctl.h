#pragma once

#include <drogon/HttpController.h>
#include <drogon/HttpRequest.h>

using namespace drogon;

namespace lawdoc {
class file_ctl : public drogon::HttpController<file_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(file_ctl::upload_file, "/lawdoc/upload_file", Post);
  ADD_METHOD_TO(file_ctl::get_file_list, "/lawdoc/file_list", Post);
  ADD_METHOD_TO(file_ctl::get_file, "/lawdoc/file", Post);
  ADD_METHOD_TO(file_ctl::admin_get_file_list, "/lawdoc/admin/file_list", Post);
  ADD_METHOD_TO(file_ctl::admin_get_all_file_list, "/lawdoc/admin/all_file_list", Post);
  ADD_METHOD_TO(file_ctl::user_get_all_file_list, "/lawdoc/all_file_list", Post);
  ADD_METHOD_TO(file_ctl::update_file_name, "/lawdoc/update_file_name", Post);
  ADD_METHOD_TO(file_ctl::delete_file, "/lawdoc/delete_file", Post);

  METHOD_LIST_END

  Task<> upload_file(HttpRequestPtr req, FUNCTION callback);
  Task<> get_file_list(HttpRequestPtr req, FUNCTION callback);
  Task<> get_file(HttpRequestPtr req, FUNCTION callback);
  Task<> admin_get_file_list(HttpRequestPtr req, FUNCTION callback);
  Task<> admin_get_all_file_list(HttpRequestPtr req, FUNCTION callback);
  Task<> user_get_all_file_list(HttpRequestPtr req, FUNCTION callback);
  Task<> update_file_name(HttpRequestPtr req, FUNCTION callback);
  Task<> delete_file(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
