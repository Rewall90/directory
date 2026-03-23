#!/bin/bash
# List all courses that currently have images

echo "=== GOLF COURSES WITH IMAGES ==="
echo ""

find content/courses -name "*.json" -exec grep -l '"images"' {} \; | while read file; do
  name=$(grep '"name":' "$file" | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
  region=$(echo "$file" | sed 's|content/courses/\([^/]*\)/.*|\1|')
  count=$(grep -o '"src":' "$file" | wc -l)
  echo "$region/$name ($count images)"
done | sort
