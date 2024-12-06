set(Fcitx5Utils_FOUND TRUE)

add_library(Fcitx5::Utils SHARED IMPORTED)
set_target_properties(Fcitx5::Utils PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libFcitx5Utils.so"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Utils"
)

include("${PREBUILDER_LIB_DIR}/cmake/Fcitx5Utils/Fcitx5UtilsConfig.cmake")

# dependent projects usually use
# "${FCITX_INSTALL_CMAKECONFIG_DIR}/Fcitx5Utils/Fcitx5CompilerSettings.cmake"
# to locate Fcitx5CompilerSettings
set(FCITX_INSTALL_CMAKECONFIG_DIR "${PREBUILDER_LIB_DIR}/cmake")
include("${FCITX_INSTALL_CMAKECONFIG_DIR}/Fcitx5Utils/Fcitx5Macros.cmake")
