cmake_minimum_required(VERSION 3.27)

project(fcitx5-plugins VERSION 0.1.0)

list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
set(CMAKE_INSTALL_PREFIX /usr)
set(FIND_ROOT_PATH "${PROJECT_BINARY_DIR}/usr")
set(PREBUILDER_INCLUDE_DIR "${FIND_ROOT_PATH}/include")
set(PREBUILDER_LIB_DIR "${FIND_ROOT_PATH}/lib")
set(ENV{PKG_CONFIG_SYSROOT_DIR} "${PROJECT_BINARY_DIR}")
set(ENV{PKG_CONFIG_PATH} "${PREBUILDER_LIB_DIR}/pkgconfig")
# We don't build testing frontends so fake it.
set(Fcitx5ModuleTestFrontend_DIR "${PROJECT_SOURCE_DIR}/cmake")

if (APPLE)
    set(CMAKE_OSX_DEPLOYMENT_TARGET 13) # Also need to update CGO_CFLAGS

    set(APP_CONTENTS_PATH "/Library/Input Methods/Fcitx5.app/Contents")
    set(CMAKE_FIND_ROOT_PATH
        "${APP_CONTENTS_PATH}"
        "${FIND_ROOT_PATH}"
    )
elseif (EMSCRIPTEN)
    list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake/js")
    set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS TRUE)
    set(CMAKE_SHARED_LIBRARY_CREATE_C_FLAGS "-sSIDE_MODULE")
    set(CMAKE_SHARED_LIBRARY_CREATE_CXX_FLAGS "-sSIDE_MODULE")
    add_compile_options(-fPIC -fexceptions)
    list(PREPEND CMAKE_FIND_ROOT_PATH "${FIND_ROOT_PATH}")
    option(ENABLE_DATA "" OFF)
    option(ENABLE_TOOLS "" OFF)
else()
    message(FATAL_ERROR "Unsupported platform")
endif()

# Shared by some fcitx5 engines
option(ENABLE_TEST "" OFF)
option(ENABLE_QT "" OFF)
option(ENABLE_GUI "" OFF)

# anthy
add_subdirectory(fcitx5-anthy)

# bamboo
if (NOT EMSCRIPTEN) # https://github.com/golang/go/issues/55351
add_subdirectory(fcitx5-bamboo)
endif()

# lua and chinese-addons
option(USE_DLOPEN "" OFF)
add_subdirectory(fcitx5-lua)

option(BUILD_SHARED_LIBS "" OFF)
add_subdirectory(libime)
# suppress configure error
install(TARGETS kenlm EXPORT LibIMECoreTargets LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}" COMPONENT lib)

set(LIBIME_INSTALL_PKGDATADIR "../libime")
if (APPLE)
    set(CMAKE_INSTALL_RPATH "${APP_CONTENTS_PATH}/lib") # scel2org5
elseif (EMSCRIPTEN)
    option(ENABLE_CLOUDPINYIN "" OFF)
endif()
add_subdirectory(fcitx5-chinese-addons)
target_link_libraries(chttrans "${PREBUILDER_LIB_DIR}/libmarisa.a")
if (EMSCRIPTEN)
    # Wherever exception is caught there must be explicit link option.
    target_link_libraries(pinyin -fexceptions)
    target_link_libraries(table -fexceptions)
    target_link_libraries(chttrans -fexceptions)
    target_link_libraries(pinyinhelper -fexceptions)
    target_link_libraries(punctuation -fexceptions)
endif()

# chewing
add_subdirectory(fcitx5-chewing)

# hallelujah
add_subdirectory(fcitx5-hallelujah)

# hangul
add_library(Hangul_static STATIC IMPORTED)
set_target_properties(Hangul_static PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libhangul.a"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/hangul-1.0"
)
set(HANGUL_TARGET Hangul_static)
add_subdirectory(fcitx5-hangul)

# mozc
set(MOZC_TARGET
    "-L${PREBUILDER_LIB_DIR}"
    "-lmozc-static"
    "-lutf8_validity"
    "-lprotobuf"
    "-labsl"
    "-Wl,-framework,CoreFoundation"
)
add_subdirectory(fcitx5-mozc)
target_include_directories(mozc PRIVATE "${PREBUILDER_INCLUDE_DIR}/mozc")

# rime
set(Rime_VERSION 1.12)
# RIME_DATA_DIR is not actually used on macOS but must exist.
set(RIME_DATA_DIR "/usr/share/rime-data")
set(Rime_dependencies
    "-L${PREBUILDER_LIB_DIR}"
    "-lleveldb"
    "-lyaml-cpp"
    "-lmarisa"
    "-lopencc"
    "-lglog"
    "-llua"
)
add_library(Rime_static STATIC IMPORTED)
set_target_properties(Rime_static PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/librime.a"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}"
    INTERFACE_LINK_LIBRARIES "${Rime_dependencies}"
)
# plugins use __attribute__((constructor))
set(RIME_TARGET $<LINK_LIBRARY:WHOLE_ARCHIVE,Rime_static>)
add_subdirectory(fcitx5-rime)
if (APPLE)
    target_link_options(rime PUBLIC
        LINKER:-U,_f5m_is_linear_layout
        LINKER:-U,_f5m_is_vertical_rl
        LINKER:-U,_f5m_is_vertical_lr
    )
endif()

# sayura
add_subdirectory(fcitx5-sayura)

if (NOT EMSCRIPTEN)
# skk
set(SKK_DEFAULT_PATH "$XDG_DATA_DIRS/skk/SKK-JISYO.L" CACHE STRING "")
add_subdirectory(fcitx5-skk)
target_include_directories(skk PRIVATE "${PREBUILDER_INCLUDE_DIR}/gee-0.8")
target_link_libraries(skk "-L${PREBUILDER_LIB_DIR}" -lgee-0.8 -lffi -lgio-2.0 -lgmodule-2.0 -ljson-glib-1.0 -lz -lresolv)
endif()

# table-extra
if (APPLE) # Universal so unnecessary on other platforms.
    add_subdirectory(fcitx5-table-extra)
endif()

# thai
add_library(Thai_static STATIC IMPORTED)
set_target_properties(Thai_static PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libthai.a"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}"
)
set(THAI_TARGET Thai_static)
add_subdirectory(fcitx5-thai)

# unikey
add_subdirectory(fcitx5-unikey)
