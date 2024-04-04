#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

namespace lawdoc {
class file_ctl : public drogon::HttpController<file_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(file_ctl::upload_file, "/upload_file", Post);

  METHOD_LIST_END

  void upload_file(const HttpRequestPtr &req, FUNCTION &&callback);
};
} // namespace lawdoc
