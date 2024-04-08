#include "utils.h"
#include <chrono>

namespace lawdoc::utils {
std::string remove_file_suff(std::string_view file_path) {
  auto pos = std::ranges::find(file_path, '.');
  if (pos != file_path.end())
    return std::string(file_path.begin(), pos);
  return {};
}

std::string generate_file_name(std::string_view file_name, int page,
                               std::string_view file_type) {
  // 获取当前时间
  auto now = std::chrono::duration_cast<std::chrono::microseconds>(
                 std::chrono::system_clock::now().time_since_epoch())
                 .count();
  // 命名规则：时间+原文件名+当前页数+文件类型
  std::stringstream ss;
  ss << now << "_" << file_name;
  if (page != -1)
    ss << page;
  if (!file_type.empty())
    ss << "." << file_type;
  return ss.str();
}

std::string serialize(jsonv const &json) {
  Json::StreamWriterBuilder builder;
  builder["commentStyle"] = "None";
  builder["indentation"] = "";
  builder["emitUTF8"] = true;
  return Json::writeString(builder, json);
}
} // namespace lawdoc::utils