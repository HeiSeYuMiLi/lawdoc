#pragma once

#include <drogon/HttpController.h>

using namespace drogon;

namespace lawdoc {
class ner_ctl : public drogon::HttpController<ner_ctl> {
public:
  using FUNCTION = std::function<void(const HttpResponsePtr &)>;

  METHOD_LIST_BEGIN

  ADD_METHOD_TO(ner_ctl::ner, "/lawdoc/ner", Post);
  ADD_METHOD_TO(ner_ctl::update_entity, "/lawdoc/update_entity", Post);
  ADD_METHOD_TO(ner_ctl::delete_entity, "/lawdoc/delete_entity", Post);

  METHOD_LIST_END

  Task<> ner(HttpRequestPtr req, FUNCTION callback);
  Task<> update_entity(HttpRequestPtr req, FUNCTION callback);
  Task<> delete_entity(HttpRequestPtr req, FUNCTION callback);
};
} // namespace lawdoc
