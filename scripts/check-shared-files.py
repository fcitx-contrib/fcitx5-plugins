import json
import sys

file_set: set[str] = set()
has_shared = False

for file in sys.argv[1:]:
    with open(file, 'r') as f:
        files = json.load(f)['files']
        for file in files:
            if file in file_set:
                has_shared = True
                print(f'Duplicate: {file}')
            else:
                file_set.add(file)

exit(1 if has_shared else 0)
