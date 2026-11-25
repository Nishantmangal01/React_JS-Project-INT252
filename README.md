# ♻️ EcoCycle — E-Waste Collection & EPR Record Platform

> **Building a cleaner tomorrow** — A full-stack platform that connects citizens, authorized collection partners, recyclers, and participating organizations to collect e-waste responsibly and keep auditable recycling and EPR records.

---

## 🧠 About the Project

**EcoCycle** is a full-stack web application built to make e-waste collection simple, trackable, and accountable.

The platform enables:

- Citizens to request pickup of old electronics
- Collection centers and recyclers to update pickup status and enter verified weight
- Admins to approve partners and maintain recycling records
- Participating organizations to have their EPR (Extended Producer Responsibility) records maintained
- Every important change to be saved in an audit log

The system provides separate views for **Citizens**, **Partners**, and **Admins**, so each person sees only what they need.

---

## ✨ Features

- 🔐 **Secure Registration & Login** — Passwords are hashed with bcrypt, never stored in plain text
- 👥 **Role-Based Access** — Citizen, Partner, and Admin dashboards, checked on the server
- 📝 **Pickup Requests** — Citizens request collection with device type, quantity, and address
- 🚚 **Status Tracking** — Requested → Scheduled → Picked Up → Delivered to Recycler → Verified
- ⚖️ **Verified Weight Entry** — Partners record the verified weight in kg
- ✅ **Partner Approval** — Admin approves or rejects collection centers and recyclers
- 🏢 **Organizations** — Admin maintains the list of participating organizations
- 📄 **EPR Records** — Admin links verified requests to organizations (Verified requests only)
- 🧾 **Audit Log** — Every status change, approval, and EPR record shows who did it and when
- 📈 **Admin Overview** — Simple counts for requests, partners, weight, and EPR records
- ⏳ **Loading, Empty & Error States** — Clear messages on every data page
- 📱 **Responsive Design** — Works on desktop and mobile with a dark and teal theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React JS , JSX, React Router, Axios, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |


---

## 👤 User Roles

| Role | What They Can Do |
|------|------------------|
| 🙋 **Citizen** | Register, log in, request pickups, track own requests |
| 🚚 **Partner** | Register as a center or recycler, get approved, update status, enter verified weight |
| 🛡️ **Admin** | Approve partners, view all requests, manage organizations, create EPR records, view audit log |

> Participating organizations do not log in. The admin creates and maintains their records.

---

## 🔄 How It Works

1. A citizen registers and logs in.
2. The citizen submits an e-waste pickup request.
3. A collection partner registers and waits for admin approval.
4. The admin approves the partner.
5. The approved partner schedules the pickup and marks it as picked up.
6. The device is delivered to a recycler.
7. The recycler enters the verified weight, and the request becomes **Verified**.
8. The admin creates an EPR record linking the verified request to an organization.
9. The audit log records every step with who did it and when.

---

## 🏠 Main Modules

| Module | Description |
|--------|-------------|
| 👤 **Authentication** | Registration and login with hashed passwords |
| 📦 **Requests** | Create, view, and update collection requests |
| 🚚 **Partner Dashboard** | Update status and enter verified weight |
| ✅ **Partner Approval** | Admin approves or rejects partners |
| 🏢 **Organizations** | Participating organization records |
| 📄 **EPR Records** | Recycling records linked to organizations |
| 🧾 **Audit Log** | Who changed what, and when |
| 📈 **Admin Overview** | Counts and totals from the database |


---

## 📁 Project Structure

```
int252-project/
├── public/
├── src/
│   ├── Components/        Navbar, Footer, StatusBadge, StatCard, ProtectedRoute
│   ├── Pages/             Home, Login, Register, MyRequests, NewRequest,
│   │   │                  RequestDetails, PartnerDashboard
│   │   └── Admin/         AdminLayout, AdminHome, AdminPartners, AdminRequests,
│   │                      AdminOrganizations, AdminEpr, AdminAudit
│   ├── EcoCycle.jsx       App routes
│   ├── EcoCycle.css       Project styles
│   ├── Axios.jsx          Axios setup
│   └── main.jsx           Entry point
├── server.js              Express server and API routes
├── models.js              Mongoose models
├── seedAdmin.js           Creates the admin account
├── .env.example           Environment variable template
├── vite.config.js
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

### 1. Clone and install

```bash
git clone <your-repository-url>
cd int252-project
npm install
```

### 2. Set up MongoDB Atlas

1. Create a free **M0 cluster**.
2. In **Database Access**, create a database user.
3. In **Network Access**, allow your IP address.
4. In **Connect → Drivers**, copy your connection string and add the database name `ecocycle`.

### 3. Configure environment variables

Create a `.env` file in the project root (use `.env.example` as a template):

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecocycle
PORT=5000
```

> ⚠️ Never commit your `.env` file.

### 4. Create the admin account

```bash
node seedAdmin.js
```

Admin accounts cannot be created through public registration.

### 5. Run the project (two terminals)

```bash
# Terminal 1 — backend
npm run server

# Terminal 2 — frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt and never returned by the API
- Public registration cannot create an admin
- Every protected route checks the user's real role from the database
- The MongoDB connection string stays on the server only

### ⚠️ Known Limitation

This project does not use cookies or tokens for login sessions. After login, the browser stores the user id and sends it with each request, and the server verifies the role from the database. Because there is no signed token, someone who knows another user's id could pretend to be that user. This is acceptable for an academic project, but a production system should use signed sessions or JWT.

---

## ⚠️ Disclaimer

EPR records in this project are academic records stored in a database. They are not legally certified or government-approved.

---

## 📊 Future Improvements

- 🔑 JWT or signed-session authentication
- 📧 Email and SMS notifications
- 🔍 Search and filters
- 📄 CSV/PDF report export
- 🗺️ Pickup location map
- 📱 Progressive Web App support

---

## 👨‍💻 Developed By

**Nishant Mangal**

- 📧 mangalnishant1206@gmail.com
- 💻 Full Stack Developer
- 🎓 B.Tech Computer Science Engineering

---

## 🔗 Project Links

- 🌐 **Live Demo:** _Add your deployed link here_
- 💻 **GitHub Repository:** _Add your repository link here_
