#include "TFile.h"
#include <cstdint>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include <drogon/orm/Mapper.h>
#include <fstream>

int main() {
  // drogon::app().registerBeginningAdvice([]() {
  //   std::ifstream file("../legal_instrument/1711548569613272_1.txt",
  //                      std::ios::binary);
  //   if (!file) {
  //     std::cerr << "无法打开文件" << std::endl;
  //     return;
  //   }
  //   Json::Value json;
  //   json["file_name"] = "456";
  //   json["file_type"] = ".txt";
  //   drogon_model::lawdoc::TFile f(json);
  //   f.setFileData(std::vector<char>(std::istreambuf_iterator<char>(file), {}));
  //   auto client = drogon::app().getDbClient();
  //   drogon::orm::Mapper<drogon_model::lawdoc::TFile> mp(client);
  //   try {
  //     mp.insert(f);
  //     std::cout << "insert successful" << std::endl;
  //   } catch (drogon::orm::DrogonDbException const &e) {
  //     std::cout << e.base().what() << std::endl;
  //   }

    // auto client = drogon::app().getDbClient();
    // drogon::orm::Mapper<drogon_model::lawdoc::TFile> mp(client);
    // try {
    //   auto f = mp.findByPrimaryKey(2);
    //   auto v = f.getValueOfFileDataAsString();
    //   std::cout << "file_data: " << v
    //             << std::endl;
    // } catch (drogon::orm::DrogonDbException const &e) {
    //   std::cout << e.base().what() << std::endl;
    // }
  // });

  drogon::app().addListener("0.0.0.0", 10086);
  drogon::app().loadConfigFile("../config.json");
  drogon::app().run();
  return 0;
}
