#include "ocr.h"
#include <drogon/drogon.h>

namespace lawdoc {
void ocr::init() {
  if (api_->Init("", "chi_sim")) {
    LOG_ERROR << "Could not initialize tesseract.";
  } else {
    can_user_ocr_ = true;
  }
}
void ocr::parse() {
  if (!can_user_ocr_) {
    LOG_WARN << "Please call Init before attempting to set an image.";
    return;
  }

  Pix *image = pixRead("/home/baoguli/lawdoc/images/test4.png");
  api_->SetImage(image);
  // Get OCR result
  auto outText = api_->GetUTF8Text();
  printf("OCR output:\n%s", outText);

  // Destroy used object and release memory
  api_->End();
  delete[] outText;
  pixDestroy(&image);
}
} // namespace lawdoc