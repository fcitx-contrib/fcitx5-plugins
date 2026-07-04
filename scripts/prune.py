import argparse


def parse_ngram(parts, order):
    logprob = float(parts[0])
    words = tuple(parts[1:1 + order])
    return logprob, words


def process(input_file, output_file, threshold2, threshold3):
    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    section = None

    removed_bigrams = set()

    kept2 = removed2 = 0
    kept3 = removed3 = cascade3 = 0

    out = []

    for line in lines:
        stripped = line.strip()

        if stripped == r"\1-grams:":
            section = 1
            out.append(line)
            continue

        if stripped == r"\2-grams:":
            section = 2
            out.append(line)
            continue

        if stripped == r"\3-grams:":
            section = 3
            out.append(line)
            continue

        if stripped.startswith(r"\end"):
            section = None
            out.append(line)
            continue

        if section is None:
            out.append(line)
            continue

        if stripped == "":
            out.append(line)
            continue

        # Keep all 1-gram
        if section == 1:
            out.append(line)
            continue

        parts = stripped.split()

        try:
            if section == 2:
                logprob, words = parse_ngram(parts, 2)

                if logprob < threshold2:
                    removed_bigrams.add(words)
                    removed2 += 1
                    continue

                kept2 += 1
                out.append(line)

            elif section == 3:
                logprob, words = parse_ngram(parts, 3)

                history = words[:2]

                # cascade
                if history in removed_bigrams:
                    cascade3 += 1
                    continue

                if logprob < threshold3:
                    removed3 += 1
                    continue

                kept3 += 1
                out.append(line)

        except Exception:
            out.append(line)

    # Update header
    new_out = []

    for line in out:
        if line.startswith("ngram 2="):
            new_out.append(f"ngram 2={kept2}\n")
        elif line.startswith("ngram 3="):
            new_out.append(f"ngram 3={kept3}\n")
        else:
            new_out.append(line)

    with open(output_file, "w", encoding="utf-8") as f:
        f.writelines(new_out)

    print(f"Removed 2-grams : {removed2:,}")
    print(f"Removed 3-grams : {removed3:,}")
    print(f"Cascade removed : {cascade3:,}")
    print(f"Final 2-grams   : {kept2:,}")
    print(f"Final 3-grams   : {kept3:,}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("input")
    parser.add_argument("output")

    parser.add_argument("--threshold2", type=float, default=-7.0)
    parser.add_argument("--threshold3", type=float, default=-8.0)

    args = parser.parse_args()

    process(
        args.input,
        args.output,
        args.threshold2,
        args.threshold3,
    )
