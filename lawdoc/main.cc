#include "ocr/ocr.h"
#include <drogon/drogon.h>

int main() {
  auto vec=lawdoc::ocr::pdf2image("", "png");
  for(auto&& name:vec){
    lawdoc::ocr::parse_image(name);
  }
  drogon::app().addListener("0.0.0.0", 5555);
  // drogon::app().loadConfigFile("../config.json");
  drogon::app().run();
  return 0;
}
