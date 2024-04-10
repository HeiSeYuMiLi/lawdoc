#include "src/captcha.h"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include <drogon/orm/Mapper.h>

int main() {
  // drogon::app().registerHandler(
  //     "/lawdoc/signin/phone",
  //     [](const drogon::HttpRequestPtr &,
  //        std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
  //       callback(drogon::HttpResponse::newHttpJsonResponse(Json::Value()));
  //     },
  //     {drogon::Options});
  // drogon::app().registerPostHandlingAdvice(
  //     [](const drogon::HttpRequestPtr &, const drogon::HttpResponsePtr &resp)
  //     {
  //       resp->addHeader("Access-Control-Allow-Origin", "*");
  //       resp->addHeader("Access-Control-Allow-Methods",
  //                       "GET, POST, PUT, DELETE");
  //       resp->addHeader("Access-Control-Allow-Headers",
  //                       "Content-Type, Authorization");
  //       resp->addHeader("Access-Control-Max-Age", "1728000");
  //     });

  drogon::app().addListener("0.0.0.0", 10086);
  drogon::app().loadConfigFile("../config.json");
  drogon::app().run();
  return 0;
}
