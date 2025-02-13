if (Fcitx5Module_FOUND)
    return()
endif()

set(Fcitx5Module_FOUND TRUE)

if (NOT TARGET spell-interface)
    add_library(spell-interface INTERFACE)
    add_library(Fcitx5::Module::Spell ALIAS spell-interface)
    set_target_properties(spell-interface PROPERTIES
        INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Module/fcitx-module/spell"
    )
endif()

if (NOT TARGET clipboard-interface)
    add_library(clipboard-interface INTERFACE)
    add_library(Fcitx5::Module::Clipboard ALIAS clipboard-interface)
    set_target_properties(clipboard-interface PROPERTIES
        INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Module/fcitx-module/clipboard"
    )
endif()

if (NOT TARGET notifications-interface)
    add_library(notifications-interface INTERFACE)
    add_library(Fcitx5::Module::Notifications ALIAS notifications-interface)
    set_target_properties(notifications-interface PROPERTIES
        INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Module/fcitx-module/notifications"
    )
endif()

if (NOT TARGET quickphrase-interface)
    add_library(quickphrase-interface INTERFACE)
    add_library(Fcitx5::Module::QuickPhrase ALIAS quickphrase-interface)
    set_target_properties(quickphrase-interface PROPERTIES
        INTERFACE_INCLUDE_DIRECTORIES "${PREBUILDER_INCLUDE_DIR}/Fcitx5/Module/fcitx-module/quickphrase"
    )
endif()
