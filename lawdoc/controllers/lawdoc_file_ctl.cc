#include "lawdoc_file_ctl.h"
#include "db/entity.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <fstream>

using namespace lawdoc;
using jsonv = Json::Value;

Task<bool> check_file_name(std::string_view file_name, std::string_view token) {
  auto user = co_await t_user::query_by_uuid(token);
  criteria crit;
  crit.set_crit("file_name", "=", std::string(file_name))
      .set_crit("user_id", "=", std::to_string(user.getValueOfId()));
  auto files = co_await t_file::coro_query(crit);
  co_return files.size() == 0;
}

Task<> file_ctl::upload_file(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  using namespace std::literals;
  // 检查文件数量
  MultiPartParser file_upload;
  if (file_upload.parse(req) != 0 || file_upload.getFiles().size() != 1) {
    callback(utils::error("必须且只能传一个文件！"sv, 403));
    co_return;
  }

  auto &file = file_upload.getFiles()[0];

  // 检查文件内容
  // auto md5 = file.getMd5();
  // if (md5 != file_upload.getParameter<std::string>("md5")) {
  //   callback(utils::error("文件上传错误！"sv, 403));
  //   return;
  // }
  // 检查文件类型
  auto type = file.getFileExtension();
  if (type != "txt" && type != "pdf" && type != "docx" && type != "png" &&
      type != "jpg") {
    callback(utils::error("文件类型错误！"sv, 403));
    co_return;
  }

  auto file_name = file.getFileName();
  // 检查文件名是否重复
  if (!co_await check_file_name(file_name, token)) {
    callback(utils::error("文件重复！"sv, 403));
    co_return;
  }

  // 保存文件到本地，本地存储的文件名通过uuid命名
  auto uuid = drogon::utils::getUuid();
  file.saveAs("../file/" + uuid + "." + std::string(type));

  // 存储文件信息到数据库
  t_file::modelt model{};
  model.setFileName(file_name);
  model.setFileType(std::string(type));
  model.setFileUuid(uuid);
  model.setUserId((co_await t_user::query_by_uuid(token)).getValueOfId());
  auto json{utils::cb_json()};
  json["data"]["file_uuid"] = uuid;
  json["data"]["file_type"] = std::string(type);
  if (co_await t_file::coro_insert(model))
    callback(HttpResponse::newHttpJsonResponse(json));
  else
    callback(utils::error("error", 123));
}

