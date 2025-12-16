
---

# 📁 File Sharing Application


## 📌 Overview

The application focuses on **access control, security, and usability**, ensuring that files are only accessible to authorized users.

---

## 🎯 Objective

Build a full-stack application where:

* The **frontend** allows users to upload files and share them with other users.
* The **backend** handles file storage, sharing logic, and authorization.

---
## 🌍 Live Demo

> **Live Application URL:**
> https://secure-file-sharing-app-two.vercel.app/dashboard


## 🚀 Features

### 1. File Upload

* Upload files such as **PDFs.
* Supports **bulk file uploads**.
* Files are stored securely on the backend.
* Displays uploaded files in the dashboard with:

  * Filename
  * File type
  * File size
  * Upload date

---

### 2. File Sharing

#### a. Share with Specific Users

* File owners can share files with selected users.
* Only permitted users can view or download the file.
* Access is enforced via backend authorization checks.

#### b. Share via Link

* Generate a **secure, shareable link** for a file.
* Only **authenticated users** can access files using the link.
* Public access without login is **blocked**.

---

## 🔐 Access Control & Security (Critical)

* Strict authorization checks for:

  * File downloads
  * Shared links
  * User-specific access
* Unauthorized users **cannot access files**, even with a valid URL.
* Uploaded files are validated for:

  * Allowed file types
  * File size limits

---

## ⭐ Bonus Features Implemented

* **Link Expiry**

  * File owners can set an expiration time for shared users or links.
  * Access is automatically revoked after expiry.

* **File Compression**

  * Optional compression during upload to reduce storage usage.

---

## 🛠 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Lucide Icons

### Backend

* Node.js
* Express.js

### Database

* MongoDB

---

## 📂 Project Structure

```
client/
├── dist
├── node_modules
├── public
├── src
│   ├── assets
│   ├── components
│   ├── context
│   ├── services
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── output.css
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js

├── server/         
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── uploads/
├── README.md
└── package.json
```

---

## ⚙️ Installation & Local Setup

### Prerequisites

* Node.js (v18 or higher)
* MongoDB (local or cloud)

---

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekbhonde/secure-file-sharing-app
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```
Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api

```

The application will be available at:

```
http://localhost:5173
```

---


---

## 🧪 Test Credentials (Optional)

```
Email: abhishekb@gmail.com
Password: Abhishek
```

---

## 📎 Notes & Constraints

* All code is available in this GitHub repository.
* The application is live-hosted for easy testing.
* The solution focuses on **security, authorization, and real-world usability**.
* The UI is intentionally kept **clean and professional**, similar to modern SaaS products.

---

## 👤 Author

**Your Name**
Full-Stack Developer
GitHub: abhishekbhonde

---

## ✅ Assignment Checklist

* [x] File upload & bulk upload
* [x] Secure file storage
* [x] User-based file sharing
* [x] Share via link with authentication
* [x] Access control & authorization
* [x] Bonus feature(s) implemented
* [x] Live deployment
* [x] Local setup instructions

---


