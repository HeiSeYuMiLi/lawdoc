#include "TFile.h"

using namespace drogon_model::lawdoc;

namespace lawdoc {
class t_file;

template <class T> class traits {};
template <> class traits<t_file> {
public:
  using modelt = TFile;
};
} // namespace lawdoc