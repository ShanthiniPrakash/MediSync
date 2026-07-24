# MediSync – Unified Multi-Hospital Healthcare Management Platform

MediSync is a production-ready, fully functional multi-hospital healthcare platform designed for hackathon MVP showcases (like the Smart India Hackathon). It bridges the gap between disparate hospitals by offering a centralized registry and clinical record management portal under two key modules: **Patient Module** and **Hospital Admin Module**, accompanied by a state-of-the-art one-click **Emergency Decryption Portal**.

---

## 🌟 Key Features

1. **Patient Registration & Auto UMRN/QR**: Automatic generation of a 12-digit Universal Medical Record Number (UMRN) and a directly renderable Base64 PNG QR Code.
2. **Unified Patient Timeline**: Complete clinical consultation logs (diagnoses, prescriptions, operations, doctor notes) presented chronologically.
3. **Pulsing Emergency Portal**: Fast-access red-alert screen designed for trauma bays to fetch vitals (blood group, allergies, active conditions) instantly via UMRN/QR with real-time audit logging.
4. **Downloadable Health Card**: Beautiful physical-looking glassmorphic ID card containing critical details and the QR Code, downloadable as an image file.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Bootstrap 5, Axios, React Icons, html2canvas.
* **Backend**: Java 17/21, Spring Boot 3.3.1, Spring Security (JWT-based session authentication), Spring Data JPA, Hibernate, ZXing QR Library.
* **Database**: MySQL 8.0+.

---

## 🚀 Installation & Running Guide

### Step 1: Database Setup
1. Ensure your local MySQL server is running on port `3306`.
2. Access MySQL command prompt and run the SQL initialization file:
   ```sql
   SOURCE db_schema.sql;
   ```
   *(Note: The database named `medisync` is automatically created. Root credentials are set to username `root` and password `1234` inside backend properties. Adjust `application.properties` if your password varies).*

### Step 2: Running the Spring Boot Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Compile and run using Maven (ensure JDK 17 or higher is set in your paths):
   ```bash
   mvn spring-boot:run
   ```
   *The server starts on port `8080`. It will automatically seed the database with active hospitals, the default admin account, and a complete sample patient record.*

### Step 3: Running the React Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the Vite hot-reloading dev server:
   ```bash
   npm run dev
   ```
   *The application will launch in your browser at `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

For testing and presentation flow:

| User Type | Username/Login ID | Password | Role / Purpose |
| :--- | :--- | :--- | :--- |
| **Hospital Admin** | `admin@medisync.com` | `admin123` | Registrations, medical logs, search |
| **Sample Patient** | `UMRN100000000001` | `15081995` *(dob as ddMMyyyy)* | Profile, Health Card print, records |

---

## 📡 REST API Documentation

### 🔐 Authentication Module
* **POST `/auth/login`**: Authenticate admin/patient.
  * *Request Body:* `{ "username": "...", "password": "..." }`
  * *Response:* Returns Bearer JWT, role, UMRN (if patient), and display name.

### 👤 Patient Module
* **POST `/patients/register`**: Register a new patient.
  * *Request Body:* Demographics, emergency contacts, allergy lists.
  * *Response:* Returns registered object with generated UMRN & QR.
* **GET `/patients`**: List all patients (supports query filter `?search=...`).
* **GET `/patients/{umrn}`**: Get detailed patient profile.
* **PUT `/patients/update?umrn={umrn}`**: Update patient demographics/alerts.
* **DELETE `/patients/{id}`**: Delete patient profile.

### 🩺 Clinical Records
* **POST `/medical-records`**: Log a new clinical checkup visit.
  * *Request Body:* `{ "patientId": 1, "hospitalId": 1, "diagnosis": "...", "prescription": "...", ... }`
  * *Response:* Returns saved entity and auto-registers a visit logs.
* **GET `/medical-records/{umrn}`**: Retrieve full medical history.
* **PUT `/medical-records/{id}`**: Edit details of an existing record.

### 🚨 Emergency portal
* **GET `/emergency/{umrn}`**: Fetch critical alert sheet (Name, Age, Blood, Alerts, Emergency Contact) by UMRN. Triggers backend database audit log.
* **GET `/emergency/logs`**: Review history of emergency portal requests.
