#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

namespace lawdoc {
class ner_ctl : public drogon::HttpController<ner_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(ner_ctl::ner, "/lawdoc/ner", Post);

  METHOD_LIST_END

  Task<> ner(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
