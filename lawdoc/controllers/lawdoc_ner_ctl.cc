#include "lawdoc_ner_ctl.h"
#include "utils/error.h"
#include <fstream>

namespace lawdoc {
using jsonv = Json::Value;



Task<> ner_ctl::ner(HttpRequestPtr, FUNCTION callback) {
  // 1.根据文件名去数据库中查找文件
  // 2.根据文件类型选择读取方式（pdf文件先转为图片然后ocr识别，txt文件直接提取文件内容，图片格式直接ocr识别，word再说）
  // 3.将文本发送模型识别，然后存储结果，返回前端

  auto client = drogon::HttpClient::newHttpClient("http://localhost:8000");
  std::ifstream file("../legal_instrument/1711548569613272_1.txt");
  std::stringstream buff;
  if (file.is_open()) {
    buff << file.rdbuf();
    file.close();
  } else {
    callback(utils::error("error", 123));
    co_return;
  }

  jsonv json;
  json["text"] = buff.str();
  auto req = drogon::HttpRequest::newHttpJsonRequest(json);
  req->setPath("/items");
  req->setMethod(drogon::Post);
  try {
    auto resp = co_await client->sendRequestCoro(req);
    auto json_ptr = resp->getJsonObject();
    if (json_ptr) {
      auto json = *json_ptr;
      callback(drogon::HttpResponse::newHttpJsonResponse(json));
      co_return;
    }
  } catch (const std::exception &e) {
    LOG_ERROR << e.what();
  }
  callback(utils::error("error", 123));
}
} // namespace lawdoc
