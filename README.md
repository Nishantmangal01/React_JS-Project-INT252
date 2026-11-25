# EcoCycle: E-Waste Collection and EPR Record Platform

A class project (INT252). Citizens request pickup of e-waste, approved collection partners (centers and recyclers) update the pickup status and enter the verified weight, and an admin approves partners and maintains auditable EPR records for participating organizations.

**Stack:** React (Vite, `.jsx`), React Router, Axios, plain CSS, Express, MongoDB Atlas (Mongoose), bcryptjs.

## Why there is a backend
React runs in the browser. If the browser connected straight to MongoDB Atlas, the database username and password would be visible to everyone. So the browser talks only to a small Express server (`server.js`), and only that server talks to Atlas.

## Setup

1. Install packages: `npm install`
2. Create a free MongoDB Atlas account and an **M0** cluster.
3. **Database Access**: create a database user (avoid special characters in the password, or URL-encode them).
4. **Network Access**: add your IP. `0.0.0.0/0` (allow all) is fine for a class project, but it lets any IP try to connect, so protect it with a strong database password.
5. **Connect > Drivers**: copy the connection string and add the database name at the end, for example `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/ecocycle`.
6. Copy `.env.example` to `.env` and fill in `MONGODB_URI` (and `PORT=5000`). `.env` is listed in `.gitignore`; never commit it.
7. Create the admin account once: `npm run seed`
   Default login: `admin@ecocycle.com` / `Admin@123`. To change it, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before seeding.

## Run (two terminals)

```bash
npm run server   # Terminal 1: Express + Atlas on port 5000 (prints "MongoDB connected")
npm run dev      # Terminal 2: Vite on port 5173 (proxies /api to port 5000)
```

Open http://localhost:5173

## Demo flow
1. Register a **citizen**, log in, create a pickup request.
2. Register a **partner** (type recycler). Log in as admin, open **Partners**, approve it.
3. Log in as the partner, press **Picked Up**, then enter a weight and press **Verify**.
4. As admin, add an **Organization**, then create an **EPR record** (only Verified requests are listed).
5. Open **Audit Log** to see every step. Check the collections in Atlas under **Browse Collections**.

## Files
- `models.js`: the 5 Mongoose models (User, Request, Organization, EprRecord, AuditLog)
- `server.js`: Express app, `x-user-id` and role middleware, and all API routes
- `seedAdmin.js`: creates the admin account once
- `src/EcoCycle.jsx`: all routes (normal, dynamic `/requests/:id`, nested `/admin/...`)
- `src/Axios.jsx`: Axios instance that adds the `x-user-id` header
- `src/Components`: Navbar, Footer, StatusBadge, StatCard, ProtectedRoute
- `src/Pages`: all pages; `src/Pages/Admin` holds the admin pages

## API
All responses look like `{ success, message, data }`.

| Method and path | Who |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login` | public |
| `GET /api/requests`, `GET /api/requests/:id` | logged in (filtered by role) |
| `POST /api/requests` | citizen |
| `PATCH /api/requests/:id` | approved partner or admin |
| `GET /api/partners`, `PATCH /api/partners/:id` | admin |
| `GET/POST /api/organizations` | admin |
| `GET/POST /api/epr` (Verified requests only) | admin |
| `GET /api/audit`, `GET /api/stats` | admin |

## Limitations (important)
- **No cookies or JWT** (as required by the faculty). The browser stores `id`, `username` and `role` in `localStorage` and sends the user id in the `x-user-id` header. The server always re-checks the real role in MongoDB, but anyone who learns another user's id could pretend to be that user. This is acceptable for an academic project, not for production, which would use signed sessions or JWT.
- Login has no rate limiting or lockout.
- Partner requests: the first approved partner who updates an open request becomes its assigned partner. Admin can reassign through the API.
- A Verified request is final and cannot be edited, because its weight is copied into EPR records.
- Not tested with a real Atlas cluster by the author of this code; follow the demo flow above to check each feature.

## Future scope
Signed sessions or JWT, password reset, partner assignment screen, search and filters, email notifications.
