import json
import os
import sys
from dirhash import dirhash

input_methods = sys.argv[1:]

cwd = os.getcwd().replace(f'\\', '/') # /path/to/build/target/rime/usr
data_dir = f"{cwd}/../data"
target, plugin = cwd.split("/")[-3:-1]
files: list[str] = []

for wd in (cwd, data_dir):
    for dirpath, _, filenames in os.walk(wd):
        if dirpath == f"{wd}/plugin":
            continue
        for filename in filenames:
            files.append(f"{dirpath[len(wd) + 1:]}/{filename}")

files.sort()

try:
    version = dirhash(cwd, "md5", ignore=["plugin"])
except Exception:
    # pure data plugin
    version = None

if target.startswith('macos') or target.startswith('windows'):
    data_version = dirhash(data_dir, "md5")
else:
    data_version = None

# Both data/ and usr/ have to contain descriptor,
# so that updating either *-any or *-arm64 will update descriptor.

plugin_dir = f"{data_dir}/plugin"

os.makedirs(plugin_dir, exist_ok=True)
descriptor_path = f"{plugin_dir}/{plugin}.json"
with open(descriptor_path, "w") as f:
    descriptor = {
        "files": files
    }
    if data_version:
        descriptor["data_version"] = data_version
    if version:
        descriptor["version"] = version
    if input_methods:
        descriptor["input_methods"] = input_methods
    json.dump(descriptor, f)

if version:
    os.makedirs(f"{cwd}/plugin", exist_ok=True)
    os.system(f"cp {descriptor_path} {cwd}/plugin/{plugin}.json")
