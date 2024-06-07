#pragma once
#include <leptonica/allheaders.h>
#include <tesseract/baseapi.h>

namespace lawdoc::ocr {
static auto IMG_PATH{"../image/"};
static auto FILE_PATH{"../file/"};
static auto IMG_TYPE{".png"};
std::vector<std::string> supported_img_type();
std::vector<std::string> pdf2image(std::string_view file_name);

/**
 * @brief 用于处理PDF文本抽取，抽取的文本信息存放在TXT文件中
 * @param file_name PDF文件名
 * @return TXT文件名
 */
std::string text_extract_handler(std::string_view file_name);

std::string parse_image(std::string_view img_name,
                        std::string_view img_path = IMG_PATH);
void remove_file(std::string_view root_path);
} // namespace lawdoc::ocr