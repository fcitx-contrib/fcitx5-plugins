import os

plugins = {
    "array": [
        "array30",
        "array30-large",
    ],
    "boshiamy": [
        "boshiamy"
    ],
    "cangjie": [
        "cangjie5",
        "cangjie3",
        "cangjie-large",
        "scj6"
    ],
    "cantonese": [
        "cantonese",
        "cantonhk",
        "jyutping-table"
    ],
    "quick": [
        "quick5",
        "quick3",
        "quick-classic",
        "easy-large"
    ],
    "stroke": [
        "t9",
        "stroke5"
    ],
    "wu": [
        "wu"
    ],
    "wubi86": [
        "wubi-large"
    ],
    "wubi98": [
        "wubi98",
        "wubi98-single",
        "wubi98-large",
        "wubi98-pinyin"
    ],
    "zhengma": [
        "zhengma",
        "zhengma-large",
        "zhengma-pinyin"
    ]
}


def ensure(command: str):
    if os.system(command) != 0:
        exit(1)


build_dir = os.getcwd()

# split table-extra to plugins and keep directory structures so the package script can be reused
for plugin, ims in plugins.items():
    ensure(f"mkdir -p {plugin}/" + "data/share/fcitx5/{inputmethod,table}")
    ensure(f"mkdir -p {plugin}/usr")

    for im in ims:
        ensure(f"mv table-extra/usr/share/fcitx5/inputmethod/{im}.conf {plugin}/data/share/fcitx5/inputmethod")
        ensure(f"mv table-extra/usr/share/fcitx5/table/{im}.main.dict {plugin}/data/share/fcitx5/table")

    os.chdir(f"{plugin}/usr")
    ensure(f"python {build_dir}/../../scripts/generate-descriptor.py {ims[0]}")
    os.chdir("../data")
    ensure(f"tar cjf {build_dir}/{plugin}-any.tar.bz2 --no-xattrs *")
    os.chdir(build_dir)
