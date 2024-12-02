set -e

. scripts/platform.sh $1

ROOT=`pwd`
CACHE_DIR=$ROOT/cache/$PLATFORM
TARGET_DIR=$ROOT/build/$TARGET

extract_dep() {
  local plugin=$1
  local dep=$2
  local file=$dep$POSTFIX.tar.bz2
  tar xjf $CACHE_DIR/$file -C $TARGET_DIR/$plugin/usr --exclude include --exclude lib
}

package() {
  local plugin=$1
  shift
  local input_methods=("$@")
  pushd $TARGET_DIR/$plugin/usr > /dev/null
  python $ROOT/scripts/generate-descriptor.py "${input_methods[@]}"
  # --no-xattrs fixes tar: Special header too large: %llu
  tar cjf ../../$plugin$POSTFIX.tar.bz2 --no-xattrs *
  cd ../data
  tar cjf ../../$plugin-any.tar.bz2 --no-xattrs *
  popd > /dev/null
}

plugins=(
  anthy
  bamboo
  chewing
  chinese-addons
  hallelujah
  hangul
  lua
  mozc
  rime
  sayura
  skk
  table-extra
  thai
  unikey
)

for plugin in "${plugins[@]}"; do
  if [[ $plugin == "mozc" ]]; then
    continue
  fi
  DESTDIR=$TARGET_DIR/$plugin cmake --install build/$TARGET/fcitx5-$plugin
  rm -rf $TARGET_DIR/$plugin/usr/include
  rm -rf $TARGET_DIR/$plugin/usr/lib/cmake
  rm -rf $TARGET_DIR/$plugin/usr/share/{icons,metainfo} # only useful for linux
  find $TARGET_DIR/$plugin/usr -name '*.so' -exec strip -x {} \;
done

extract_dep anthy anthy-cmake
extract_dep chewing libchewing
extract_dep chinese-addons opencc
extract_dep hangul libhangul

# mozc
MOZC_USR=$TARGET_DIR/mozc/usr
mkdir -p $MOZC_USR/{lib/{fcitx5,mozc},share/fcitx5/{addon,inputmethod}}
for file in libmozc$POSTFIX.so mozc_server$POSTFIX mozc-addon.conf mozc.conf; do
  [[ -f $CACHE_DIR/$file ]] || wget -P $CACHE_DIR https://github.com/fcitx-contrib/mozc-cmake/releases/download/latest/$file
done
cp $CACHE_DIR/libmozc$POSTFIX.so $MOZC_USR/lib/fcitx5/libmozc.so
cp $CACHE_DIR/mozc_server$POSTFIX $MOZC_USR/lib/mozc/mozc_server
chmod +x $MOZC_USR/lib/mozc/mozc_server
cp $CACHE_DIR/mozc-addon.conf $MOZC_USR/share/fcitx5/addon/mozc.conf
cp $CACHE_DIR/mozc.conf $MOZC_USR/share/fcitx5/inputmethod/mozc.conf
strip -x $MOZC_USR/lib/fcitx5/libmozc.so $MOZC_USR/lib/mozc/mozc_server

# rime
rime_dir=$TARGET_DIR/rime/usr/share/rime-data
pushd $ROOT/fcitx5-rime-data > /dev/null
cp rime-prelude/*.yaml $rime_dir
cp rime-essay/essay.txt $rime_dir
cp rime-luna-pinyin/*.yaml $rime_dir
cp rime-stroke/*.yaml $rime_dir
cp default.yaml $rime_dir
popd > /dev/null
cp -r $TARGET_DIR/usr/share/opencc $rime_dir

# skk
skk_share_dir=$TARGET_DIR/skk/usr/share
mkdir -p $skk_share_dir/skk
cp -r $TARGET_DIR/usr/share/libskk $skk_share_dir
skk_dict=SKK-JISYO.L.gz
[[ -f $ROOT/cache/$skk_dict ]] || wget -P $ROOT/cache https://skk-dev.github.io/dict/$skk_dict
gunzip -fc $ROOT/cache/$skk_dict > $skk_share_dir/skk/SKK-JISYO.L

if [[ $PLATFORM == "macos" ]]; then
  # split arch-specific files with data
  for plugin in "${plugins[@]}"; do
    if [[ $plugin == "table-extra" ]]; then
      continue
    fi
    pushd $TARGET_DIR/$plugin > /dev/null
    mkdir -p data
    rm -rf data/*
    for dir in "include" "share"; do
      if [[ -d usr/$dir ]]; then
        mv usr/$dir data/$dir
      fi
    done
    popd > /dev/null
  done
fi

# chinese-addons
DESTDIR=$TARGET_DIR/libime-install cmake --install $TARGET_DIR/libime
cp -r $TARGET_DIR/libime-install/usr/bin $TARGET_DIR/chinese-addons/usr
cp -r $TARGET_DIR/libime-install/usr/share $TARGET_DIR/chinese-addons/data
# Install zh_CN.lm and zh_CN.lm.predict which are not in share
mkdir -p $TARGET_DIR/chinese-addons/data/lib
cp -r $TARGET_DIR/libime-install/usr/lib/libime $TARGET_DIR/chinese-addons/data/lib

package anthy anthy
package bamboo bamboo
package chewing chewing
package chinese-addons pinyin
package hallelujah hallelujah
package hangul hangul
package lua
package mozc mozc
package rime rime
package sayura sayura
package skk skk
package thai libthai
package unikey unikey

# table-extra
pushd $TARGET_DIR > /dev/null
python $ROOT/scripts/package-table-extra.py
popd > /dev/null