Task<> file_ctl::get_file_list(HttpRequestPtr req, FUNCTION callback) {
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

  auto keyword = req_json["keyword"].asString();
  auto page = req_json.get("page", 1).asInt();

  criteria crit{};
  crit.page = page - 1;
  crit.set_crit("user_id", "=",
                std::to_string(
                    (co_await t_user::query_by_uuid(token)).getValueOfId()))
      .set_crit("file_name", "!=", "");
  if (!keyword.empty())
    crit.set_crit("file_name", " like ", "%" + keyword + "%");
  auto files = co_await t_file::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["count"] = co_await t_file::coro_count(crit);
  json["data"]["files"] = Json::arrayValue;
  for (auto &&file : files) {
    jsonv j{};
    j["fileName"] = file.getValueOfFileName();
    j["fileUuid"] = file.getValueOfFileUuid();
    j["status"]=file.getValueOfStatus();
    json["data"]["files"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> file_ctl::get_file(HttpRequestPtr req, FUNCTION callback) {
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

  // 查t_file表
  criteria crit{};
  crit.set_crit("file_uuid", "=", file_uuid);
  auto _ = (co_await t_file::coro_query(crit));
  if (_.empty()) {
    callback(utils::error("获取文件失败", 456));
    co_return;
  }
  auto file = _[0];
  auto entities = co_await t_entities::coro_query(crit);
  if (entities.empty()) {
    callback(utils::error("获取文件失败", 456));
    co_return;
  }

  auto json{utils::cb_json()};
  json["data"] = file.toJson();

  if (file.getValueOfFileType() == "txt") {
    std::ifstream in("../file/" + file_uuid + ".txt");
    std::stringstream buff;
    if (in.is_open()) {
      buff << in.rdbuf();
      json["data"]["file_content"] = buff.str();
      in.close();
    }
  } else {
    criteria crit{};
    crit.set_crit("source_file", "=", file_uuid);
    auto file2 = (co_await t_file::coro_query(crit))[0];
    std::ifstream in("../file/" + file2.getValueOfFileUuid() + ".txt");
    std::stringstream buff;
    if (in.is_open()) {
      buff << in.rdbuf();
      json["data"]["file_content"] = buff.str();
      in.close();
    }
  }

  Json::Reader reader;
  jsonv ejson{};
  reader.parse(entities[0].getValueOfEntities(), ejson);
  json["data"]["entities"] = ejson;

  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> file_ctl::admin_get_file_list(HttpRequestPtr req, FUNCTION callback) {
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

  auto file_name = req_json["file_name"].asString();
  auto file_type = req_json["file_type"].asString();
  auto user_id = req_json["user_id"].asString();
  auto page = req_json.get("page", 1).asInt();

  criteria crit{};
  crit.page = page - 1;
  crit.set_crit("file_name", "!=", "");

  if (!file_name.empty())
    crit.set_crit("file_name", " like ", "%" + file_name + "%");
  if (!file_type.empty())
    crit.set_crit("file_type", " like ", "%" + file_type + "%");
  if (!user_id.empty())
    crit.set_crit("user_id", "=", user_id);

  auto files = co_await t_file::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["count"] = co_await t_file::coro_count(crit);
  json["data"]["files"] = Json::arrayValue;
  for (auto &&file : files) {
    jsonv j = file.toJson();
    auto user = co_await t_user::query_by_id(file.getValueOfUserId());
    j["user_name"] = user.getValueOfName();
    json["data"]["files"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> file_ctl::admin_get_all_file_list(HttpRequestPtr req,
                                         FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  criteria crit{};
  crit.size = -1;
  crit.set_crit("file_name", "!=", "");

  auto files = co_await t_file::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["files"] = Json::arrayValue;
  for (auto &&file : files) {
    jsonv j{};
    j["id"] = file.getValueOfId();
    j["file_type"] = file.getValueOfFileType();
    j["create_time"] = file.getValueOfCreateTime().toDbStringLocal();
    json["data"]["files"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> file_ctl::user_get_all_file_list(HttpRequestPtr req, FUNCTION callback) {
  auto token = req->getHeader("Authorization");
  if (!co_await t_user::check_uuid(token)) {
    callback(utils::error("登录失效", 456));
    co_return;
  }

  auto user = co_await t_user::query_by_uuid(token);

  criteria crit{};
  crit.size = -1;
  crit.set_crit("user_id", "=", std::to_string(user.getValueOfId()))
      .set_crit("file_name", "!=", "");

  auto files = co_await t_file::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["files"] = Json::arrayValue;
  for (auto &&file : files) {
    jsonv j{};
    j["id"] = file.getValueOfId();
    j["file_type"] = file.getValueOfFileType();
    j["create_time"] = file.getValueOfCreateTime().toDbStringLocal();
    json["data"]["files"].append(j);
  }
  callback(HttpResponse::newHttpJsonResponse(json));
}

Task<> file_ctl::update_file_name(HttpRequestPtr req, FUNCTION callback) {
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

  auto file_name = req_json["file_name"].asString();
  auto file_uuid = req_json["file_uuid"].asString();

  criteria crit{};
  crit.set_crit("file_uuid", "=", file_uuid)
      .set_crit("file_name", "!=", file_name);
  auto files = co_await t_file::coro_query(crit);
  if (files.empty()) {
    callback(utils::error("名称重复，请重新输入！", 456));
    co_return;
  }
  auto &&file = files[0];
  file.setFileName(file_name + "." + file.getValueOfFileType());
  if (co_await t_file::coro_update(file))
    callback(HttpResponse::newHttpJsonResponse(utils::cb_json()));
  else
    callback(utils::error("error", 456));
}

Task<> file_ctl::delete_file(HttpRequestPtr req, FUNCTION callback) {
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
  if (co_await t_file::delete_file(file_uuid))
    callback(HttpResponse::newHttpJsonResponse(utils::cb_json()));
  else
    callback(utils::error("error", 456));
}
