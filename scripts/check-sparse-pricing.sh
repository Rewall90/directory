#!/bin/bash
# Analyze 2026 pricing sparsity across all golf course JSON files
# Outputs clubs with a website and 3+ null/missing key pricing fields

COURSES_DIR="C:/Users/Petter/Desktop/prosjekter/golf_directory/golf-directory/content/courses"
TMPFILE=$(mktemp)

# Process each JSON file
find "$COURSES_DIR" -name "*.json" -type f | while read -r file; do
  # Check if file has pricing.2026
  has_2026=$(python3 -c "
import json, sys
with open(r'''$file''', encoding='utf-8') as f:
    data = json.load(f)
p = data.get('pricing', {})
print('yes' if '2026' in p else 'no')
" 2>/dev/null)

  if [ "$has_2026" != "yes" ]; then
    continue
  fi

  # Extract all needed data
  python3 -c "
import json, sys

with open(r'''$file''', encoding='utf-8') as f:
    data = json.load(f)

name = data.get('name', 'Unknown')
website = data.get('contact', {}).get('website', None)

# Skip if no website
if not website:
    sys.exit(0)

p2026 = data.get('pricing', {}).get('2026', {})

# 7 key fields to check
key_fields = [
    'greenFee18',
    'greenFee9',
    'greenFeeJunior',
    'greenFeeTwilight',
    'cartRental',
    'clubRental',
    'pullCartRental',
]

null_fields = []
for field in key_fields:
    val = p2026.get(field, None)
    if val is None:
        null_fields.append(field)

null_count = len(null_fields)

# Only include if 3+ null fields
if null_count >= 3:
    missing_str = ', '.join(null_fields)
    # Use tab-separated values for easy sorting
    # relative path from courses dir
    rel_path = r'''$file'''.replace('\\\\', '/').split('content/courses/')[-1] if 'content/courses/' in r'''$file'''.replace('\\\\', '/') else r'''$file'''
    print(f'{null_count}\t{rel_path}\t{name}\t{website}\t{missing_str}')
" 2>/dev/null
done > "$TMPFILE"

# Sort by null count descending, take top 40
echo ""
echo "=========================================================================="
echo "  TOP 40 CLUBS WITH MOST SPARSE 2026 PRICING DATA"
echo "  (Have website + 3 or more null/missing key pricing fields)"
echo "=========================================================================="
echo ""
printf "%-5s %-44s %-40s %-5s %s\n" "RANK" "CLUB NAME" "WEBSITE" "NULL" "MISSING FIELDS"
printf "%-5s %-44s %-40s %-5s %s\n" "----" "--------------------------------------------" "----------------------------------------" "----" "--------------"

sort -t$'\t' -k1 -rn "$TMPFILE" | head -40 | nl -w3 -s'. ' | while IFS=$'\t' read -r rank_and_count filepath clubname website missing; do
  # rank_and_count contains "  1. 7" format - need to parse
  rank=$(echo "$rank_and_count" | sed 's/\..*//')
  null_count=$(echo "$rank_and_count" | sed 's/.*\. //')
  printf "%-5s %-44s %-40s %-5s %s\n" "$rank" "$clubname" "$website" "$null_count" "$missing"
done

echo ""
echo "=========================================================================="

# Also print total stats
total=$(wc -l < "$TMPFILE")
echo "Total clubs with website + 2026 pricing + 3+ null fields: $total"

# Count by null count
echo ""
echo "Distribution of null field counts:"
sort -t$'\t' -k1 -rn "$TMPFILE" | cut -f1 | sort -n | uniq -c | sort -rn | while read count nulls; do
  echo "  $nulls null fields: $count clubs"
done

echo ""
echo "=========================================================================="

rm -f "$TMPFILE"
