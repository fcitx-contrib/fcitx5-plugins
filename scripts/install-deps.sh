set -e

macos=(
  anthy-cmake
  boost
  fmt
  glib
  glog
  json-c
  json-glib
  leveldb
  libchewing
  libgee
  libhangul
  libmozc
  librime
  libskk
  libthai
  libxkbcommon
  lua
  marisa
  opencc
  pcre2
  yaml-cpp
  zstd
)

js=(
  anthy-cmake
  boost
  ecm
  glog
  leveldb
  libchewing
  libhangul
  libmozc
  librime
  libthai
  lua
  marisa
  opencc
  yaml-cpp
  zstd
)

. scripts/platform.sh $1

EXTRACT_DIR=build/$TARGET/usr
CACHE_DIR=cache/$PLATFORM
mkdir -p $EXTRACT_DIR $CACHE_DIR

for dep in "${deps[@]}"; do
  file=$dep$POSTFIX.tar.bz2
  [[ -f $CACHE_DIR/$file ]] || wget -P $CACHE_DIR https://github.com/fcitx-contrib/fcitx5-prebuilder/releases/download/$PLATFORM/$file
  tar xjf $CACHE_DIR/$file -C $EXTRACT_DIR
done

if [[ $PLATFORM == "macos" ]]; then
sed -i.bak 's|Requires: glib-2.0.*|Requires: glib-2.0|' $(find build -name gobject-2.0.pc)
fi
