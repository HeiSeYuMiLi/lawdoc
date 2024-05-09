#include "lawdoc_ner_ctl.h"
#include "db/entity.h"
#include "src/ocr.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <fstream>
#include <string>

namespace lawdoc {
using jsonv = Json::Value;

Task<bool> save_txt(std::string const &uuid, std::string const &file_uuid,
                    std::string const &token) {
  t_file::modelt model{};
  model.setFileName("");
  model.setFileType("txt");
  model.setFileUuid(uuid);
  model.setSourceFile(file_uuid);
  model.setUserId((co_await t_user::query_by_uuid(token)).getValueOfId());
  co_return co_await t_file::coro_insert(model);
}

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

  co_return (co_await save_txt(uuid, file_uuid, token)) ? uuid : std::string{};
}

Task<std::string> handle_img(std::string const &file_uuid,
                             std::string const &file_type,
                             std::string const &token) {
  auto uuid = drogon::utils::getUuid();
  std::ofstream out("../file/" + uuid + ".txt");
  out << ocr::parse_image(file_uuid + "." + file_type,"../file/");
  if (out.is_open()) {
    out.close();
  } else {
    LOG_ERROR << "file don't open";
    co_return {};
  }

  co_return (co_await save_txt(uuid, file_uuid, token)) ? uuid : std::string{};
}

Task<jsonv> send_req(std::string_view text) {
  auto client = drogon::HttpClient::newHttpClient("http://localhost:8000");
  jsonv json;
  json["text"] = std::string(text);
  auto request = drogon::HttpRequest::newHttpJsonRequest(json);
  request->setPath("/ner");
  request->setMethod(drogon::Post);
  jsonv resp_json{};
  try {
    auto resp = co_await client->sendRequestCoro(request);
    auto json_ptr = resp->getJsonObject();
    if (json_ptr)
      resp_json = *json_ptr;
  } catch (const std::exception &e) {
    LOG_ERROR << e.what();
  }
  co_return resp_json;
}

Task<> ner_ctl::ner(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto file_uuid = req_json["file_uuid"].asString();
  auto file_type = req_json["file_type"].asString();
  std::string uuid{};
  if (file_type == "pdf") {
    uuid = co_await handle_pdf(file_uuid, file_type, token);
  } else if (file_type == "txt") {
    uuid = file_uuid;
  } else if (file_type == "png" || file_type == "jpg") {
    uuid = co_await handle_img(file_uuid, file_type, token);
  }
  if (uuid.empty()) {
    callback(utils::error("文件格式错误", 456));
    co_return;
  }

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

  auto json = co_await send_req(buff.str());
  if (!json.empty()) {
    t_entities::modelt model{};
    model.setEntities(utils::serialize(json));
    model.setFileUuid(file_uuid);
    if (co_await t_entities::insert(model)) {
      callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
      co_return;
    }
  }
  callback(utils::error("error", 123));
}

Task<> ner_ctl::update_entity(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto file_uuid = req_json["file_uuid"].asString();
  auto begin = req_json["begin"].asInt();
  auto end = req_json["end"].asInt();
  auto index = req_json["index"].asInt();
  auto value = req_json["entity"].asString();

  if (begin > end) {
    callback(utils::error("参数错误，起始位置大于结束位置！", 456));
    co_return;
  }

  // 先查询的到实体
  criteria crit{};
  crit.set_crit("file_uuid", "=", file_uuid);
  auto entities = co_await t_entities::coro_query(crit);
  auto &&entity = entities[0];
  Json::Reader reader;
  jsonv ejson{};
  jsonv default_json{};
  reader.parse(entity.getValueOfEntities(), ejson);
  auto j = ejson.get(index, default_json);
  if (j.empty()) {
    callback(utils::error("索引错误，请联系管理员。", 456));
    co_return;
  }
  if (begin == j["begin"].asInt() && end == j["end"].asInt()) {
    callback(utils::error("参数未改变，修改失败！", 456));
    co_return;
  }
  ejson[index]["value"] = value;
  ejson[index]["begin"] = begin;
  ejson[index]["end"] = end;

  entity.setEntities(utils::serialize(ejson));
  if (co_await t_entities::coro_update(entity))
    callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
  else
    callback(utils::error("error", 123));
}

Task<> ner_ctl::delete_entity(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto json_ptr = req->getJsonObject();
  if (!json_ptr) {
    callback(utils::error("参数缺失", 456));
    co_return;
  }
  auto req_json{*json_ptr};

  auto file_uuid = req_json["file_uuid"].asString();
  auto index = req_json["index"].asInt();

  // 先查询的到实体
  criteria crit{};
  crit.set_crit("file_uuid", "=", file_uuid);
  auto entities = co_await t_entities::coro_query(crit);
  auto &&entity = entities[0];
  Json::Reader reader;
  jsonv ejson{};
  jsonv default_json{};
  reader.parse(entity.getValueOfEntities(), ejson);
  ejson.removeIndex(index, &default_json);

  entity.setEntities(utils::serialize(ejson));
  if (co_await t_entities::coro_update(entity))
    callback(drogon::HttpResponse::newHttpJsonResponse(utils::cb_json()));
  else
    callback(utils::error("error", 123));
}
} // namespace lawdoc
