# Sparknet

Sparknet is a full-stack web application designed for family-friendly social interaction, parental safety controls, gamified challenges, and real-time communication. The platform combines custom AI engines for safety, behavior, recommendations, and content ranking with dedicated workflows for users, parents/guardians, and administrators.

---

## 🌟 Key Features

* **Authentication & Profiles:** Standard email/password authentication, OAuth integration, user profiles, and onboarding workflows.
* **Parental Controls & Guardian Dashboard:** Child activity tracking, screen time limits/sessions, guardian approval workflows, and child safety enforcement.
* **AI & Safety Engines:** Custom AI engines powering content recommendation, feed ranking, automated content moderation, behavior tracking, and safety analysis.
* **Social & Content Interaction:** Feed posts, comments, reactions, content scoring, report mechanisms, and saved posts.
* **Messaging & Real-Time Communication:** Direct/group messaging powered by Socket.io, connection management, and instant notifications.
* **Gamification & Challenges:** Interactive challenges, user achievement badges, and activity tracking/summaries.
* **Admin Dashboard:** Platform moderation controls, user management interfaces, and analytics insights.

---

## 🛠 Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS & PostCSS
* Axios
* Socket.io Client

**Backend:**
* Node.js & Express.js
* MongoDB / Mongoose
* Socket.io
* Passport.js (Authentication / OAuth)
* Docker support

---

## 📁 Repository Structure

```text
Sparknet-main/
├── backend/
│   ├── src/
│   │   ├── admin/           # Admin controllers & routes
│   │   ├── ai/              # Behavior, ranking, recommendation, and safety engines
│   │   ├── analytics/       # Analytics routes & services
│   │   ├── auth/            # Authentication, OAuth, and profile controllers
│   │   ├── challenges/      # Challenge management routes
│   │   ├── config/          # DB connection and app configurations
│   │   ├── content/         # Posts, comments, feeds, and interaction logic
│   │   ├── events/          # Event emitter instances
│   │   ├── family/          # Family and relation management
│   │   ├── gamification/    # Badges, achievements, and gamification controllers
│   │   ├── guardian/        # Parental controls & screen time services
│   │   ├── messaging/       # Real-time chat & conversation controllers
│   │   ├── middleware/      # Auth, rate limiting, and child safety enforcement
│   │   ├── models/          # Data schemas (User, Post, ActivityLog, etc.)
│   │   ├── moderation/      # Automated & manual content moderation
│   │   ├── notifications/   # System & push notifications
│   │   ├── sockets/         # Socket.io connection manager
│   │   ├── users/           # User connections & management
│   │   └── utils/           # JWT, email, validators, and file upload utils
│   ├── Dockerfile
│   └── package.json
│
└── sparknet-frontend/
    ├── src/
    │   ├── api/             # API client modules (admin, auth, guardian, posts, sockets)
    │   ├── components/      # UI components (auth, challenges, layout, posts, common)
    │   ├── context/         # React Context (AuthContext)
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Application views (Dashboard, Admin, Guardian, Chat, etc.)
    │   ├── routes/          # Protected and public routing logic
    │   └── utils/           # Helper functions
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16+ recommended)
* Docker (optional, for containerized execution)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Sparknet.git
   cd Sparknet
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   * Create a `.env` file in the `backend/` directory and configure environment variables (Database URL, JWT Secret, Mail credentials, OAuth keys).
   * Seed initial data (optional):
     ```bash
     node src/utils/seed.js
     ```
   * Start the backend development server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup:**
   ```bash
   cd ../sparknet-frontend
   npm install
   npm run dev
   ```

---

## 🐳 Running with Docker

Run the backend service using Docker:

```bash
cd backend
docker build -t sparknet-backend .
docker run -p 5000:5000 sparknet-backend
```

---

## 📄 License

This project is open-source and intended for educational and academic use.
