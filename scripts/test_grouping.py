import json

with open('data/listings.json', encoding='utf-8') as f:
    l = json.load(f)

# Exclude fake/corrupt? We will do that later. The question just asks:
# "Among those records, genuine or not, how many distinct properties do they describe?"

def is_same(p1, p2):
    if p1['bedroom'] != p2['bedroom']: return False
    if p1['floor'] != p2['floor']: return False
    if p1['property_type'] != p2['property_type']: return False
    # If they are in the same project, we can also use project_id
    if p1.get('project_id') and p2.get('project_id') and p1['project_id'] == p2['project_id']:
        # If project_id is the same, and floor/bedroom is the same, is it enough?
        # Projects can have multiple 3BHKs on the 4th floor.
        # So we also need latitude/longitude proximity.
        pass

    lat_diff = abs(p1['latitude'] - p2['latitude'])
    lon_diff = abs(p1['longitude'] - p2['longitude'])
    
    # Are they very close?
    return lat_diff < 0.002 and lon_diff < 0.002

groups = []
for p in l:
    found = False
    for g in groups:
        # Check against first in group
        if is_same(g[0], p):
            g.append(p)
            found = True
            break
    if not found:
        groups.append([p])

print("Distinct properties:", len(groups))
