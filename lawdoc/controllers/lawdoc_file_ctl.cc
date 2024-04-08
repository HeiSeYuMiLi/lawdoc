#include "lawdoc_file_ctl.h"
#include "db/entity.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <drogon/utils/Utilities.h>

using namespace lawdoc;
using jsonv = Json::Value;

void file_ctl::upload_file(const HttpRequestPtr &req, FUNCTION &&callback) {
  using namespace std::literals;
  // 检查文件数量
  MultiPartParser file_upload;
  if (file_upload.parse(req) != 0 || file_upload.getFiles().size() != 1) {
    callback(utils::error("必须且只能传一个文件！"sv, 403));
    return;
  }

  auto &file = file_upload.getFiles()[0];

  // 检查文件内容
  auto md5 = file.getMd5();
  if (md5 != file_upload.getParameter<std::string>("md5")) {
    callback(utils::error("文件上传错误！"sv, 403));
    return;
  }
  // 检查文件类型
  auto type = file.getFileExtension();
  if (type != "txt" && type != "pdf" && type != "word" && type != "png" &&
      type != "jpg") {
    callback(utils::error("文件类型错误！"sv, 403));
    return;
  }

  // 保存文件到本地，本地存储的文件名通过uuid命名
  auto uuid = drogon::utils::getUuid();
  file.saveAs("../file/" + uuid + "." + std::string(type));

  // 存储文件信息到数据库
  t_file::modelt model{};
  model.setFileName(file.getFileName());
  model.setFileType(std::string(type));
  model.setFileUuid(uuid);
  model.setUserUuid(req->getHeader("token"));
  auto json{utils::cb_json()};
  json["data"]["file_uuid"] = uuid;
  json["data"]["file_type"] = std::string(type);
  t_file::async_insert(model, [json = std::move(json),
                               callback = std::move(callback)](bool targ) {
    if (targ) {
      auto resp = HttpResponse::newHttpJsonResponse(json);
      callback(resp);
    } else {
      callback(utils::error("error", 123));
    }
  });
}
