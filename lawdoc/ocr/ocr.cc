#include "ocr.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <charconv>
#include <chrono>
#include <drogon/drogon.h>
#include <filesystem>
#include <fstream>
#include <memory>
#include <poppler-document.h>
#include <poppler-image.h>
#include <poppler-page-renderer.h>
#include <poppler-page.h>
#include <system_error>

namespace lawdoc::ocr {
auto img_root_directory{"../image/"};
auto doc_root_directory{"../legal_instrument/"};
std::string generate_file_name(std::string_view file_name, int page,
                               std::string_view file_type) {
  // 获取当前时间
  auto now = std::chrono::duration_cast<std::chrono::microseconds>(
                 std::chrono::system_clock::now().time_since_epoch())
                 .count();
  // 命名规则：时间+原文件名+当前页数+文件类型
  std::stringstream ss;
  ss << now << "_" << file_name << page << "." << file_type;
  return ss.str();
}

std::vector<std::string> supported_img_type() {
  return poppler::image::supported_image_formats();
}

std::vector<std::string> pdf2image(std::string_view file_name,
                                   std::string_view img_type) {
  // 创建一个poppler::document对象
  std::unique_ptr<poppler::document> doc(poppler::document::load_from_file(
      std::string(doc_root_directory) + std::string(file_name) + ".pdf"));

  // 检查文档是否成功加载
  if (!doc.get()) {
    utils::error("loading error");
    return {};
  }
  if (doc->is_locked()) {
    utils::error("encrypted document");
    return {};
  }

  poppler::page_renderer pr;
  pr.set_render_hint(poppler::page_renderer::antialiasing, true);
  pr.set_render_hint(poppler::page_renderer::text_antialiasing, true);

  std::vector<std::string> img_names;

  for (auto i{0}; i < doc->pages(); ++i) {
    std::unique_ptr<poppler::page> p(doc->create_page(i));
    if (!p.get()) {
      utils::error("NULL page");
      return {};
    }
    auto img = pr.render_page(p.get());
    if (!img.is_valid()) {
      utils::error("rendering failed");
      return {};
    }
    auto img_name = generate_file_name(file_name, i + 1, img_type);
    img_names.push_back(img_name);
    if (!img.save(std::string(img_root_directory) + img_name,
                  std::string(img_type), 300)) {
      utils::error("saving to file failed");
      return {};
    }
    break;
  }
  return img_names;
}

void parse_image(std::string_view img_path) {
  std::unique_ptr<tesseract::TessBaseAPI> api =
      std::make_unique<tesseract::TessBaseAPI>();
  if (api->Init("", "chi_sim")) {
    LOG_ERROR << "Could not initialize tesseract.";
    return;
  }

  Pix *image =
      pixRead((std::string(img_root_directory).append(img_path)).data());
  api->SetImage(image);
  // Get OCR result
  auto output = api->GetUTF8Text();
  std::ofstream out(std::string(doc_root_directory) +
                    utils::remove_file_suff(img_path).append("txt"));
  out << output;
  out.close();
  // Destroy used object and release memory
  api->End();
  delete[] output;
  pixDestroy(&image);
}

void remove_img() {
  auto iter = std::filesystem::directory_iterator(img_root_directory);
  auto now = std::chrono::system_clock::now();
  for (auto &&entry : iter) {
    auto file_name = entry.path().filename().string();
    long create_time{};
    std::from_chars(file_name.data(), file_name.data() + file_name.length(),
                    create_time);
    if (now - std::chrono::system_clock::time_point(
                  std::chrono::microseconds(create_time)) >
        std::chrono::hours(1)) {
      std::error_code ec;
      bool removed = std::filesystem::remove(
          std::string(img_root_directory) + "/" + file_name, ec);
      if (!ec) {
        if (!removed)
          LOG_WARN << "file: " << file_name << " no found!";
      } else {
        LOG_WARN << "file: " << file_name << " remove failed!";
      }
    }
  }
}
} // namespace lawdoc::ocr