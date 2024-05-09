#include "db.h"
#include <drogon/orm/Criteria.h>

namespace lawdoc {
class t_user : public db<t_user> {
public:
  static drogon::Task<modelt> query_by_uuid(std::string_view uuid);
  static drogon::Task<bool> async_update_by_uuid(std::string_view uuid,
                                                 std::string_view name,
                                                 std::string_view passwd,
                                                 int sex);
  static drogon::Task<bool> check_uuid(std::string_view uuid);
  static drogon::Task<modelt> query_by_id(int id);
};
class t_file : public db<t_file> {
public:
  static drogon::Task<bool> delete_file(std::string_view file_uuid);
};
class t_entities : public db<t_entities> {
public:
  static drogon::Task<bool> insert(modelt const &model);
};
} // namespace lawdoc
