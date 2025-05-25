# 📄 Document Management Portal

A full-stack PDF document management system where users can:

* Register & log in using JWT authentication
* Upload and manage PDF files (max size: 10MB)
* Ask AI-powered questions based on uploaded document content
* Interact with a user-friendly interface built in React.js



## 💡 Tech Stack

* **Frontend:** React.js, Axios, React Router
* **Backend:** Django, Django REST Framework, SimpleJWT
* **AI Integration:** Gemini Flash 1.5 API (Google AI Studio)
* **Auth:** JWT (access + refresh tokens)
* **Files:** PDF only, max 10MB
* **Deployment:** Render.com (Backend), GitHub Pages or Vercel (Frontend)

---

## 📁 Features

* ✅ User registration & login
* 📂 Upload PDF documents
* 🗑️ Delete or update documents
* 🧐 Ask AI questions about document content
* 🔐 JWT-based secure authentication

---

## 🔧 Running Locally

### Backend (Django)

```bash
cd Backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

**Backend .env file:**

```env
SECRET_KEY=your-django-secret
DEBUG=True
GEMINI_API_KEY=your-gemini-key
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

**Frontend .env file:**

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🛋️ API Endpoints

| Endpoint               | Method     | Description                      |
| ---------------------- | ---------- | -------------------------------- |
| `/api/register/`       | POST       | Register new user                |
| `/api/login/`          | POST       | Login and get JWT tokens         |
| `/api/logout/`         | POST       | Logout (blacklist refresh token) |
| `/api/documents/`      | GET/POST   | List or upload documents         |
| `/api/documents/<id>/` | PUT/DELETE | Update or delete document        |
| `/api/ask/`            | POST       | Ask question about a PDF         |

---

## 🧑‍🔬 Gemini AI Integration

* Extracts text from uploaded PDFs using PyMuPDF (or Tesseract if needed)
* Uses extracted text + user question as context to query Gemini Flash 1.5 API
* Displays the generated answer to the user

---

## 📂 Project Structure

### Backend

```
Backend/
├── api/
├── document_portal/
├── media/
├── manage.py
├── db.sqlite3
├── .env
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Layout/
│   ├── services/
│   ├── utils/
│   ├── App.js, index.js
├── .env
```

---

## 📌 Deployment Notes

### Frontend

* Hosted using GitHub Pages or Vercel
* Ensure `homepage` is set in `package.json` if using GitHub Pages

### Backend

* Hosted on Render
* Uses SQLite (committed `db.sqlite3`)
* Set `SECRET_KEY`, `DEBUG`, `GEMINI_API_KEY` in Render Environment tab
