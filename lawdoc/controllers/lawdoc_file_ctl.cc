#include "lawdoc_file_ctl.h"
#include "db/entity.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/utils/Utilities.h>
#include <json/reader.h>
#include <json/value.h>

using namespace lawdoc;
using jsonv = Json::Value;

Task<bool> check_file_name(std::string_view file_name) {
  criteria crit;
  crit.set_crit("file_name", "=", std::string(file_name));
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
  if (!co_await check_file_name(file_name)) {
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

  criteria crit{};
  crit.set_crit(
      "user_id", "=",
      std::to_string((co_await t_user::query_by_uuid(token)).getValueOfId()));
  auto files = co_await t_file::coro_query(crit);
  auto json{utils::cb_json()};
  json["data"]["files"] = Json::arrayValue;
  for (auto &&file : files) {
    jsonv j{};
    j["fileName"] = file.getValueOfFileName();
    j["fileUuid"] = file.getValueOfFileUuid();
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
  auto files = co_await t_file::coro_query(crit);
  auto entities = co_await t_entities::coro_query(crit);

  auto json{utils::cb_json()};
  json["data"] = files[0].toJson();

  Json::Reader reader;
  jsonv ejson{};
  reader.parse(entities[0].getValueOfEntities(),ejson);
  // json["data"]["nh"]=ejson["人名"];
  // json["data"]["ns"]=ejson["地名"];
  // json["data"]["nt"]=ejson["时间"];
  json["data"]["entities"] = ejson;
  callback(HttpResponse::newHttpJsonResponse(json));
}
