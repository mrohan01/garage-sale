import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const loginPayload = JSON.stringify({
    email: 'loadtest@example.com',
    password: 'LoadTest123!',
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login succeeded': (r) => r.status === 200,
  });

  const body = JSON.parse(loginRes.body);
  return { token: body.accessToken };
}

function authHeaders(data) {
  return {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };
}

function browseNearbySales(data) {
  const res = http.get(
    `${BASE_URL}/api/sales/nearby?lat=40.7128&lng=-74.0060&radiusKm=10`,
    authHeaders(data)
  );
  check(res, { 'browse nearby 200': (r) => r.status === 200 });
}

function searchListings(data) {
  const queries = ['furniture', 'electronics', 'clothing', 'toys', 'books', 'tools'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const res = http.get(`${BASE_URL}/api/search?q=${q}`, authHeaders(data));
  check(res, { 'search 200': (r) => r.status === 200 });
}

function viewSaleDetail(data) {
  const id = Math.floor(Math.random() * 100) + 1;
  const res = http.get(`${BASE_URL}/api/sales/${id}`, authHeaders(data));
  check(res, { 'sale detail 200': (r) => r.status === 200 });
}

function viewListingDetail(data) {
  const id = Math.floor(Math.random() * 500) + 1;
  const res = http.get(`${BASE_URL}/api/listings/${id}`, authHeaders(data));
  check(res, { 'listing detail 200': (r) => r.status === 200 });
}

export default function (data) {
  const roll = Math.random();

  if (roll < 0.4) {
    browseNearbySales(data);
  } else if (roll < 0.7) {
    searchListings(data);
  } else if (roll < 0.9) {
    viewSaleDetail(data);
  } else {
    viewListingDetail(data);
  }

  sleep(1);
}
