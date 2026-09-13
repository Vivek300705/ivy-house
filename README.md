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

## What Turned Out to be Fine (Failed Hypotheses)

During the investigation, several hypotheses were formed about potential data corruption that ultimately turned out to be false:
1. **Latitude/Longitude Swaps**: Given the unit errors, I suspected that latitude and longitude might be swapped for some properties or projects. After writing a script to check bounding boxes for Bangalore (approx Lat 12.9, Lon 77.6), all coordinates were correctly positioned.
2. **Missing Amenities**: I suspected that the menities array in projects might contain completely fabricated strings or null values to break the UI, but it was consistently formatted.
3. **Price Overflow**: I suspected some prices might exceed 32-bit integer limits and return as negative values due to integer overflow. While negative prices were found, they were simple negative values (like -14500000), not integer overflow boundaries.
4. **Dates Formatting**: I suspected dates might be randomly formatted (e.g., MM/DD/YYYY vs DD/MM/YYYY) in posted_at, but all dates strictly adhered to ISO 8601 formatting, despite the timezone offset quirk in the /health endpoint.

## What I Would Do with Another Two Days

If given another two days, I would:
1. **Interactive Data Cleaning**: Build an interactive admin dashboard on the frontend to visualize the fraudulent and corrupt data points on a scatter plot (e.g., price vs carpet area) to easily spot outliers.
2. **Robust Error Boundaries**: Implement React Error Boundaries and skeleton loaders to handle edge-case data rendering more gracefully if the API schema changes unexpectedly.
3. **Advanced Filtering**: Implement multi-select filters and debounced search for localities to improve the UX, as the current implementation requires exact matches.
4. **Automated Testing**: Write Cypress E2E tests to automatically crawl the frontend UI and ensure that the client-side patching of the API bugs does not regress during future updates.
5. **CI/CD Integration**: Set up GitHub Actions to automatically build and deploy the React application on every push.
