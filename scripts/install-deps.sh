set -e

macos=(
  anthy-cmake
  boost
  fmt
  glib
  glog
  json
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
  m17n-cmake
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
  fmt
  glib
  glog
  json
  json-glib
  leveldb
  libchewing
  libgee
  libhangul
  libmozc
  librime
  libskk
  libthai
  lua
  m17n-cmake
  marisa
  opencc
  yaml-cpp
  zstd
)

. scripts/platform.sh "$@"

EXTRACT_DIR=build/$TARGET/usr
CACHE_DIR=cache/$PLATFORM
mkdir -p $EXTRACT_DIR $CACHE_DIR

for dep in "${deps[@]}"; do
  file=$dep$POSTFIX.tar.bz2
  [[ -f $CACHE_DIR/$file ]] || wget -P $CACHE_DIR https://github.com/fcitx-contrib/fcitx5-prebuilder/releases/download/$PLATFORM/$file
  tar xf $CACHE_DIR/$file -C $EXTRACT_DIR
done

# Platform-unspecific packages
file=m17n-db.tar.bz2
[[ -f cache/$file ]] || wget -P cache https://github.com/fcitx-contrib/m17n-cmake/releases/download/latest/$file
ln -sf ../$file $CACHE_DIR/m17n-db$POSTFIX.tar.bz2

if [[ $PLATFORM == "macos" ]]; then
sed -i.bak 's|Requires: glib-2.0.*|Requires: glib-2.0|' $(find build -name gobject-2.0.pc)
fi
