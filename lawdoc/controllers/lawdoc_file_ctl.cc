#include "lawdoc_file_ctl.h"
#include "utils/error.h"
#include "utils/utils.h"

using namespace lawdoc;
using jsonv = Json::Value;

void file_ctl::upload_file(const HttpRequestPtr &req, FUNCTION &&callback) {
  using namespace std::literals;
  // req格式：文件+md5值
  MultiPartParser file_upload;
  if (file_upload.parse(req) != 0 || file_upload.getFiles().size() != 1) {
    callback(utils::error("必须且只能传一个文件！"sv, 403));
    return;
  }

  auto &file = file_upload.getFiles()[0];
  auto md5 = file.getMd5();
  if (md5 != file_upload.getParameter<std::string>("md5")) {
    callback(utils::error("文件上传错误！"sv, 403));
    return;
  }

  auto new_file = utils::generate_file_name(file.getFileName());
  auto json = utils::cb_json();
  json["data"]["file_name"] = new_file;
  auto resp = HttpResponse::newHttpJsonResponse(json);
  file.saveAs(new_file);
  callback(resp);
}
