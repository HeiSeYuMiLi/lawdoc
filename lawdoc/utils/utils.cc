#include "utils.h"

namespace lawdoc::utils {
std::string remove_file_suff(std::string_view file_path) {
  auto pos = std::ranges::find(file_path, '.');
  if (pos != file_path.end())
    return std::string(file_path.begin(), pos);
  return {};
}
} // namespace lawdoc::utils