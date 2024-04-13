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

  METHOD_LIST_END

  Task<> upload_file(HttpRequestPtr req, FUNCTION callback);
  Task<> get_file_list(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
