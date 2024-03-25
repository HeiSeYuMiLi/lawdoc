#pragma once
#include <leptonica/allheaders.h>
#include <tesseract/baseapi.h>

namespace lawdoc::ocr {
std::vector<std::string> supported_img_type();
std::vector<std::string> pdf2image(std::string_view file_path, std::string_view img_type);
void parse_image(std::string_view img_path);
void remove_img();
} // namespace lawdoc::ocr