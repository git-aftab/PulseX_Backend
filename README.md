# 🚑 PulseX Backend

> **PulseX — Intelligent RoadSOS Backend for Real-Time Accident Detection & Emergency Response Coordination**

A scalable backend system built for handling emergency incidents, ambulance coordination, hospital assignment, realtime communication, and geospatial emergency response workflows.

---

# ✨ Features

* 🔐 JWT Authentication & Role-Based Access
* 🚑 Ambulance Registration & Live Location Tracking
* 🏥 Nearby Hospital Discovery using Geo Queries
* ⚡ Intelligent Incident Assignment
* 📡 Realtime Updates with Socket.IO
* 📶 MQTT Integration Support
* 🌍 MongoDB Geospatial Queries (`2dsphere`)
* 🧠 Automated Emergency Coordination Workflow
* 🛡 Secure Cookie + Bearer Token Support

---

# 📦 Tech Stack

| Technology         | Purpose                    |
| ------------------ | -------------------------- |
| Node.js            | Backend Runtime            |
| Express.js         | API Framework              |
| MongoDB + Mongoose | Database                   |
| Socket.IO          | Realtime Communication     |
| MQTT               | IoT / Device Communication |
| JWT                | Authentication             |
| Nodemon            | Development Workflow       |

---

# 🚀 Quick Start

## 📋 Prerequisites

Make sure you have:

* Node.js `v18+`
* MongoDB (Local or Cloud)
* MQTT Broker *(optional)*

---

## ⚙️ Installation

```bash
git clone https://github.com/git-aftab/PulseX_Backend.git

cd PulseX_Backend

npm install
```

---

## ▶️ Run the Project

```bash
npm run dev
```

Runs:

```bash
nodemon src/index.js
```

---

## 🧪 Run Tests

```bash
npm test
```

Runs:

```bash
tests/test_hospital_assignment.js
```

---

# 🔑 Environment Variables

Create a `.env` file in the root directory.

```env
MONGO_URI=

PORT=3000

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

ADMIN_INVITE_KEY=

CORS_ORIGIN=http://localhost:5173

MQTT_URL=

NODE_ENV=development
```

---

# 🌐 Base URL

```txt
http://localhost:3000/api/v1
```

Example:

```txt
http://localhost:3000/api/v1/auth/login
```

---

# 📂 API Routes

---

# 🔐 Authentication Routes

## `/api/v1/auth`

### 📝 Register User

```http
POST /register
```

