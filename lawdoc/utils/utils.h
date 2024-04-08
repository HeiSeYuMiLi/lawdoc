#include <jsoncpp/json/json.h>
#include <string>
#include <string_view>

namespace lawdoc::utils {
using jsonv = Json::Value;
std::string remove_file_suff(std::string_view file_path);
std::string generate_file_name(std::string_view file_name, int page = -1,
                               std::string_view file_type = "");
std::string serialize(jsonv const &json);
} // namespace lawdoc::utils