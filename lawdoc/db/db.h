#include "traits.h"
#include <drogon/drogon.h>
#include <drogon/orm/Mapper.h>

using namespace drogon_model::lawdoc;

namespace lawdoc {

struct criteria {
  int page{0};
  int size{10};
  drogon::orm::Criteria crit{};
  std::string col{"id"};
  drogon::orm::SortOrder order{drogon::orm::SortOrder::ASC};

  criteria &set_crit(std::string const &col, std::string const &opera,
                     std::string const &value) {
    Json::Value json{Json::arrayValue};
    json.append(col);
    json.append(opera);
    json.append(value);
    if (crit)
      crit = crit && drogon::orm::Criteria(json);
    else
      crit = drogon::orm::Criteria(json);
    return *this;
  }
};

template <class T> class db {
public:
  using jsonv = Json::Value;
  using modelt = traits<T>::modelt;
  using mapper = drogon::orm::Mapper<modelt>;
  using coro_mapper = drogon::orm::CoroMapper<modelt>;
  using FUNCTION_BOOL = std::function<void(bool)>;
  using FUNCTION_VEC = std::function<void(std::vector<modelt> const &)>;

public:
  // 异步*****************************************************
  static void async_insert(modelt const &model,
                           FUNCTION_BOOL &&callback = nullptr) {
    mapper mp(drogon::app().getDbClient());
    mp.insert(
        model,
        [callback](auto &&) {
          LOG_INFO << "table: " << table_name_ << " insert successful";
          if (callback)
            callback(true);
        },
        [callback](drogon::orm::DrogonDbException const &e) {
          LOG_ERROR << "error: " << e.base().what();
          if (callback)
            callback(false);
        });
  }
  static void async_insert(jsonv const &json,
                           FUNCTION_BOOL &&callback = nullptr) {
    async_insert(modelt(json), std::move(callback));
  }

  static void async_update(modelt const &model,
                           FUNCTION_BOOL &&callback = nullptr) {
    mapper mp(drogon::app().getDbClient());
    mp.update(
        model,
        [callback](auto &&) {
          LOG_INFO << "table: " << table_name_ << " update successful";
          if (callback)
            callback(true);
        },
        [callback](drogon::orm::DrogonDbException const &e) {
          LOG_ERROR << "error: " << e.base().what();
          if (callback)
            callback(false);
        });
  }
  static void async_update(jsonv const &json,
                           FUNCTION_BOOL &&callback = nullptr) {
    async_update(modelt(json), std::move(callback));
  }

  static void async_query(criteria const &crit,
                          FUNCTION_VEC &&callback = nullptr) {
    mapper mp(drogon::app().getDbClient());
    mp.orderBy(crit.col, crit.order)
        .limit(crit.size)
        .offset(crit.page * crit.size)
        .findBy(
            crit.crit,
            [callback](auto &&vec) {
              LOG_INFO << "table: " << table_name_ << " query successful";
              if (callback)
                callback(vec);
            },
            [callback](drogon::orm::DrogonDbException const &e) {
              LOG_ERROR << "error: " << e.base().what();
              if (callback)
                callback(std::vector<modelt>{});
            });
  }

  // 协程*****************************************************
  static drogon::Task<bool> coro_insert(modelt const &model) {
    coro_mapper mp(drogon::app().getDbClient());
    try {
      co_await mp.insert(model);
      LOG_INFO << "table: " << table_name_ << " insert successful";
      co_return true;
    } catch (drogon::orm::DrogonDbException const &e) {
      LOG_ERROR << "error: " << e.base().what();
      co_return false;
    }
  }
  static drogon::Task<bool> coro_insert(jsonv const &json) {
    co_return co_await coro_insert(modelt{json});
  }

  static drogon::Task<bool> coro_update(modelt const &model) {
    coro_mapper mp(drogon::app().getDbClient());
    try {
      co_await mp.update(model);
      LOG_INFO << "table: " << table_name_ << " update successful";
      co_return true;
    } catch (drogon::orm::DrogonDbException const &e) {
      LOG_ERROR << "error: " << e.base().what();
      co_return false;
    }
  }
  static drogon::Task<bool> coro_update(jsonv const &json) {
    co_return co_await coro_update(modelt{json});
  }

  static drogon::Task<std::vector<modelt>> coro_query(criteria const &crit) {
    coro_mapper mp(drogon::app().getDbClient());
    try {
      auto awaiter=mp.orderBy(crit.col, crit.order);
      if(crit.size!=-1)
        awaiter.limit(crit.size).offset(crit.page * crit.size);
      auto res = co_await awaiter.findBy(crit.crit);
      LOG_INFO << "table: " << table_name_ << " query successful";
      co_return res;
    } catch (drogon::orm::DrogonDbException const &e) {
      LOG_ERROR << "error: " << e.base().what();
      co_return std::vector<modelt>{};
    }
  }

  static drogon::Task<bool> coro_delete(criteria const &crit) {
    coro_mapper mp(drogon::app().getDbClient());
    try {
      co_await mp.deleteBy(crit.crit);
      LOG_INFO << "table: " << table_name_ << " delete successful";
      co_return true;
    } catch (drogon::orm::DrogonDbException const &e) {
      LOG_ERROR << "error: " << e.base().what();
      co_return false;
    }
  }

  static drogon::Task<int> coro_count(criteria const &crit) {
    coro_mapper mp(drogon::app().getDbClient());
    try {
      auto res = co_await mp.count(crit.crit);
      LOG_INFO << "table: " << table_name_ << " query count successful";
      co_return res;
    } catch (drogon::orm::DrogonDbException const &e) {
      LOG_ERROR << "error: " << e.base().what();
      co_return false;
    }
  }

private:
  inline static std::string table_name_{modelt::tableName};
};
} // namespace lawdoc
