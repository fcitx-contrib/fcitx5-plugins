#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]] || [[ "$1" != "arm64" && "$1" != "x86_64" ]]; then
  echo "Usage: $0 <arm64|x86_64>" >&2
  exit 1
fi

ARCH="$1"
ROOT="$PWD"
CACHE_DIR="$ROOT/cache/macos"
DESTDIR_ROOT="$ROOT/build/macos-$ARCH/mcbopomofo-deps"
WORK_DIR="$ROOT/build/macos-$ARCH-deps-work"
NCPU="$(sysctl -n hw.ncpu)"

JSONC_TAG="json-c-0.18-20240915"
JSONC_TARBALL="${JSONC_TAG}.tar.gz"
JSONC_URL="https://github.com/json-c/json-c/archive/refs/tags/${JSONC_TARBALL}"

ICU_TAG="release-77-1"
ICU_TARBALL="icu4c-77_1-src.tgz"
ICU_URL="https://github.com/unicode-org/icu/releases/download/${ICU_TAG}/${ICU_TARBALL}"

mkdir -p "$CACHE_DIR" "$DESTDIR_ROOT/usr"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
trap 'rm -rf "$WORK_DIR"' EXIT

if [[ ! -f "$CACHE_DIR/$JSONC_TARBALL" ]]; then
  curl --retry 3 -fsSL -o "$CACHE_DIR/$JSONC_TARBALL" "$JSONC_URL"
fi
if [[ ! -f "$CACHE_DIR/$ICU_TARBALL" ]]; then
  curl --retry 3 -fsSL -o "$CACHE_DIR/$ICU_TARBALL" "$ICU_URL"
fi

# 1. Build static json-c
tar xf "$CACHE_DIR/$JSONC_TARBALL" -C "$WORK_DIR"
JSONC_SRC="$WORK_DIR/json-c-${JSONC_TAG}"
cmake -S "$JSONC_SRC" -B "$WORK_DIR/json-c-build" -G Ninja \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_SHARED_LIBS=OFF \
  -DBUILD_STATIC_LIBS=ON \
  -DBUILD_APPS=OFF \
  -DBUILD_TESTING=OFF \
  -DCMAKE_INSTALL_PREFIX=/usr \
  -DCMAKE_INSTALL_LIBDIR=lib \
  -DCMAKE_OSX_ARCHITECTURES="$ARCH" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=13.3
cmake --build "$WORK_DIR/json-c-build" --parallel "$NCPU"
DESTDIR="$DESTDIR_ROOT" cmake --install "$WORK_DIR/json-c-build"

# 2. Build static icu4c
tar xf "$CACHE_DIR/$ICU_TARBALL" -C "$WORK_DIR"
ICU_SRC="$WORK_DIR/icu/source"
HOST_ARCH="$(uname -m)"

ICU_COMMON_FLAGS=(
  --enable-static
  --disable-shared
  --with-data-packaging=static
  --disable-tests
  --disable-samples
  --disable-extras
  --disable-icuio
  --disable-layoutex
)

mkdir -p "$WORK_DIR/icu-target"
if [[ "$ARCH" != "$HOST_ARCH" ]]; then
  mkdir -p "$WORK_DIR/icu-host"
  pushd "$WORK_DIR/icu-host" >/dev/null
  CC=clang CXX=clang++ \
  CFLAGS="-O2 -mmacosx-version-min=13.3" \
  CXXFLAGS="-O2 -std=c++17 -mmacosx-version-min=13.3" \
  "$ICU_SRC/configure" "${ICU_COMMON_FLAGS[@]}"
  make -j"$NCPU"
  popd >/dev/null

  pushd "$WORK_DIR/icu-target" >/dev/null
  CC=clang CXX=clang++ \
  CFLAGS="-O2 -mmacosx-version-min=13.3 -arch $ARCH" \
  CXXFLAGS="-O2 -std=c++17 -mmacosx-version-min=13.3 -arch $ARCH" \
  LDFLAGS="-mmacosx-version-min=13.3 -arch $ARCH" \
  "$ICU_SRC/configure" \
    --host="${ARCH}-apple-darwin" \
    --with-cross-build="$WORK_DIR/icu-host" \
    "${ICU_COMMON_FLAGS[@]}" \
    --prefix=/usr
  make -j"$NCPU"
  make install DESTDIR="$DESTDIR_ROOT"
  popd >/dev/null
else
  pushd "$WORK_DIR/icu-target" >/dev/null
  CC=clang CXX=clang++ \
  CFLAGS="-O2 -mmacosx-version-min=13.3 -arch $ARCH" \
  CXXFLAGS="-O2 -std=c++17 -mmacosx-version-min=13.3 -arch $ARCH" \
  LDFLAGS="-mmacosx-version-min=13.3 -arch $ARCH" \
  "$ICU_SRC/configure" "${ICU_COMMON_FLAGS[@]}" --prefix=/usr
  make -j"$NCPU"
  make install DESTDIR="$DESTDIR_ROOT"
  popd >/dev/null
fi

rm -f "$DESTDIR_ROOT/usr/lib"/libjson-c*.dylib "$DESTDIR_ROOT/usr/lib"/libicu*.dylib

for req in \
  "$DESTDIR_ROOT/usr/lib/libjson-c.a" \
  "$DESTDIR_ROOT/usr/lib/pkgconfig/json-c.pc" \
  "$DESTDIR_ROOT/usr/lib/libicuuc.a" \
  "$DESTDIR_ROOT/usr/lib/libicui18n.a" \
  "$DESTDIR_ROOT/usr/lib/libicudata.a" \
  "$DESTDIR_ROOT/usr/include/json-c/json.h" \
  "$DESTDIR_ROOT/usr/include/unicode/translit.h"
do
  if [[ ! -f "$req" ]]; then
    echo "ERROR: Missing expected static dependency file: $req" >&2
    exit 1
  fi
done
