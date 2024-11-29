import json
import os
import platform

arch = platform.machine()
plugins = []

for file in os.listdir(f"build/macos-{arch}"):
    if not file.endswith("-any.tar.bz2"):
        continue
    plugin = file[:-len("-any.tar.bz2")]
    descriptor = f"build/macos-{arch}/{plugin}/data/plugin/{plugin}.json"
    with open(descriptor, "r") as f:
        j = json.load(f)
        version = j.get("version")
        data_version = j["data_version"]
    plugins.append({
        "name": plugin,
        "data_version": data_version
    })
    if version:
        plugins[-1]["version"] = version

with open(f"meta-{arch}.json", "w") as f:
    json.dump({
        "plugins": plugins,
    }, f)
