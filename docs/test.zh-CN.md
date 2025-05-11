# 测试

## 安装

从本地的 build 目录下或 CI 的 artifact 中找到 arm64/x86_64 和 any 压缩包，以 chinese-addons 为例，解压到插件目录：

```sh
mkdir -p ~/Library/fcitx5
tar -xjC ~/Library/fcitx5 -f chinese-addons-arm64.tar.bz2 
tar -xjC ~/Library/fcitx5 -f chinese-addons-any.tar.bz2
```

重启输入法，在 输入法 中添加。

## anthy

* 输入 `mizu` 空格 回车，上屏 `水`。

## bamboo

* 输入 `aa`，预编辑为 `â`。

## chewing

* 输入 `5j` 空格，预编辑为 `珠`。

## chinese-addons

### pinyin
* 输入 `long`，候选词 `龙` `🐉` `🐲`。
* 开启预测，输入 `yu`，上屏 `预`，首选为 `计`，输入 `1` 上屏 `计`。
* 可以导入 txt 词库并在候选词列表看到新词。

```
刘齐家 liu'qi'jia 1
```

### pinyinhelper
* 输入 `sheng` 反引号 `hp`，首选为 盛。

### chttrans
* 开启繁体，`long` 对应 龍。

### punctuation
* 默认输入 `,` 上屏 `，`，开启半角标点后上屏 `,`。
* 全角标点下输入 `x` 回车 `,`，上屏 `x,`，退格后 `,` 变为 `，`（仅在 VSCodium 等程序中有效）。

### fullwidth
* 默认输入 `a` 回车 上屏 `a`，开启全角字符后上屏 `ａ`。

### cloudpinyin
* 开启云拼音后，输入 `zhuoyandexiana`，次选为 `灼眼的夏娜`。

### table
* 五笔字型输入 `aaaaa`，顶功上屏 `工`，预编辑为 `a`。

## hallelujah

* 输入 `excitng`，次选为 `exciting`。
* 输入 `meiyou`，次选为 `没有`。

## hangul

* 输入 `gksrmf` 空格，上屏 `한글 `。

## lua

* 拼音输入 `riqi`，三选为今天日期。

## m17n

### math-latex
* 输入 `\eta`，预编辑为 `η`。

## mozc

* 输入 `mizu` 空格 回车，上屏 `水`。

## rime

### librime
* 输入 `fanti`，首选为 `繁體`。
* 菜单切换简体，输入 `jianti`，首选为 `简体`。`F4` `2` `4` 切换回繁体。
* 输入 反引号 `ppzn`，首选为 `反`。

### librime-lua
* 输入 `date`，次选为今天日期。

rime.lua
```lua
function date_translator(input, seg)
  if (input == "date") then
    yield(Candidate("date", seg.start, seg._end, os.date("%Y年%m月%d日"), " 日期"))
  end
end
```

luna_pinyin.custom.yaml（与 librime-predict librime-qjs 共用）
```yaml
patch:
  engine/translators/+:
    - lua_translator@date_translator
    - qjs_translator@date_translator

  'engine/processors/@before 0': predictor
  'engine/translators/@before 0': predict_translator

  switches/+:
    - name: prediction
      states: [ 关闭预测, 开启预测 ]
      reset: 1

  predictor:
    db: predict.db
```
### librime-predict
* 下载 [predict.db](https://github.com/rime/librime-predict/releases/download/data-1.0/predict.db)
* 输入 `wo` 空格，上屏 `我`，预测首选 `的`。

### librime-qjs
* 输入 `dt`，首选为今天日期时间。

js/date_translator.js
```js
export class DateTranslator {
  translate(input, segment, env) {
    if (input == 'dt') {
      return [
        new Candidate('date', segment.start, segment.end, new Date().toLocaleString(), '', 100)
      ]
    }
    return []
  }
}
```

## sayura

* 输入 `a`，预编辑为 `අ`。

## skk

* 输入 `mizu`，上屏 `みず`。
* 输入 `Mizu` 空格 回车，上屏 `水`。

## table-extra

### zhengma
* 输入 `uggx`，上屏 `郑码`。

## thai

* 输入 `l;ylfu`，上屏 `สวัสดี`。

## unikey

* 输入 `aa`，预编辑为 `â`。
