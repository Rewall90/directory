"""
Find clubs that need 2026 pricing data scraped.

Criteria:
- pricing.2026 doesn't exist, OR
- pricing.2026 exists but greenFee18, greenFeeWeekday, greenFeeWeekend are ALL null/missing
- Club must have a website (contact.website is not null/empty)

Output sorted by region, with club name, website, and relative file path.
"""
import json
import os
import glob

courses_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "content",
    "courses",
)

files = glob.glob(os.path.join(courses_dir, "**", "*.json"), recursive=True)

results = []

for filepath in sorted(files):
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    name = data.get("name", "Unknown")
    contact = data.get("contact") or {}
    website = contact.get("website") or ""
    website = website.strip()

    # Skip clubs without a website
    if not website:
        continue

    pricing = data.get("pricing") or {}
    needs_scraping = False
    reason = ""

    if "2026" not in pricing:
        needs_scraping = True
        reason = "No 2026 pricing"
    else:
        p2026 = pricing["2026"]
        gf18 = p2026.get("greenFee18")
        gf_weekday = p2026.get("greenFeeWeekday")
        gf_weekend = p2026.get("greenFeeWeekend")

        if gf18 is None and gf_weekday is None and gf_weekend is None:
            needs_scraping = True
            reason = "2026 exists but all green fees null"

    if not needs_scraping:
        continue

    # Build relative path from content/courses/
    rel_path = os.path.relpath(filepath, courses_dir).replace("\\", "/")
    region = rel_path.split("/")[0]

    results.append({
        "name": name,
        "website": website,
        "rel_path": rel_path,
        "region": region,
        "reason": reason,
    })

# Sort by region, then by name
results.sort(key=lambda x: (x["region"], x["name"]))

# Print output
print()
print("=" * 130)
print("  CLUBS NEEDING 2026 PRICING SCRAPING")
print("  (No pricing.2026 OR greenFee18/greenFeeWeekday/greenFeeWeekend all null, with website)")
print("=" * 130)
print()
print(f"{'#':>3}  {'Region':<22} {'Club Name':<42} {'Website':<50} {'Reason'}")
print(f"{'---':>3}  {'---------------------':<22} {'-' * 42} {'-' * 50} {'-' * 30}")

current_region = None
for i, r in enumerate(results, 1):
    if r["region"] != current_region:
        if current_region is not None:
            print()
        current_region = r["region"]
    print(f"{i:>3}  {r['region']:<22} {r['name']:<42} {r['website']:<50} {r['reason']}")

print()
print(f"  TOTAL: {len(results)} clubs need scraping")
print()

# Also print tab-separated for easy copy-paste
print("=" * 130)
print("  TAB-SEPARATED (for spreadsheet import)")
print("=" * 130)
print()
print("Region\tClub Name\tWebsite\tFile Path\tReason")
for r in results:
    print(f"{r['region']}\t{r['name']}\t{r['website']}\t{r['rel_path']}\t{r['reason']}")
