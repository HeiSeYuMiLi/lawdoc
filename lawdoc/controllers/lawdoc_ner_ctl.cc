#include "lawdoc_ner_ctl.h"
#include "ocr/ocr.h"
#include "utils/error.h"
#include <drogon/HttpClient.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/UploadFile.h>
#include <drogon/drogon_callbacks.h>

using namespace lawdoc;
using jsonv = Json::Value;

void text(ner_ctl::FUNCTION callback) {
  auto client = drogon::HttpClient::newHttpClient("https://localhost:8000");
  drogon::UploadFile file("../legal_instrument/1711548569613272_1.txt");
  std::vector<drogon::UploadFile> vec;
  vec.push_back(file);
  auto req = drogon::HttpRequest::newFileUploadRequest(vec);
  req->setPath("/items");
  client->sendRequest(
      req, [callback](ReqResult req_result, const HttpResponsePtr &resp) {
        auto json_ptr = resp->getJsonObject();
        if (json_ptr) {
          auto json = *json_ptr;
          callback(drogon::HttpResponse::newHttpJsonResponse(json));
        }
      });
}

Task<> ner_ctl::ner(HttpRequestPtr req, FUNCTION callback) {
  text(std::move(callback));
  co_return;
  //   auto json_ptr = req->getJsonObject();
  //   if (!json_ptr) {
  //     callback(utils::error("error", 123));
  //     co_return;
  //   }
  //   auto json = *json_ptr;
  //   // 转图片
  //   auto img_path_vec = ocr::pdf2image(json["file_path"].asString());

  //   for (auto &&img_path : img_path_vec) {
  //     // ocr识别
  //     ocr::parse_image(img_path);
  //     // 实体抽取
  //   }
}
