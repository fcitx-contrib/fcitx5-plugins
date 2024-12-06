set(Fcitx5Config_FOUND TRUE)

add_library(Fcitx5::Config SHARED IMPORTED)
set_target_properties(Fcitx5::Config PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libFcitx5Config.so"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Config"
    INTERFACE_LINK_LIBRARIES "Fcitx5::Utils"
)

find_package(Fcitx5Utils REQUIRED)
