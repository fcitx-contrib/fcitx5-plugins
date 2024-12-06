if (Fcitx5Core_FOUND)
    return()
endif()

set(Fcitx5Core_FOUND TRUE)

add_library(Fcitx5::Core SHARED IMPORTED)
set_target_properties(Fcitx5::Core PROPERTIES
    IMPORTED_LOCATION "${PREBUILDER_LIB_DIR}/libFcitx5Core.so"
    INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Core"
    INTERFACE_LINK_LIBRARIES "Fcitx5::Config;Fcitx5::Utils"
)

find_package(Fcitx5Config REQUIRED)
