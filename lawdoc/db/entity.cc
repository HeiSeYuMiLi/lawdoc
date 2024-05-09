#include "entity.h"

using namespace lawdoc;
drogon::Task<t_user::modelt> t_user::query_by_uuid(std::string_view uuid) {
  criteria crit{};
  crit.set_crit("uuid", "=", std::string(uuid));
  auto users = co_await coro_query(crit);
  co_return users.size() == 1 ? users[0] : modelt{};
}
drogon::Task<bool> t_user::async_update_by_uuid(std::string_view uuid,
                                                std::string_view name,
                                                std::string_view passwd,
                                                int sex) {
  auto user = co_await query_by_uuid(uuid);
  int targ{};
  if (!name.empty() && name != user.getValueOfName()) {
    user.setName(std::string(name));
    targ++;
  }
  if (!passwd.empty() && passwd != user.getValueOfPassword()) {
    user.setPassword(std::string(passwd));
    targ++;
  }
  if (sex != user.getValueOfSex()) {
    user.setSex(sex);
    targ++;
  }

  co_return targ != 0 ? (co_await coro_update(user)) : false;
}
drogon::Task<bool> t_user::check_uuid(std::string_view uuid) {
  auto res = co_await query_by_uuid(uuid);
  co_return res.getValueOfId();
}
drogon::Task<t_user::modelt> t_user::query_by_id(int id) {
  criteria crit{};
  crit.set_crit("id", "=", std::to_string(id));
  auto users = co_await coro_query(crit);
  co_return users.size() == 1 ? users[0] : modelt{};
}
drogon::Task<bool> t_file::delete_file(std::string_view file_uuid) {
  auto trans = co_await drogon::app().getDbClient()->newTransactionCoro();
  coro_mapper mp(trans);
  drogon::orm::CoroMapper<t_entities::modelt> mp2(trans);
  drogon::orm::Criteria crit{"file_uuid", file_uuid};
  drogon::orm::Criteria crit2{"source_file", file_uuid};
  crit2 = crit2 || crit;
  try {
    co_await mp.deleteBy(crit2);
    co_await mp2.deleteBy(crit);
    LOG_INFO << "table: t_file delete successful";
    LOG_INFO << "table: t_entities delete successful";
    co_return true;
  } catch (drogon::orm::DrogonDbException const &e) {
    LOG_ERROR << "error: " << e.base().what();
    co_return false;
  }
}
drogon::Task<bool> t_entities::insert(modelt const &model) {
  auto trans = co_await drogon::app().getDbClient()->newTransactionCoro();
  coro_mapper mp(trans);
  drogon::orm::CoroMapper<t_file::modelt> mp2(trans);
  drogon::orm::Criteria crit{"file_uuid", model.getValueOfFileUuid()};
  try {
    co_await mp.insert(model);
    co_await mp2.updateBy({"status"}, crit, 1);
    LOG_INFO << "table: t_file update successful";
    LOG_INFO << "table: t_entities insert successful";
    co_return true;
  } catch (drogon::orm::DrogonDbException const &e) {
    LOG_ERROR << "error: " << e.base().what();
    co_return false;
  }
}