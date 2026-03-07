#!/bin/bash
# usage: ./collect.sh src/schemas src/types.ts src/utils
# outputs: collected.txt

OUTPUT="collected.ts"
> "$OUTPUT"

for target in "$@"; do
  if [ -f "$target" ]; then
    echo "// ===== FILE: $target =====" >> "$OUTPUT"
    cat "$target" >> "$OUTPUT"
    echo -e "\n" >> "$OUTPUT"
  elif [ -d "$target" ]; then
    find "$target" -type f \( -name "*.ts" -o -name "*.tsx" \) | sort | while read file; do
      echo "// ===== FILE: $file =====" >> "$OUTPUT"
      cat "$file" >> "$OUTPUT"
      echo -e "\n" >> "$OUTPUT"
    done
  fi
done

echo "Written to $OUTPUT"