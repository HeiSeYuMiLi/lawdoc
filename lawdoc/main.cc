#include "ocr/ocr.h"
#include <drogon/drogon.h>

int main() {
  lawdoc::ocr::parse_image("1711371460442601_劳荣枝故意杀人绑架抢劫罪死刑复核刑事裁定书1.png");
  drogon::app().addListener("0.0.0.0", 5555);
  // drogon::app().loadConfigFile("../config.json");
  drogon::app().run();
  return 0;
}
