#include "TEntities.h"
#include "TFile.h"
#include "TUser.h"

using namespace drogon_model::lawdoc;

namespace lawdoc {
class t_file;
class t_user;
class t_entities;

template <class T> class traits {};
template <> class traits<t_file> {
public:
  using modelt = TFile;
};
template <> class traits<t_user> {
public:
  using modelt = TUser;
};
template <> class traits<t_entities> {
public:
  using modelt = TEntities;
};
} // namespace lawdoc