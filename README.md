# 🎓 SkillSwap DBU

**SkillSwap DBU** is a peer-to-peer educational matching platform designed specifically for students at Debre Berhan University. It enables students to trade knowledge, find study partners, and book tutoring sessions using a modern, AI-driven interface.

---

## ✨ Features

- **AI-Powered Matching Engine:** Utilizes Google Gemini 2.5 to intelligently evaluate skill gaps and pair students based on "Offering" and "Wanted" profiles. 
- **Interactive Swipe Deck:** A premium, fluid swipe interface (powered by Framer Motion) allowing students to "Like" or "Skip" AI-curated study partners and tutors.
- **Real-Time Chat:** Integrated WebSockets allowing instant communication between matched students.
- **Secure Authentication:** Passwordless OTP email authentication via Supabase, ensuring verified student access.
- **Session Booking:** An intuitive system for scheduling and managing peer learning and tutoring sessions.
- **Dark Luxury UI:** A highly polished, aesthetic dark-themed frontend utilizing Tailwind CSS and custom glassmorphism components.

---

## 🛠️ Tech Stack

### Frontend (`/skillSwap`)
* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism & animations)
* **Animations:** Framer Motion
* **State Management:** Zustand
* **Routing:** React Router DOM
* **Icons:** Lucide React
* **API Client:** Axios

### Backend (`/backend`)
* **Framework:** Django 6.0 + Django REST Framework
* **Real-time / WebSockets:** Django Channels + Daphne ASGI
* **Database:** PostgreSQL (Hosted on Supabase) + `dj-database-url`
* **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
* **Authentication:** Supabase JWT Integration

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Mikiyas97/skillSwap.git
cd skillSwap
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Daphne ASGI server
python manage.py runserver
```

**Backend Environment Variables (`backend/.env`):**
```env
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=*
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_supabase_postgres_connection_string
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd skillSwap/skillSwap
npm install

# Start the Vite development server
npm run dev
```

**Frontend Environment Variables (`skillSwap/skillSwap/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 🌍 Deployment Options
- **Frontend:** Optimized for zero-config deployment on [Vercel](https://vercel.com/). Ensure the Root Directory is set to `skillSwap`.
- **Backend:** Configured for deployment on [Railway](https://railway.app/). Ensure the Root Directory is set to `/backend` and `ALLOWED_HOSTS` includes the Vercel domain.

---
*Built for the students of DBU to foster collaborative learning.*
