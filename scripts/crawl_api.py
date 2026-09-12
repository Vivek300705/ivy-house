import requests
import json
import os
import time

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-754116092122"
EMAIL = "demo1@ivy.homes"
PASSWORD = "0f76079a0a"

def login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        headers={"X-API-Key": API_KEY}
    )
    response.raise_for_status()
    data = response.json()
    return data["access_token"]

def fetch_all(endpoint, token):
    offset = 0
    limit = 50
    all_records = []
    
    headers = {
        "X-API-Key": API_KEY,
        "Authorization": f"Bearer {token}"
    }

    while True:
        try:
            response = requests.get(
                BASE_URL + endpoint,
                headers=headers,
                params={
                    "offset": offset,
                    "limit": limit
                }
            )
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"Error on {endpoint} offset {offset}:", e.response.text)
            break

        data = response.json()
        
        records = data.get("results", [])
        all_records.extend(records)

        # Detect total/pagination limits
        if "total" in data:
            total = data["total"]
            print(f"Received {len(records)} records | Total reported: {total} | Downloaded: {len(all_records)}")
            
        if not data.get("has_more"):
            break
            
        offset += limit
        # rate limit is 1200 / min, so 20 req/sec. No sleep needed if we are careful, but let's be safe.
        # time.sleep(0.05)

    return all_records

def save_json(filename, data):
    os.makedirs("data", exist_ok=True)
    with open(f"data/{filename}", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} records to data/{filename}")

def main():
    token = login()
    print("Token obtained")
    
    listings = fetch_all("/v1/listings", token)
    save_json("listings.json", listings)
    
    rentals = fetch_all("/v1/rentals", token)
    save_json("rentals.json", rentals)
    
    projects = fetch_all("/v1/projects", token)
    save_json("projects.json", projects)

    analytics = requests.get(f"{BASE_URL}/v2/insights/summary", headers={"X-API-Key": API_KEY, "Authorization": f"Bearer {token}"})
    if analytics.status_code == 200:
        save_json("analytics.json", analytics.json())
    else:
        print("Analytics v2 failed:", analytics.text)

if __name__ == "__main__":
    main()