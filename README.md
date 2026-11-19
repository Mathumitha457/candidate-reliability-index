# Reliabilix – Candidate Reliability Index

**Reliabilix** is a MERN stack web application designed to evaluate, track, and compare candidate reliability based on multiple performance metrics. It helps administrators, teachers, and HR teams manage candidate records and make data-driven decisions through interactive dashboards, visual reports, and automated alerts.

## 🚀 Live Demo

**Live Project:** https://candidate-reliability-index.vercel.app/

**GitHub Repository:** https://github.com/Mathumitha457/candidate-reliability-index

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Provides role-based permissions for Admin, Teacher, and HR users.
- **Interactive Dashboard:** Displays candidate statistics, grade distribution, department-wise performance, and top-performing candidates.
- **Candidate Management:** Add, view, edit, search, filter, and delete candidate records based on user permissions.
- **Detailed Candidate Profiles:** Displays individual candidate information and reliability metrics through interactive charts.
- **Reliability Score Calculation:** Automatically calculates candidate scores using attendance, performance, internship, and behavior metrics.
- **Candidate Comparison:** Compare up to four candidates side by side using performance metrics and radar charts.
- **PDF Report Export:** Generate and download candidate reliability reports in PDF format.
- **Bulk CSV Upload:** Import multiple candidate records using CSV files.
- **Automated Low-Score Alerts:** Sends email notifications to administrators when a candidate's reliability score falls below 50.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Data Visualization | Chart.js, react-chartjs-2 |
| PDF Generation | PDFKit |
| File Upload | Multer, csv-parser |
| Email Notifications | Nodemailer |
| UI & Styling | CSS, React Icons, React Hot Toast |
| Deployment | Vercel (Frontend), Render (Backend) |

## 📊 Reliability Score Calculation

The reliability score is calculated using four important parameters:

- Attendance – 25%
- Performance – 35%
- Internship – 20%
- Behavior – 20%

**Formula:**

```text
Reliability Score =
(Attendance × 0.25) +
(Performance × 0.35) +
(Internship × 0.20) +
(Behavior × 0.20)
```

### Grade Classification

| Score | Grade |
|---|---|
| 85 and above | Excellent |
| 70–84 | Good |
| 50–69 | Average |
| Below 50 | Poor |

A score below 50 triggers an automated email alert to the administrator.

## ⚙️ Project Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/Mathumitha457/candidate-reliability-index.git
```

```bash
cd candidate-reliability-index
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at the local development URL displayed in the terminal (usually `http://localhost:5173`).

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get logged-in user details |
| GET | `/api/candidates` | Retrieve candidate records |
| GET | `/api/candidates/stats` | Get dashboard statistics |
| GET | `/api/candidates/compare` | Compare selected candidates |
| GET | `/api/candidates/:id` | Get candidate details |
| POST | `/api/candidates` | Add a candidate |
| PUT | `/api/candidates/:id` | Update candidate details |
| DELETE | `/api/candidates/:id` | Delete a candidate |
| POST | `/api/candidates/bulk-upload` | Upload candidates using CSV |
| GET | `/api/candidates/:id/export-pdf` | Export candidate PDF report |

**Authentication:** Protected API routes require a valid JWT token.

## ☁️ Deployment

- **Frontend:** Deployed using Vercel.
- **Backend:** Deployed using Render.
- **Database:** Hosted on MongoDB Atlas.

The deployed frontend communicates with the production backend API.

## 👩‍💻 Author

**Mathumitha S**

B.E. Computer Science and Engineering

GitHub: https://github.com/Mathumitha457

---

⭐ If you find this project interesting, feel free to explore the repository and live demo.
