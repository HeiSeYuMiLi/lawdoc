#include <drogon/drogon.h>

namespace lawdoc::utils {
using jsonv = Json::Value;
jsonv cb_json(int code = 0, std::string_view msg = {});
void error(std::string_view msg);
drogon::HttpResponsePtr error(std::string_view msg, int code);
} // namespace lawdoc::utils