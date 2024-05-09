#include "ocr.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <charconv>
#include <chrono>
#include <drogon/drogon.h>
#include <drogon/utils/Utilities.h>
#include <filesystem>
// #include <fstream>
#include <memory>
#include <poppler-document.h>
#include <poppler-image.h>
#include <poppler-page-renderer.h>
#include <poppler-page.h>

namespace lawdoc::ocr {

std::vector<std::string> supported_img_type() {
  return poppler::image::supported_image_formats();
}

std::vector<std::string> pdf2image(std::string_view file_name) {
  // 创建一个poppler::document对象
  std::unique_ptr<poppler::document> doc(
      poppler::document::load_from_file(FILE_PATH + std::string(file_name)));

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

  // 遍历每一页，然后转为图片
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
    // 给图片取一个随机的名称
    auto img_name = drogon::utils::getUuid() + IMG_TYPE;
    img_names.push_back(img_name);
    if (!img.save(IMG_PATH + img_name, "png")) {
      utils::error("saving to file failed");
      return {};
    }
  }
  return img_names;
}

std::string parse_image(std::string_view img_name, std::string_view img_path) {
  std::unique_ptr<tesseract::TessBaseAPI> api =
      std::make_unique<tesseract::TessBaseAPI>();
  if (api->Init("", "chi_sim")) {
    LOG_ERROR << "Could not initialize tesseract.";
    return {};
  }

  Pix *image = pixRead((std::string(img_path) + std::string(img_name)).data());
  api->SetImage(image);
  auto output = api->GetUTF8Text();
  std::string content{output};
  // 移除空格
  content.erase(std::remove(content.begin(), content.end(), ' '),
                content.end());
  // 移除\n
  // content.erase(std::remove(content.begin(), content.end(), '\n'),
  //               content.end());

  api->End();
  delete[] output;
  pixDestroy(&image);
  return content;
}

void remove_file(std::string_view root_path) {
  auto iter = std::filesystem::directory_iterator(root_path);
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
      bool removed =
          std::filesystem::remove(std::string(root_path) + "/" + file_name, ec);
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