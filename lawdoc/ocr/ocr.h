#pragma once
#include <leptonica/allheaders.h>
#include <tesseract/baseapi.h>

namespace lawdoc::ocr {
static auto img_root_directory{"../image/"};
static auto doc_root_directory{"../legal_instrument/"};
std::vector<std::string> supported_img_type();
std::vector<std::string> pdf2image(std::string_view file_path,
                                   std::string_view img_type = "png");
std::string parse_image(std::string_view img_name);
void remove_file(std::string_view root_path);
} // namespace lawdoc::ocr