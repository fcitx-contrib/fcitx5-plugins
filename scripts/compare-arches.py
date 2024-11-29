import json

plugins = {
    "x86_64": {},
    "arm64": {}
}

for arch in ("arm64", "x86_64"):
    with open(f"meta-{arch}.json") as f:
        meta = json.load(f)
        for plugin in meta["plugins"]:
            plugins[arch][plugin["name"]] = plugin

all_plugins = sorted(set(plugins["x86_64"].keys()) | set(plugins["arm64"].keys()))

print("## Arch comparison")
print("-|x86_64|arm64|any")
print("-|-|-|-")
for plugin in all_plugins:
    x86_64 = plugins["x86_64"].get(plugin)
    arm64 = plugins["arm64"].get(plugin)
    if not x86_64:
        (x, a, d) = ("💀️", "❌", "❌")
    elif not arm64:
        (x, a, d) = ("❌", "💀️", "❌")
    else:
        if "version" in x86_64:
            x = "✅"
        else:
            x = "❌"
        if "version" in arm64:
            a = "✅"
        else:
            a = "❌"
        if "data_version" not in x86_64 or "data_version" not in arm64:
            d = "💀️"
        elif x86_64["data_version"] != arm64["data_version"]:
            d = "❌"
        else:
            d = "✅"
    print(f"{plugin}|{x}|{a}|{d}")

print(f"\n{len(all_plugins)} plugins in total.")
