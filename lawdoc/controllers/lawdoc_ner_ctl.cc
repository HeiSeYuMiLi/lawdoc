#include "lawdoc_ner_ctl.h"
#include "db/entity.h"
#include "ocr/ocr.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <drogon/utils/Utilities.h>
#include <fstream>

namespace lawdoc {
using jsonv = Json::Value;

Task<std::string> handle_pdf(std::string const &file_uuid,
                             std::string const &file_type,
                             std::string const &token) {
  auto img_names = ocr::pdf2image(file_uuid + "." + file_type);
  auto uuid = drogon::utils::getUuid();
  std::ofstream out("../file/" + uuid + ".txt");
  for (auto &&name : img_names)
    out << ocr::parse_image(name);
  if (out.is_open()) {
    out.close();
  } else {
    LOG_ERROR << "file don't open";
    co_return {};
  }

  // 存到数据库
  t_file::modelt model{};
  model.setFileName("");
  model.setFileType("txt");
  model.setFileUuid(uuid);
  model.setSourceFile(file_uuid);
  model.setUserUuid(token);
  co_return (co_await t_file::coro_insert(model)) ? uuid : std::string{};
}

Task<> ner_ctl::ner(HttpRequestPtr req, FUNCTION callback) {
  // 1.根据文件名去本地目录中查找文件
  // 2.根据文件类型选择读取方式（pdf文件先转为图片然后ocr识别，txt文件直接提取文件内容，图片格式直接ocr识别，word再说）
  // 3.将文本发送模型识别，然后存储结果，返回前端
  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto file_uuid = req_json["file_uuid"].asString();
  auto file_type = req_json["file_type"].asString();
  auto token = req->getHeader("token");
  std::string uuid{};
  if (file_type == "pdf") {
    uuid = co_await handle_pdf(file_uuid, file_type, token);
  } else if (file_type == "word") {
    //...
  } else if (file_type == "txt") {

  } else if (file_type == "png" || file_type == "jpg") {
  }

  auto client = drogon::HttpClient::newHttpClient("http://localhost:8000");
  std::ifstream file("../file/" + uuid + ".txt");
  std::stringstream buff;
  if (file.is_open()) {
    buff << file.rdbuf();
    file.close();
  } else {
    LOG_ERROR << "file don't open";
    callback(utils::error("error", 183));
    co_return;
  }

  jsonv rjson;
  rjson["text"] = buff.str();
  auto request = drogon::HttpRequest::newHttpJsonRequest(rjson);
  request->setPath("/ner");
  request->setMethod(drogon::Post);
  jsonv resp_json{};
  try {
    auto resp = co_await client->sendRequestCoro(request);
    auto json_ptr = resp->getJsonObject();
    if (json_ptr) {
      resp_json = *json_ptr;
    }
  } catch (const std::exception &e) {
    LOG_ERROR << e.what();
  }
  if (!resp_json.empty()) {
    t_entities::modelt model{};
    model.setEntities(utils::serialize(resp_json));
    model.setFileUuid(file_uuid);
    if (co_await t_entities::coro_insert(model)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(resp_json));
      co_return;
    }
  }
  callback(utils::error("error", 123));
}
} // namespace lawdoc
