# Uncaught RuntimeError: function signature mismatch

WASM 不允许函数指针的签名和实际函数的签名不一致。glib 巨量滥用这个 UB，因此出了很多问题。

将库开启调试，插件使用 `-DCMAKE_BUILD_TYPE=Debug`。

可能需要带 `--enable-features=WebAssemblyUnlimitedSyncCompilation` 启动 Chrome。

复现问题后，在 `call_indirect` 处断点。命中后在 Sources -> Scope -> Expression 展开 `stack`，序号最大的整数即为实际函数地址。

在 Module 展开 `tables`，`$env.__indirect_function_table` 找到实际函数。

# 产物包含绝对路径

`tar xf -C` 解包，`grep` 找到具体的 .o，`wasm2wat`。

在 wat 里找到 `(data $.L.str.x (i32.const y) "绝对路径")`，搜索 `(i32.const y)`，查看所在函数源码。
