set -e

threshold2=-1.78
threshold3=-0.34
upper=$((10 * 1024 * 1024)) # 10 MB
lower=$((95 * 1024 * 1024 / 10)) # 9.5 MB

cd build/macos-arm64

data=chinese-addons/data
src=libime/data/lm_sc.arpa
slim=libime/data/lm_sc.slim.arpa
dst=$data/lib/libime/zh_CN.lm

python ../../scripts/prune.py --threshold2 $threshold2 --threshold3 $threshold3 $src $slim
bin/libime_slm_build_binary -s -a 255 -q 4 trie $slim $dst

size=$(stat -f%z $dst)
echo "Generated $size Bytes"

if [[ "$size" -gt "$upper" ]]; then
  echo "Model too large"
  exit 1
elif [[ "$size" -lt "$lower" ]]; then
  echo "Model too small"
  exit 1
fi

cd $data
tar cjf ../../chinese-addons-slim-any.tar.bz2 --no-xattrs *
