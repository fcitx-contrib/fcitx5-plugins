set(Fcitx5Utils_FOUND TRUE)

add_library(Fcitx5::Utils SHARED IMPORTED)

if (WIN32)
    set_target_properties(Fcitx5::Utils PROPERTIES
        IMPORTED_LOCATION "${PREBUILDER_BIN_DIR}/libFcitx5Utils.dll"
        IMPORTED_IMPLIB "${PREBUILDER_LIB_DIR}/libFcitx5Utils.dll.a"
    )
else()
    set_target_properties(Fcitx5::Utils PROPERTIES
        IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libFcitx5Utils.so"
    )
endif()

set_target_properties(Fcitx5::Utils PROPERTIES
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Utils"
)

include("${PREBUILDER_LIB_DIR}/cmake/Fcitx5Utils/Fcitx5UtilsConfig.cmake")

# dependent projects usually use
# "${FCITX_INSTALL_CMAKECONFIG_DIR}/Fcitx5Utils/Fcitx5CompilerSettings.cmake"
# to locate Fcitx5CompilerSettings
set(FCITX_INSTALL_CMAKECONFIG_DIR "${PREBUILDER_LIB_DIR}/cmake")
include("${FCITX_INSTALL_CMAKECONFIG_DIR}/Fcitx5Utils/Fcitx5Macros.cmake")
