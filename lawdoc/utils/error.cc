#include "error.h"
#include <drogon/HttpResponse.h>

namespace lawdoc::utils {
jsonv cb_json(int code, std::string_view msg) {
  jsonv json{};
  json["code"] = code;
  json["err_msg"] = std::string(msg);
  json["data"] = {};
  return json;
}
void error(std::string_view msg) { LOG_ERROR << "Error: " << msg; }
drogon::HttpResponsePtr error(std::string_view msg, int code) {
  return drogon::HttpResponse::newHttpJsonResponse(cb_json(code, msg));
}
} // namespace lawdoc::utils