### Request Body

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "hospital"
}
```

### Notes

* Role assignment requires:

  * `x-admin-key` header
  * OR `adminKey` in body

---

### 🔑 Login

```http
POST /login
```

### Response

* Sets:

  * `accessToken`
  * `refreshToken`

* Returns:

```json
{
  "user": {},
  "accessToken": "",
  "refreshToken": ""
}
```

---

### ♻ Refresh Access Token

```http
POST /refresh-access-token
```

Accepts refresh token via:

* Cookie
* Request body

---

### 🚪 Logout

```http
POST /logout
```

* Clears auth cookies
* Requires authentication

---

### 👤 Assign Role

```http
POST /assign-role
```

* Admin only
* Middleware:

  * `verifyJWT`
  * `authorizeRoles("admin")`

---

### 🙋 Current User

```http
GET /me
```

Returns logged-in user details.

---

# ❤️ Healthcheck

```http
GET /healthcheck
```

Returns server health status.

---

# 🚑 Ambulance Routes

## `/api/v1/ambulances`

---

### 🚑 Register Ambulance

```http
POST /register
```

### Allowed Roles

* `ambulance_driver`
* `admin`

### Body

```json
{
  "vehicleNumber": "TN01AB1234",
  "driverLicenseNumber": "DL12345",
  "hospitalId": "hospital_id",
  "deviceId": "device_001"
}
```

---

### 👨‍⚕️ Get My Ambulance

```http
GET /me
```

Returns ambulance linked to logged-in driver.

---

### 📍 Update Ambulance Location

```http
PATCH /:id/location
```

### Body

```json
{
  "lng": 77.6,
  "lat": 12.9,
  "availabilityStatus": "AVAILABLE"
}
```

Updates:

* Current location
* Last active timestamp

---

### ✅ Accept Incident

```http
POST /:id/accept
```

Assigns ambulance to incident.

---

# 🏥 Hospital Routes

## `/api/v1/hospitals`

---

### 🏥 Register Hospital

```http
POST /register
```

### Body

```json
{
  "hospitalName": "City Hospital",
  "registrationNumber": "REG123",
  "coordinates": [77.6, 12.9],
  "contactNumber": "9876543210",
  "traumaLevel": "LEVEL_1",
  "totalBeds": 100,
  "availableBeds": 25,
  "emergencyAvailable": true
}
```

---

### 📍 Nearby Hospitals

```http
GET /nearby?lng=<lng>&lat=<lat>&radius=<meters>
```

Uses MongoDB geospatial queries.

---

### 👨‍⚕️ My Hospital

```http
GET /me
```

Returns current hospital profile.

---

# 🚨 Incident Routes

## `/api/v1/incidents`

---

### 🚨 Create Incident

```http
POST /
```

### Body

```json
{
  "lng": 77.6,
  "lat": 12.9,
  "deviceId": "dev123",
  "vitals": {
    "heartRate": 90
  }
}
```

### Workflow

* Creates incident
* Auto-assigns nearest hospital
* Emits realtime events

---

### 📡 Get Active Incidents

```http
GET /active
```

### Allowed Roles

* `ambulance_driver`
* `police`
* `hospital`
* `admin`

---

### 📍 Nearby Incidents

```http
GET /nearby?lng=<lng>&lat=<lat>&radius=<meters>
```

Returns nearby pending incidents.

---

### 🚑 Accept Incident

```http
POST /:id/accept
```

Atomically assigns ambulance.

---

### ✅ Resolve Incident

```http
POST /:id/resolve
```

* Marks incident as resolved
* Frees ambulance
* Releases hospital bed

---

### ❌ Cancel Incident

```http
PATCH /:id/cancel
```

Allowed for:

* Reporter
* Admin

---

# 🗄 Database Models

---

## 👤 User

```js
{
  fullname,
  email,
  username,
  phone,
  password,
  role,
  refreshToken
}
```

---

## 🏥 Hospital

```js
{
  user,
  hospitalName,
  registrationNumber,
  location,
  contactNumber,
  totalBeds,
  availableBeds,
  hospitalCapacityStatus
}
```

---

## 🚑 Ambulance

```js
{
  user,
  vehicleNumber,
  driverLicenseNumber,
  hospital,
  currentLocation,
  availabilityStatus
}
```

---

## 🚨 Incident

```js
{
  reporter,
  deviceId,
  location,
  status,
  assignedAmbulance,
  assignedHospital,
  vitals
}
```

---

# 🔐 Authentication System

PulseX supports:

* 🍪 Cookie-based authentication
* 🔑 Bearer Token authentication

Example:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

# 📡 Realtime & MQTT

Initialized in:

```txt
src/index.js
```

### Services

* `initSocket()`
* `initMqtt()`

---

## 📢 Socket Events

Examples:

* `incident_created`
* `incident_assigned`
* `incident_resolved`
* `incident_cancelled`

Namespaces:

* `/ambulance`
* `/hospital`
* `/police`
* `/user`

---

# 🧪 Sample cURL Requests

---

## Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{
  "fullname":"Alice",
  "email":"a@example.com",
  "password":"pass123",
  "phone":"0001112222"
}'
```

---

## Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email":"a@example.com",
  "password":"pass123"
}' -i
```

---

## Create Incident

```bash
curl -X POST http://localhost:3000/api/v1/incidents \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <ACCESS_TOKEN>" \
-d '{
  "lng":77.6,
  "lat":12.9,
  "deviceId":"dev123",
  "vitals":{
    "heartRate":90
  }
}'
```

---

## Nearby Hospitals

```bash
curl -X GET \
'http://localhost:3000/api/v1/hospitals/nearby?lng=77.6&lat=12.9&radius=5000' \
-H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Ambulance Accept Incident

```bash
curl -X POST \
http://localhost:3000/api/v1/incidents/<INCIDENT_ID>/accept \
-H "Authorization: Bearer <AMBULANCE_ACCESS_TOKEN>"
```

---

# 📈 Future Improvements

* 👨‍💼 Admin Dashboard APIs
* 📱 Device Registration APIs
* 📊 Metrics & Monitoring
* 🔔 Webhook Integrations
* 📘 OpenAPI / Swagger Docs
* 📮 Postman Collection
* 🧪 Full E2E Testing
* 🎟 Role Invitation System

---

# ⚠️ Notes & Troubleshooting

### 🌍 MongoDB Geospatial Queries

Requires:

```js
2dsphere index
```

Already configured in models.

---

### 🔐 Production Security

Do NOT use development JWT secrets in production.

Use strong secrets:

```env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

---

### 📡 MQTT Optional

The app still runs without MQTT if:

```env
MQTT_URL=
```

is not provided.

---

# 🤝 Contributing

Pull requests, improvements, and feature suggestions are welcome.

---

# 📄 License

MIT License

---

# ⭐ Support

If you found this project useful:

* ⭐ Star the repository
* 🍴 Fork the project
* 🛠 Contribute improvements

---

### 🚀 Built for smarter emergency response systems.
