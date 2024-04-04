#include <string>
#include <string_view>

namespace lawdoc::utils {
std::string remove_file_suff(std::string_view file_path);
std::string generate_file_name(std::string_view file_name, int page = -1,
                               std::string_view file_type = "");
} // namespace lawdoc::utils