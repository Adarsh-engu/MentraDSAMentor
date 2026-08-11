# 🧠 Mentra DSA Mentor

An intelligent, AI-driven Data Structures & Algorithms (DSA) mentoring platform designed to help software engineers master competitive programming and technical interviews. Mentra goes beyond simple progress tracking by syncing directly with your LeetCode profile and leveraging **Vector Databases** and **Large Language Models (LLMs)** to provide personalized problem recommendations and real-time conversational coaching.

## ✨ Features
- **🤖 AI Mentorship:** Stuck on a problem? The integrated AI acts as a Socratic mentor, giving you conceptual hints based on the specific problem without explicitly revealing the code.
- **🔍 Semantic Similarity Search:** Uses **ChromaDB** to convert algorithmic problems into high-dimensional mathematical vectors, allowing you to instantly find problems that require similar conceptual leaps (e.g., jumping from BFS to DFS).
- **📊 Real-Time Analytics:** Visualize your progress with highly dynamic, beautifully animated charts (Recharts + Framer Motion) displaying your submission history, heatmap, and category mastery.
- **🔄 Asynchronous Scraping:** A dedicated **Celery** worker constantly runs in the background to scrape and parse your LeetCode submissions without slowing down the application API.
- **🔐 Secure Authentication:** Passwordless login using **NextAuth** (Auth.js v5) with Google OAuth.

## 🛠️ Tech Stack
**Frontend:**
- [Next.js 14](https://nextjs.org/) (App Router & Server-Side Rendering)
- [React 18](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)

**Backend & AI Engine:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- [ChromaDB](https://www.trychroma.com/) (Vector Store)
- [Groq API](https://groq.com/) (LPU-powered ultra-fast LLM Inference)

**Infrastructure & Data:**
- [PostgreSQL](https://www.postgresql.org/) (Relational Data)
- [Redis](https://redis.io/) (Message Broker)
- [Celery](https://docs.celeryq.dev/en/stable/) (Background Task Queue)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Getting Started (Local Development)

The entire microservices architecture is containerized. With just two commands, you can spin up the API, Celery worker, Redis broker, PostgreSQL database, and ChromaDB vector store.

### Prerequisites
- **Docker & Docker Desktop** installed and running.
- **Node.js** (v18+) and npm.

### 1. Environment Variables
Create a `.env` file in the root directory and populate it with the following keys:
```env
# Google OAuth (For NextAuth)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=a_random_secure_string

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=algo_mentor
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/algo_mentor
```

### 2. Start the Backend Architecture
Make sure Docker Desktop is open, then run:
```bash
docker-compose up -d
```
*This command spins up 5 containers: `api`, `celery_worker`, `db`, `redis`, and `chroma`.*

### 3. Start the Next.js Frontend
Open a second terminal window and run:
```bash
cd frontend
npm install
npm run dev
```

The application is now live at **[http://localhost:3000](http://localhost:3000)**!

---

## 🏗️ Architecture Flow
1. **User Action:** The user clicks "Sync" on the Next.js frontend.
2. **API Delegation:** FastAPI receives the request and immediately pushes a task to the Redis message queue.
3. **Background Processing:** The Celery worker picks up the task from Redis, scrapes the data, and securely updates the PostgreSQL database.
4. **Vector Embedding:** New problems are automatically passed into ChromaDB, converted into vectors, and indexed for semantic search.
