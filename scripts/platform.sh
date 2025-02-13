PLATFORM=$1

if [[ $PLATFORM == "macos" ]]; then
  deps=("${macos[@]}") # for install-deps.sh
  plugins=("${macos[@]}") # for install.sh
  POSTFIX=-`uname -m`
elif [[ $PLATFORM == "windows" ]]; then
  plugins=("${windows[@]}")
  POSTFIX="-$2"
elif [[ $PLATFORM == "js" ]]; then
  deps=("${js[@]}")
  plugins=("${js[@]}")
  POSTFIX=''
else
  echo "Unknown platform: $PLATFORM"
  exit 1
fi

TARGET=$PLATFORM$POSTFIX
