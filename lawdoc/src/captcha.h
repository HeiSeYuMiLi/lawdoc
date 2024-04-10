#include <map>
#include <mutex>
#include <string>

namespace lawdoc::captcha {
inline std::mutex mt{};
inline std::map<std::string, std::string> captcha_map{};
std::string get_captcha(std::string const &account);
bool find_captcha(std::string const &account, std::string const &captcha);
} // namespace lawdoc::captcha