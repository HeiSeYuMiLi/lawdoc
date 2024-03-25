#pragma once
#include <leptonica/allheaders.h>
#include <memory>
#include <tesseract/baseapi.h>

namespace lawdoc {
class ocr {
public:
  static void init();
  static void parse();

private:
  inline static std::unique_ptr<tesseract::TessBaseAPI> api_ =
      std::make_unique<tesseract::TessBaseAPI>();
  inline static bool can_user_ocr_{false};
};
} // namespace lawdoc