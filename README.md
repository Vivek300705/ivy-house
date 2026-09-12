# Ivy Homes SWE Assignment

This repository contains the completion of the Ivy Homes SWE assignment, including API investigation, data scripts, and a full React frontend that handles the discovered API quirks.

## Architecture

- **Data Scripts**: Found in `/scripts/`, written in Python. These scripts successfully crawled the API with proper authentication and pagination (saving to `/data/`), discovered all API discrepancies, generated the answers for the 10 data questions, and built the `submission.json`.
- **Frontend**: A React application built with Vite and TailwindCSS v4. It contains a complete UI to view Insights, Buy/Rent properties, Builder Projects, and manage Favourites. 
- **API Client Layer**: The `frontend/src/api.js` file abstracts away the broken parts of the API. It intercepts and transforms the API responses to mask the server bugs (e.g., converting project prices from Lakhs/Crores to INR, converting area from sqm to sqft, performing client-side filtering since server filters like `project_id` are broken, and handling pagination with `offset`).

## AI Usage Statement

**Generative AI was used extensively to assist in this assignment.**

Specifically, an AI coding assistant (Google Antigravity / Gemini) was used to:
1. Write the initial Python scripts for authentication testing and data crawling.
2. Automate the data analysis, cross-reference data points to discover the "Lies", and structure the `submission.json`.
3. Scaffold the Vite + React frontend application, including Tailwind styling and component structure.
4. Translate `.tsx` files to `.jsx` to avoid strict typing configuration overhead.

## The Discrepancies ("The Lies")

1. **Auth / API Key**: Sending the API key as a query param `?api_key=` fails. We must hit `POST /auth/login` to get an `access_token`, then send both `X-API-Key` and `Authorization: Bearer <token>` in the headers.
2. **Auth Token Expiry**: Token expires in 900 seconds (15 min), not 86400 (24h) as documented.
3. **Pagination**: The API uses `offset` instead of `page`, and enforces a maximum limit of `50`, ignoring limits like 200.
4. **Pagination Total**: The `total` field returned is completely incorrect and doesn't match the actual number of records returned by the endpoint (e.g., returns 4700 records but `total` is 4468).
5. **Completeness**: The `/v1/listings` API does NOT filter out inactive properties. We receive 978 records with `is_live: false`, requiring client-side filtering.
6. **Filters**: The `project_id` filter is completely ignored on the `/v1/listings` endpoint. It returns all properties in the city.
7. **Missing Endpoints**: The `/v1/analytics/summary` endpoint returns 404, as does the `/v1/favourites` endpoints for saving listings.
8. **Unit Issues (Projects)**: `price_min` and `price_max` are returned as floats in Lakhs or Crores, not Rupees.
9. **Unit Issues (Rentals)**: `deposit` is sometimes given in number of months (e.g., 2, 6, 10) instead of Rupees.
10. **Unit Issues (Listings)**: `carpet_area` is sometimes returned in Square Meters instead of Square Feet.
11. **Data Quality & Fraud**: Found 32 corrupt listings (impossible floors, areas, future dates, negative prices) and 8 fake listings (rentals masquerading as sales).

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Log in with: `demo1@ivy.homes` / `0f76079a0a`.
