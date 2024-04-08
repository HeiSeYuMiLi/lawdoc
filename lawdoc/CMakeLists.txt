cmake_minimum_required(VERSION 3.5)
project(lawdoc CXX)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-deprecated")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-deprecated-declarations")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=address -fno-omit-frame-pointer -fno-optimize-sibling-calls -g")

include(CheckIncludeFileCXX)

set(CMAKE_CXX_STANDARD 26)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(${PROJECT_NAME} main.cc)

find_package(Drogon CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)

set(Tesseract_INCLUDE_DIRS /usr/local/include)
set(Leptonica_INCLUDE_DIRS /usr/include/leptonica)
set(Poppler_INCLUDE_DIRS /usr/include/poppler/cpp)
set(Tesseract_LIBRARIES /usr/local/lib/libtesseract.so)
set(Leptonica_LIBRARIES /usr/lib/x86_64-linux-gnu/liblept.so)
set(Poppler_LIBRARIES /usr/lib/x86_64-linux-gnu/libpoppler-cpp.so)
include_directories(${Tesseract_INCLUDE_DIRS})
include_directories(${Leptonica_INCLUDE_DIRS})
include_directories(${Poppler_INCLUDE_DIRS})
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE ${Tesseract_LIBRARIES})
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE ${Leptonica_LIBRARIES})
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE ${Poppler_LIBRARIES})

# ##############################################################################

aux_source_directory(controllers CTL_SRC)
aux_source_directory(filters FILTER_SRC)
aux_source_directory(plugins PLUGIN_SRC)
aux_source_directory(models MODEL_SRC)
aux_source_directory(ocr OCR_SRC)
aux_source_directory(utils UTILS_SRC)
aux_source_directory(db DB_SRC)
aux_source_directory(src src_SRC)

drogon_create_views(${PROJECT_NAME} ${CMAKE_CURRENT_SOURCE_DIR}/views
                    ${CMAKE_CURRENT_BINARY_DIR})

target_include_directories(${PROJECT_NAME}
                           PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
                                   ${CMAKE_CURRENT_SOURCE_DIR}/models)
target_sources(${PROJECT_NAME}
               PRIVATE
               ${SRC_DIR}
               ${CTL_SRC}
               ${FILTER_SRC}
               ${PLUGIN_SRC}
               ${MODEL_SRC}
               ${OCR_SRC}
               ${UTILS_SRC}
               ${DB_SRC}
               ${SRC_SRC})
# ##############################################################################
# uncomment the following line for dynamically loading views 
# set_property(TARGET ${PROJECT_NAME} PROPERTY ENABLE_EXPORTS ON)

# ##############################################################################

add_subdirectory(test)
