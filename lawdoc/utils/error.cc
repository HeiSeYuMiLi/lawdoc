#include "error.h"

namespace lawdoc::utils {
void error(std::string_view msg) { LOG_ERROR << "Error: " << msg; }
} // namespace lawdoc::utils