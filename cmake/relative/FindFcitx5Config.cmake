set(Fcitx5Config_FOUND TRUE)

add_library(Fcitx5::Config SHARED IMPORTED)

if (WIN32)
    set_target_properties(Fcitx5::Config PROPERTIES
        IMPORTED_LOCATION "${PREBUILDER_BIN_DIR}/libFcitx5Config.dll"
        IMPORTED_IMPLIB "${PREBUILDER_LIB_DIR}/libFcitx5Config.dll.a"
    )
else()
    set_target_properties(Fcitx5::Config PROPERTIES
        IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libFcitx5Config.so"
    )
endif()

set_target_properties(Fcitx5::Config PROPERTIES
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Config"
    INTERFACE_LINK_LIBRARIES "Fcitx5::Utils"
)

find_package(Fcitx5Utils REQUIRED)
