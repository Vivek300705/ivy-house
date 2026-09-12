import json
from datetime import datetime, timezone, timedelta

REF_TIME_UTC = datetime(2026, 9, 9, 18, 30, tzinfo=timezone.utc)
SEVEN_DAYS_AGO = REF_TIME_UTC - timedelta(days=7)

with open('data/listings.json', encoding='utf-8') as f:
    listings = json.load(f)
with open('data/rentals.json', encoding='utf-8') as f:
    rentals = json.load(f)
with open('data/projects.json', encoding='utf-8') as f:
    projects = json.load(f)

total_listing_records = len(listings)

def is_same(p1, p2):
    if p1['bedroom'] != p2['bedroom']: return False
    if p1['floor'] != p2['floor']: return False
    if p1['property_type'] != p2['property_type']: return False
    lat_diff = abs(p1['latitude'] - p2['latitude'])
    lon_diff = abs(p1['longitude'] - p2['longitude'])
    return lat_diff < 0.002 and lon_diff < 0.002

groups = []
for p in listings:
    found = False
    for g in groups:
        if is_same(g[0], p):
            g.append(p)
            found = True
            break
    if not found:
        groups.append([p])
unique_properties = len(groups)

active_listings = sum(1 for x in listings if x.get('is_live'))

c_floor = {x['listing_id'] for x in listings if x['floor'] > x['total_floors']}
c_area = {x['listing_id'] for x in listings if x['carpet_area'] > x['super_built_up_area']}
c_time = {x['listing_id'] for x in listings if x['posted_at'] > '2026-09-10T00:00:00Z'}
c_price = {x['listing_id'] for x in listings if x['price'] <= 0}
corrupt_listing_ids = sorted(list(c_floor | c_area | c_time | c_price))

hebbal_rentals = [x for x in rentals if x['locality'].lower() == 'hebbal']
total_monthly_rent = sum(x['price'] for x in hebbal_rentals)

c_fake = {x['listing_id'] for x in listings if 0 < x['price'] < 1000000}
fake_listing_ids = sorted(list(c_fake))

excluded = set(corrupt_listing_ids) | set(fake_listing_ids)
valid_2bhk = [
    x for x in listings 
    if x.get('is_live') and x['bedroom'] == 2 and x['listing_id'] not in excluded
]
total_price_sqft = 0
for x in valid_2bhk:
    area = x['carpet_area']
    if area < 300:
        area = area * 10.7639
    total_price_sqft += x['price'] / area

avg_price_per_sqft_2bhk = round(total_price_sqft / len(valid_2bhk), 2)

costliest_project = {"project_id": "", "price_max_inr": 0}
for p in projects:
    pmax = p['price_max']
    if pmax < 15:
        pmax_inr = int(pmax * 10000000)
    else:
        pmax_inr = int(pmax * 100000)
    
    if pmax_inr > costliest_project['price_max_inr']:
        costliest_project = {'project_id': p['project_id'], 'price_max_inr': pmax_inr}

listings_last_7_days = 0
for x in listings:
    dt = datetime.strptime(x['posted_at'], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    if SEVEN_DAYS_AGO <= dt < REF_TIME_UTC:
        listings_last_7_days += 1

project_counts = {p['project_id']: p['total_listings'] for p in projects}
actual_live = {}
for x in listings:
    pid = x.get('project_id')
    if pid and x.get('is_live'):
        actual_live[pid] = actual_live.get(pid, 0) + 1

projects_with_wrong_listing_count = sum(1 for pid, exp in project_counts.items() if actual_live.get(pid, 0) != exp)

answers = {
    "total_listing_records": total_listing_records,
    "unique_properties": unique_properties,
    "active_listings": active_listings,
    "corrupt_listing_ids": corrupt_listing_ids,
    "total_monthly_rent": total_monthly_rent,
    "avg_price_per_sqft_2bhk": avg_price_per_sqft_2bhk,
    "costliest_project": costliest_project,
    "listings_last_7_days": listings_last_7_days,
    "fake_listing_ids": fake_listing_ids,
    "projects_with_wrong_listing_count": projects_with_wrong_listing_count
}

print(json.dumps(answers, indent=2))
