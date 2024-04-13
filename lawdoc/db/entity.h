#include "db.h"

namespace lawdoc {
class t_file : public db<t_file> {};
class t_user : public db<t_user> {
public:
  static void async_update_passwd_by_uuid(std::string_view uuid,
                                          std::string_view passwd,
                                          FUNCTION_BOOL &&callback) {
    mapper mp(drogon::app().getDbClient());
    drogon::orm::Criteria crit{"uuid", uuid};
    mp.updateBy(
        {"password"},
        [callback](auto &&) {
          LOG_INFO << "table: t_user update successful";
          if (callback)
            callback(true);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
          LOG_ERROR << "error: " << e.base().what();
          if (callback)
            callback(false);
        },
        crit, passwd);
  }
  static drogon::Task<modelt> query_by_uuid(std::string_view uuid) {
    criteria crit{};
    crit.set_crit("uuid", "=", std::string(uuid));
    auto users = co_await coro_query(crit);
    co_return users.size() == 1 ? users[0] : modelt{};
  }
  static drogon::Task<bool> check_uuid(std::string_view uuid) {
    auto res = co_await query_by_uuid(uuid);
    co_return res.getValueOfId();
  }
};
class t_entities : public db<t_entities> {};
} // namespace lawdoc
