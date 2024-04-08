#include "captcha.h"
#include <random>

namespace lawdoc::captcha {
std::string get_captcha(std::string const &account) {
  std::default_random_engine engine;
  std::uniform_int_distribution<int> distribution(100000, 999999);
  int random_number = distribution(engine);
  auto rn = std::to_string(random_number);

  std::unique_lock<std::mutex> _(mt);
  captcha_map[account] = rn;

  return rn;
}

bool find_captcha(std::string const &account, std::string const &captcha) {
  std::unique_lock<std::mutex> _(mt);
  auto it = captcha_map.find(account);
  if (it != captcha_map.end())
    return captcha == it->second;
  return false;
}
} // namespace lawdoc::captcha