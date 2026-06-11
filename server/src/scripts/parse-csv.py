import csv
import re

csv_path = r"C:\Users\sabin\.gemini\antigravity\brain\fed69d20-1c0b-4585-a1ff-0731dd1c8a5b\.system_generated\steps\1917\content.md"

broadcasters = [
    r"\b(fox|fs1|foxsports)\b",
    r"\btelemundo\b",
    r"\buniverso\b",
    r"\bpeacock\b",
    r"\bbbc\b",
    r"\bitv\b",
    r"\bctv\b",
    r"\btsn\b",
    r"\brds\b",
    r"\bsbs\b",
    r"\b(televisa|univision)\b",
    r"\bazteca\b",
    r"\bglobo\b",
    r"\bcaze\b",
    r"\btubi\b"
]

compiled_patterns = [re.compile(p, re.IGNORECASE) for p in broadcasters]

def matches_broadcaster(name):
    return any(pattern.search(name) for pattern in compiled_patterns)

try:
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Skip the metadata lines up to the header (id,name...)
        lines = f.readlines()
        
        # Find the header line
        header_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith("id,name,"):
                header_idx = i
                break
        
        if header_idx == -1:
            print("CSV Header not found!")
            # Fallback to line 8
            header_idx = 8
            
        csv_lines = lines[header_idx:]
        reader = csv.DictReader(csv_lines)
        
        results = []
        for row in reader:
            name = row.get('name', '')
            if matches_broadcaster(name):
                results.append({
                    'id': row.get('id'),
                    'name': name,
                    'country': row.get('country'),
                    'categories': row.get('categories'),
                    'website': row.get('website')
                })
                
        print(f"Found {len(results)} matches.")
        for r in results[:40]: # Print first 40 matches
            print(f"- {r['name']} ({r['id']}) | Country: {r['country']} | Categories: {r['categories']} | Website: {r['website']}")
            
except Exception as e:
    print(f"Error parsing CSV: {e}")
