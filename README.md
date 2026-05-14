# PulseX Backend

PulseX - RoadSoS backend for intelligent accident detection and emergency response coordination.

## Quick start

Prerequisites:
- Node 18+
- MongoDB accessible (local or cloud)
- MQTT broker (optional for MQTT features)

Install & run:

```bash
git clone `https://github.com/git-aftab/PulseX_Backend.git`
cd PulseX_Backend
npm install
npm run dev        # runs nodemon src/index.js
npm test           # runs tests/test_hospital_assignment.js
```

## Environment variables

Create a `.env` file in project root. Important variables used by the app:

- MONGO_URI - MongoDB connection string
- PORT - server port (default 3000)
- ACCESS_TOKEN_SECRET - JWT access token secret (dev default: `dev_access_secret`)
- REFRESH_TOKEN_SECRET - JWT refresh token secret (dev default: `dev_refresh_secret`)
- ACCESS_TOKEN_EXPIRY - access token expiry (default `15m`)
- REFRESH_TOKEN_EXPIRY - refresh token expiry (default `7d`)
- ADMIN_INVITE_KEY - server-side key to allow role assignment during register/assign-role
- CORS_ORIGIN - comma separated allowed origins (default `http://localhost:5173`)
- MQTT_URL - (optional) URL for MQTT broker if used
- NODE_ENV - `development` or `production`

## Base URL

All APIs are mounted under `/api/v1` when running (example: http://localhost:3000/api/v1)

---

## Routes (implemented)

Authentication (/api/v1/auth)
- POST /register
  - Body: { fullname, email, password, phone, role? }
  - Notes: role assignment requires ADMIN_INVITE_KEY (x-admin-key header or adminKey body)
  - Response: 201 created user (sanitized)

- POST /login
  - Body: { email, password }
  - Response: 200 with cookies `accessToken` and `refreshToken` and JSON { user, accessToken, refreshToken }
  - Tokens also usable as `Authorization: Bearer <token>`

- POST /refresh-access-token
  - Body or cookie: refreshToken
  - Response: new accessToken and refreshToken (set as cookies)

- POST /logout
  - Auth required (cookie or header). Clears tokens.

- POST /assign-role
  - Auth required; authorized only for admin (verifyJWT + authorizeRoles("admin"))
  - Body: { userId, role }

- GET /me
  - Auth required; returns current user

Healthcheck
- GET /healthcheck/
  - No auth. Returns server health status.

Ambulances (/api/v1/ambulances)
- POST /register
  - Auth required; roles: ambulance_driver, admin
  - Body: { vehicleNumber, driverLicenseNumber, hospitalId?, deviceId? }
  - Response: 201 ambulance

- GET /me
  - Auth required; roles: ambulance_driver, admin
  - Returns ambulance record for logged-in user

- PATCH /:id/location
  - Auth required; roles: ambulance_driver, admin
  - Body: { lng, lat, availabilityStatus? }
  - Updates ambulance currentLocation and lastActiveAt

- POST /:id/accept
  - Auth required; role: ambulance_driver
  - Accept incident placeholder in ambulance controller (real assignment handled in incident controller)

Hospitals (/api/v1/hospitals)
- POST /register
  - Auth required; roles: hospital, admin
  - Body: { hospitalName, registrationNumber, coordinates: [lng, lat], contactNumber, traumaLevel, totalBeds, availableBeds, emergencyAvailable }
  - Response: 201 created hospital

- GET /nearby?lng=<lng>&lat=<lat>&radius=<meters>
  - Auth required
  - Response: list of nearby hospitals (uses 2dsphere index)

- GET /me
  - Auth required; roles: hospital, admin
  - Returns hospital record for logged-in user

Incidents (/api/v1/incidents)
- POST /
  - Auth required
  - Body: { lng, lat, deviceId?, vitals? }
  - Creates an incident (status PENDING) and attempts to auto-assign nearest hospital; emits realtime events

- GET /active
  - Auth required; roles: ambulance_driver, police, hospital, admin
  - Returns incidents with status PENDING or ASSIGNED

- GET /nearby?lng=<lng>&lat=<lat>&radius=<meters>
  - Auth required; role: ambulance_driver
  - Returns pending incidents near the coordinates

- POST /:id/accept
  - Auth required; role: ambulance_driver
  - Atomically assigns ambulance to incident if still PENDING

- POST /:id/resolve
  - Auth required; roles: ambulance_driver, admin
  - Marks incident RESOLVED, frees ambulance and hospital bed

- PATCH /:id/cancel
  - Auth required; reporter or admin can cancel
  - Marks CANCELLED and releases resources

---

## Models (key fields)
- User: { fullname, email, username, phone, password (hashed), role, refreshToken }
- Hospital: { user, hospitalName, registrationNumber, location: Point [lng,lat], contactNumber, totalBeds, availableBeds, hospitalCapacityStatus }
- Ambulance: { user, vehicleNumber, driverLicenseNumber, hospital, currentLocation: Point, availabilityStatus }
- Incident: { reporter, deviceId, location: Point, status (PENDING/ASSIGNED/RESOLVED/CANCELLED), assignedAmbulance, assignedHospital, vitals }

## Auth & Cookies
- Access token returned as cookie `accessToken` and as JSON. The API accepts tokens via cookie or `Authorization: Bearer <token>` header.

## Realtime & MQTT
- Socket and MQTT services are initialized in `src/index.js` via `initSocket` and `initMqtt`.
- Events emitted by the server (examples): `incident_created`, `incident_assigned`, `incident_resolved`, `incident_cancelled` under namespaces like `/ambulance`, `/hospital`, `/police`, `/user`.

## Sample curl requests

Register user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Alice","email":"a@example.com","password":"pass123","phone":"0001112222"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@example.com","password":"pass123"}' -i
```

Create incident (using Authorization header):
```bash
curl -X POST http://localhost:3000/api/v1/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"lng":77.6,"lat":12.9,"deviceId":"dev123","vitals":{"heartRate":90}}'
```

List nearby hospitals:
```bash
curl -X GET 'http://localhost:3000/api/v1/hospitals/nearby?lng=77.6&lat=12.9&radius=5000' \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Ambulance accept incident:
```bash
curl -X POST http://localhost:3000/api/v1/incidents/<INCIDENT_ID>/accept \
  -H "Authorization: Bearer <AMBULANCE_ACCESS_TOKEN>"
```

## Tests
- `npm test` runs `tests/test_hospital_assignment.js` (simple unit/integration tests). Expand test coverage as needed.

## To be built / Recommended endpoints and improvements
- Admin endpoints: list users, list hospitals, approve hospital/ambulance, change hospital capacity manually
- Device endpoints: device registration, secure device tokens
- Metrics & monitoring: endpoint for stats (active incidents, ambulances online, bed occupancy)
- Webhooks: notify external systems when incidents are created/resolved
- Postman collection and OpenAPI spec
- E2E tests for incident lifecycle (create -> assign -> accept -> resolve)
- Role invitation flow and invite token management

## Notes & troubleshooting
- Geospatial queries require MongoDB 2dsphere index (already defined in models).
- Default dev JWT secrets are in code fallback; set strong secrets in production.
- If MQTT/socket features not needed for local testing, app still starts without MQTT if MQTT_URL is absent but ensure proper error handling for brokers.

---

If you'd like, generate a Postman collection or an OpenAPI (Swagger) spec next — say "create OpenAPI" or "create Postman" and specify preferred format.
