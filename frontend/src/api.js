const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes';
const API_KEY = import.meta.env.VITE_IVY_API_KEY;

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'X-API-Key': API_KEY,
    'Authorization': `Bearer ${token}`
  };
}

// Convert project prices
function fixProject(p) {
  let pmax = p.price_max;
  let pmin = p.price_min;
  
  if (pmax < 15) p.price_max_inr = pmax * 10000000;
  else p.price_max_inr = pmax * 100000;

  if (pmin < 15) p.price_min_inr = pmin * 10000000;
  else p.price_min_inr = pmin * 100000;

  return p;
}

// Convert rental deposits
function fixRental(r) {
  if (r.deposit < 100) {
    r.deposit_inr = r.deposit * r.price;
  } else {
    r.deposit_inr = r.deposit;
  }
  return r;
}

// Convert listing areas
function fixListing(l) {
  if (l.carpet_area < 300) {
    l.carpet_area_sqft = Math.round(l.carpet_area * 10.7639);
  } else {
    l.carpet_area_sqft = l.carpet_area;
  }
  return l;
}

// Check for corrupt/fake listings
function isValidListing(l) {
  if (l.price <= 0) return false;
  if (l.price > 0 && l.price < 1000000) return false; // fake rent
  if (l.floor > l.total_floors) return false;
  if (l.carpet_area > l.super_built_up_area) return false;
  
  const posted = new Date(l.posted_at);
  const now = new Date('2026-09-10T00:00:00Z');
  if (posted > now) return false; // Future
  
  return true;
}

export async function fetchListings(offset = 0, limit = 50, filters = {}) {
  // Using offset instead of page!
  const params = new URLSearchParams({ offset, limit });
  
  // Apply server filters that work
  if (filters.locality) params.append('locality', filters.locality.toLowerCase());
  if (filters.bhk) params.append('bhk', filters.bhk);
  
  const res = await fetch(`${BASE_URL}/v1/listings?${params}`, { headers: getHeaders() });
  if (res.status === 401) throw new Error('Unauthorized');
  
  const data = await res.json();
  
  // Client side filtering for broken server filters and excluding non-live
  let results = data.results
    .filter(l => l.is_live)
    .filter(isValidListing)
    .map(fixListing);
    
  if (filters.min_price) results = results.filter(l => l.price >= filters.min_price);
  if (filters.max_price) results = results.filter(l => l.price <= filters.max_price);
  if (filters.furnishing) results = results.filter(l => l.furnishing === filters.furnishing);
  if (filters.project_id) results = results.filter(l => l.project_id === filters.project_id); // Since project_id filter is broken!
  
  return { ...data, results };
}

export async function fetchListing(id) {
  const res = await fetch(`${BASE_URL}/v1/listings/${id}`, { headers: getHeaders() });
  const data = await res.json();
  return fixListing(data);
}

export async function fetchRentals(offset = 0, limit = 50) {
  const res = await fetch(`${BASE_URL}/v1/rentals?offset=${offset}&limit=${limit}`, { headers: getHeaders() });
  const data = await res.json();
  data.results = data.results.map(fixRental);
  return data;
}

export async function fetchProjects(offset = 0, limit = 50) {
  const res = await fetch(`${BASE_URL}/v1/projects?offset=${offset}&limit=${limit}`, { headers: getHeaders() });
  const data = await res.json();
  data.results = data.results.map(fixProject);
  return data;
}


export async function refreshApiToken(refreshToken) {
  const res = await fetch(${BASE_URL}/auth/refresh, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}
