PLATFORM=$1

if [[ $PLATFORM == "macos" ]]; then
  deps=("${macos[@]}")
  POSTFIX=-`uname -m`
elif [[ $PLATFORM == "js" ]]; then
  deps=("${js[@]}")
  POSTFIX=''
else
  echo "Unknown platform: $PLATFORM"
  exit 1
fi

TARGET=$PLATFORM$POSTFIX
