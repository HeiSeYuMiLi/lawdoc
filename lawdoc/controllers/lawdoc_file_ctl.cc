#include "lawdoc_file_ctl.h"
#include "db/entity.h"
#include "utils/error.h"
#include "utils/utils.h"
#include <drogon/utils/Utilities.h>

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
  std::cout << "md5: " << md5 << std::endl;
  // if (md5 != file_upload.getParameter<std::string>("md5")) {
  //   callback(utils::error("文件上传错误！"sv, 403));
  //   return;
  // }
  //保存文件到本地，本地存储的文件名通过uuid命名
  auto uuid=drogon::utils::getUuid();
  file.saveAs("../pdf/"+uuid+"."+std::string(file.getFileExtension()));
  t_file::modelt m{};
  m.setFileName(file.getFileName());
  m.setFileType(std::string(file.getFileExtension()));
  m.setFileUuid(uuid);
  t_file::async_insert(m, [callback](bool targ) {
    if (targ) {
      auto resp = HttpResponse::newHttpJsonResponse(utils::cb_json());
      callback(resp);
    } else {
      callback(utils::error("error", 123));
    }
  });
}
