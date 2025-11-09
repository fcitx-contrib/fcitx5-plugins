cmake_minimum_required(VERSION 3.27)

project(fcitx5-plugins VERSION 0.1.0)

option(ANTHY "" ON)
option(BAMBOO "" ON)
option(CHEWING "" ON)
option(CHINESE_ADDONS "" ON)
option(HALLELUJAH "" ON)
option(HANGUL "" ON)
option(M17N "" ON)
option(MOZC "" ON)
option(RIME "" ON)
option(SAYURA "" ON)
option(SKK "" ON)
option(TABLE_EXTRA "" ON)
option(THAI "" ON)
option(UNIKEY "" ON)

list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
set(CMAKE_INSTALL_PREFIX /usr)
set(FIND_ROOT_PATH "${PROJECT_BINARY_DIR}/usr")
set(PREBUILDER_BIN_DIR "${FIND_ROOT_PATH}/bin")
set(PREBUILDER_INCLUDE_DIR "${FIND_ROOT_PATH}/include")
set(PREBUILDER_LIB_DIR "${FIND_ROOT_PATH}/lib")

if (WIN32)
    set(ENV{PKG_CONFIG_PATH} "${CMAKE_SYSROOT}/lib/pkgconfig")
else()
    set(ENV{PKG_CONFIG_SYSROOT_DIR} "${PROJECT_BINARY_DIR}")
    set(ENV{PKG_CONFIG_PATH} "${PREBUILDER_LIB_DIR}/pkgconfig")
endif()

if (NOT APPLE) # On macOS compile prefix is the same with runtime prefix.
    set(Fcitx5Utils_DIR "${PROJECT_SOURCE_DIR}/cmake")
endif()

# We don't build testing frontends so fake it.
set(Fcitx5ModuleTestFrontend_DIR "${PROJECT_SOURCE_DIR}/cmake")

if (APPLE)
    set(CMAKE_OSX_DEPLOYMENT_TARGET 13.3) # Also need to update CGO_CFLAGS

    set(APP_CONTENTS_PATH "/Library/Input Methods/Fcitx5.app/Contents")
    set(CMAKE_FIND_ROOT_PATH
        "${APP_CONTENTS_PATH}"
        "${FIND_ROOT_PATH}"
    )
    set(CMAKE_INSTALL_RPATH "${APP_CONTENTS_PATH}/lib") # scel2org5, libime_*
elseif (WIN32)
    list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake/relative")
    add_compile_definitions(-DFcitx5Core_EXPORTS -DFcitx5Utils_EXPORTS)
elseif (EMSCRIPTEN)
    list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake/relative")
    set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS TRUE)
    set(SHARED_FLAGS "-sSIDE_MODULE")
    set(CMAKE_SHARED_LIBRARY_CREATE_C_FLAGS "${SHARED_FLAGS}")
    set(CMAKE_SHARED_LIBRARY_CREATE_CXX_FLAGS "${SHARED_FLAGS}")
    set(CMAKE_SHARED_MODULE_CREATE_C_FLAGS "${SHARED_FLAGS}")
    set(CMAKE_SHARED_MODULE_CREATE_CXX_FLAGS "${SHARED_FLAGS}")
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
if (ANTHY)
add_subdirectory(fcitx5-anthy)
endif()

# bamboo
if (BAMBOO)
if (NOT EMSCRIPTEN) # https://github.com/golang/go/issues/55351
add_subdirectory(fcitx5-bamboo)
endif()
endif()

# chewing
if (CHEWING)
add_subdirectory(fcitx5-chewing)
endif()

# lua and chinese-addons
if (CHINESE_ADDONS)
option(USE_DLOPEN "" OFF)
add_subdirectory(fcitx5-lua)

option(BUILD_SHARED_LIBS "" OFF)
add_subdirectory(libime)
# suppress configure error
install(TARGETS kenlm EXPORT LibIMECoreTargets LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}" COMPONENT lib)

set(LIBIME_INSTALL_PKGDATADIR "../libime")
if (EMSCRIPTEN)
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
endif()

# hallelujah
if (HALLELUJAH)
add_subdirectory(fcitx5-hallelujah)
endif()

# hangul
if (HANGUL)
add_library(Hangul_static STATIC IMPORTED)
set_target_properties(Hangul_static PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libhangul.a"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/hangul-1.0"
)
set(HANGUL_TARGET Hangul_static)
add_subdirectory(fcitx5-hangul)
endif()

# m17n
if (M17N)
add_library(m17n_static STATIC IMPORTED)
set_target_properties(m17n_static PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libm17n.a"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}"
)
set(M17N_TARGET m17n_static)
add_subdirectory(fcitx5-m17n)
endif()

# mozc
if (MOZC)
set(MOZC_TARGET
    "-L${PREBUILDER_LIB_DIR}"
    "-lmozc-static"
    "-lutf8_validity"
    "-lprotobuf"
    "-labsl"
)
if (APPLE)
    list(APPEND MOZC_TARGET "-Wl,-framework,CoreFoundation")
endif()
add_subdirectory(fcitx5-mozc)
target_include_directories(mozc PRIVATE "${PREBUILDER_INCLUDE_DIR}/mozc")
target_compile_definitions(mozc PRIVATE -DMOZC_DISABLE_SESSION_WATCHDOG)
if (EMSCRIPTEN)
    target_include_directories(mozc PRIVATE
        "${PREBUILDER_INCLUDE_DIR}"
        "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Module"
    )
endif()
endif()

# rime
if (RIME)
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
    "-lqjs"
)
if (APPLE)
    find_library(LibJSCore JavaScriptCore)
    list(APPEND Rime_dependencies "${LibJSCore}")
endif()

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
endif()

# sayura
if (SAYURA)
add_subdirectory(fcitx5-sayura)
endif()

# skk
if (SKK)
set(SKK_DEFAULT_PATH "$XDG_DATA_DIRS/skk/SKK-JISYO.L" CACHE STRING "")
add_subdirectory(fcitx5-skk)
target_include_directories(skk PRIVATE "${PREBUILDER_INCLUDE_DIR}/gee-0.8")
set(SKK_LINK_LIBS "-L${PREBUILDER_LIB_DIR}" -lgee-0.8 -lgio-2.0 -lgmodule-2.0 -ljson-glib-1.0 -lz)
if (APPLE)
    list(APPEND SKK_LINK_LIBS -lresolv)
endif()
target_link_libraries(skk ${SKK_LINK_LIBS})
endif()

# table-extra
if (TABLE_EXTRA)
if (APPLE) # Universal so unnecessary on other platforms.
    add_subdirectory(fcitx5-table-extra)
endif()
endif()

# thai
if (THAI)
if (NOT WIN32)
    add_library(Thai_static STATIC IMPORTED)
    set_target_properties(Thai_static PROPERTIES
        IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libthai.a"
        INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}"
    )
    set(THAI_TARGET Thai_static)
endif()
add_subdirectory(fcitx5-thai)
endif()

# unikey
if (UNIKEY)
add_subdirectory(fcitx5-unikey)
if (WIN32)
    target_compile_definitions(unikey-lib PUBLIC -DUNIKEYHOOK)
endif()
endif()
