# 🚀 Mentra DSA Mentor: Setup Guide

Welcome to the **Mentra DSA Mentor** repository! This guide will walk you through the exact steps required to clone this project from GitHub and get the entire architecture (Frontend, Backend, and AI Services) running perfectly on your local machine.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
1. **[Git](https://git-scm.com/)**: To clone the repository.
2. **[Node.js](https://nodejs.org/) (v18+)**: To run the Next.js frontend.
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: To run the microservices (Postgres, Redis, ChromaDB, FastAPI, Celery).

---

## 📥 Step 1: Clone the Repository

Open your terminal and run:
```bash
git clone https://github.com/Adarsh-engu/MentraDSAMentor.git
cd MentraDSAMentor
```

---

## 🔑 Step 2: Acquire API Keys

The application requires two external API services to function: Google OAuth (for login) and Groq (for the AI). Both are 100% free.

### A. Google OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a New Project.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Choose **Web application**.
6. Under **Authorized redirect URIs**, add exactly this URL:
   `http://localhost:3000/api/auth/callback/google`
7. Click **Save**. You will be given a `Client ID` and a `Client Secret`. Keep these tabbed.

### B. Groq API Key (For AI Mentorship)
1. Go to [GroqCloud](https://console.groq.com/keys).
2. Create a free account.
3. Click **Create API Key** and copy it.

---

## ⚙️ Step 3: Configure Environment Variables

1. In the root folder of the project, create a new file named `.env`.
2. Open the `.env` file and paste the following template:

```env
# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here
AUTH_SECRET=a_random_secure_string_like_mentra_secret_123

# AI Engine
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration (Do not change unless customizing Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=algo_mentor
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/algo_mentor
```
3. Replace the `your_google...` and `your_groq...` placeholders with the keys you generated in Step 2.

---

## 🐳 Step 4: Boot Up the Backend

We use Docker to effortlessly spin up 5 inter-connected services (API, Background Worker, Database, Redis Cache, and Vector Store).

1. Ensure **Docker Desktop** is open and running on your computer.
2. Open a terminal in the root `MentraDSAMentor` folder.
3. Run the following command:
```bash
docker-compose up -d
```
*(Note: The first time you run this, it may take 2-5 minutes as Docker downloads the necessary images and builds the Python API).*

**What happens here?**
- The `postgres` container boots up and automatically reads the `init.sql` file in the root directory to build all necessary database tables.
- The `api` and `celery_worker` containers boot up and connect to the database.

---

## 🌐 Step 5: Start the Frontend

Now that the backend is processing data, let's start the user interface!

1. Open a **new** terminal window (keep Docker running).
2. Navigate into the frontend directory:
```bash
cd frontend
```
3. Install the required Node dependencies:
```bash
npm install
```
4. Start the development server:
```bash
npm run dev
```

---

## 🎉 Step 6: You're Live!

Open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

1. Click **Login** (it will authenticate you via Google).
2. Go to the **Tracker** page and add your LeetCode handle.
3. Click **Sync** (this triggers the background worker to safely scrape your profile).
4. Jump into the **AI Mentor** chat and ask it for help on a specific problem!

### Troubleshooting
- **Docker Error (`failed to connect to docker API`)**: Ensure Docker Desktop is fully open and the engine icon has stopped animating before running `docker-compose up -d`.
- **Login fails (Redirect Mismatch)**: Ensure you correctly added `http://localhost:3000/api/auth/callback/google` to your Google Cloud Console Authorized URIs.
