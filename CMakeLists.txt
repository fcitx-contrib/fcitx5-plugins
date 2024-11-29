cmake_minimum_required(VERSION 3.27)

project(fcitx5-plugins VERSION 0.1.0)

list(PREPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
set(CMAKE_INSTALL_PREFIX /usr)

if (APPLE)
    set(CMAKE_OSX_DEPLOYMENT_TARGET 13) # Also need to update CGO_CFLAGS

    set(APP_CONTENTS_PATH "/Library/Input Methods/Fcitx5.app/Contents")
    set(FIND_ROOT_PATH "${PROJECT_BINARY_DIR}/usr")
    set(PREBUILDER_INCLUDE_DIR "${FIND_ROOT_PATH}/include")
    set(PREBUILDER_LIB_DIR "${FIND_ROOT_PATH}/lib")
    set(CMAKE_FIND_ROOT_PATH
        "${APP_CONTENTS_PATH}"
        "${FIND_ROOT_PATH}"
    )
    set(ENV{PKG_CONFIG_SYSROOT_DIR} "${PROJECT_BINARY_DIR}")
    set(ENV{PKG_CONFIG_PATH} "${PREBUILDER_LIB_DIR}/pkgconfig")
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
add_subdirectory(fcitx5-bamboo)

# lua and chinese-addons
option(USE_DLOPEN "" OFF)
add_subdirectory(fcitx5-lua)

add_subdirectory(libime)
# suppress configure error
install(TARGETS kenlm EXPORT LibIMECoreTargets LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}" COMPONENT lib)

set(LIBIME_INSTALL_PKGDATADIR "../libime")
if (APPLE)
    set(CMAKE_INSTALL_RPATH "${APP_CONTENTS_PATH}/lib") # scel2org5
endif()
add_subdirectory(fcitx5-chinese-addons)
target_link_libraries(chttrans "${PREBUILDER_LIB_DIR}/libmarisa.a")

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

# rime
# RIME_DATA_DIR is not actually used but must exist.
set(Rime_VERSION 1.12)
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
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/librime.a" # plugins use __attribute__((constructor))
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}"
    INTERFACE_LINK_LIBRARIES "${Rime_dependencies}"
)
set(RIME_TARGET $<LINK_LIBRARY:WHOLE_ARCHIVE,Rime_static>)
add_subdirectory(fcitx5-rime)
target_link_options(rime PUBLIC
    LINKER:-U,_f5m_is_linear_layout
    LINKER:-U,_f5m_is_vertical_rl
    LINKER:-U,_f5m_is_vertical_lr
)

# sayura
add_subdirectory(fcitx5-sayura)

# skk
set(SKK_DEFAULT_PATH "$XDG_DATA_DIRS/skk/SKK-JISYO.L" CACHE STRING "")
add_subdirectory(fcitx5-skk)
target_include_directories(skk PRIVATE "${PREBUILDER_INCLUDE_DIR}/gee-0.8")
target_link_libraries(skk "-L${PREBUILDER_LIB_DIR}" -lgee-0.8 -lffi -lgio-2.0 -lgmodule-2.0 -ljson-glib-1.0 -lz -lresolv)

# table-extra
add_subdirectory(fcitx5-table-extra)

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
