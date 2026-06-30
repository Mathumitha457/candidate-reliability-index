# Reliabilix – Candidate Reliability Index

Reliabilix is a professional MERN (MongoDB, Express, React, Node.js) application designed to track, evaluate, and benchmark candidate reliability metrics. The platform implements robust role-based access control (RBAC), interactive data visualizations, automated notifications, and reporting features.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):**
    *   `admin`: Full access to the system, including candidate management and dashboard metrics.
    *   `teacher`: Can add, edit, and delete candidate records that they have uploaded.
    *   `hr`: View-only access. Can search, filter, export reports, and compare candidates, but cannot add or modify records.
*   **Interactive Dashboard:** Features a grade distribution doughnut chart, a department-wise average score bar chart, key metric summary cards, and a table showing the top 5 performing candidates.
*   **Detailed Profile Views:** Interactive radar charts mapping individual metrics (Attendance, Performance, Internship, Behavior) side-by-side with profile cards.
*   **PDF Report Export:** Generates custom-styled, downloadable PDF reports on demand for any candidate using a backend `pdfkit` service.
*   **Candidate Comparison Benchmarking:** Select up to 4 candidates to view side-by-side metric sheets and compare them dynamically with multi-dataset radar chart overlays.
*   **Bulk CSV Uploads:** Allows teachers and admins to import candidate records in bulk using a drag-and-drop CSV parser.
*   **Low Score Automated Alerts:** Automatically triggers email notifications to system administrators via NodeMailer when a candidate's reliability index drops below 50.

---

## 🛠️ Technology Stack

*   **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JSON Web Tokens (JWT), `bcryptjs`, `pdfkit` (PDF streaming), `multer` & `csv-parser` (file uploads), `nodemailer` (email alerting).
*   **Frontend:** React 18, React Router v6, Axios (with authorization interceptors), Chart.js & `react-chartjs-2`, `react-hot-toast` (alerts), `react-icons`.
*   **Design & Theme:** Inter typography, sticky blurs, CSS variables custom themes.

---

## 📊 Reliability Score Formula

The reliability score and candidate grade are calculated automatically upon saving a candidate:

$$\text{Reliability Score} = \text{round}(\text{Attendance} \times 0.25 + \text{Performance} \times 0.35 + \text{Internship} \times 0.20 + \text{Behavior} \times 0.20)$$

### 📈 Grade Classifications
*   **Excellent:** $\ge 85$
*   **Good:** $\ge 70$
*   **Average:** $\ge 50$
*   **Poor:** $< 50$ (triggers automatic admin email alerts)

---

## ⚙️ Project Setup

### 1. Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas database instance

### 2. Environment Variables Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/reliabilix
JWT_SECRET=supersecretkey_reliabilix_12345
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 3. Installation & Run Commands

**Set Up & Start Backend:**
```bash
cd backend
npm install
npm start
# or npm run dev for nodemon development mode
```

**Set Up & Start Frontend:**
```bash
cd ../frontend
npm install
npm start
```
The application will open on `http://localhost:3000`.

---

## 🔑 Demo Access Accounts

For evaluation purposes, the database is automatically seeded on the first startup with the following accounts:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@reliabilix.com` | `admin123` | Administration |
| **Teacher** | `teacher@reliabilix.com` | `teacher123` | Computer Science |
| **HR** | `hr@reliabilix.com` | `hr123` | Human Resources |

---

## 🔌 API Reference Table

All candidate management routes require a valid JSON Web Token loaded in the `Authorization: Bearer <JWT>` request header.

| Method | Endpoint | Description | Auth Required | Permitted Roles |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user account | No | Public |
| **POST** | `/api/auth/login` | Login user & retrieve JWT token | No | Public |
| **GET** | `/api/auth/me` | Fetch authenticated user details | Yes | All roles |
| **GET** | `/api/candidates` | Retrieve candidate list (search + filter) | Yes | All roles (Teacher: own only) |
| **GET** | `/api/candidates/stats` | Fetch aggregated dashboard analytics | Yes | All roles (Teacher: own only) |
| **GET** | `/api/candidates/compare` | Compare candidate scores side-by-side | Yes | All roles |
| **GET** | `/api/candidates/:id` | Fetch single candidate details | Yes | All roles (Teacher: own only) |
| **POST** | `/api/candidates` | Register a new candidate manually | Yes | `teacher`, `admin` |
| **PUT** | `/api/candidates/:id` | Update candidate parameters | Yes | `teacher`, `admin` (Teacher: own only) |
| **DELETE** | `/api/candidates/:id` | Delete candidate record | Yes | `teacher`, `admin` (Teacher: own only) |
| **POST** | `/api/candidates/bulk-upload` | Import batch candidates via CSV file | Yes | `teacher`, `admin` |
| **GET** | `/api/candidates/:id/export-pdf` | Download formatted reliability PDF report | Yes | All roles (Teacher: own only) |

---

## 👤 Author
Developed and maintained by **Mathumitha** (GitHub: [@Mathumitha457](https://github.com/Mathumitha457)).
