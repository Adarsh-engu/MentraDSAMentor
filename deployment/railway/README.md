# Railway Deployment

If you prefer to deploy the backend to [Railway](https://railway.app/) instead of Render, use the configuration files provided in this directory. Railway does not currently support multi-service "Blueprints" in a single file quite like Render, so the setup requires a few manual steps through their UI, but it's very straightforward!

## 1. Provision Databases
First, create a new Railway Project and add the necessary managed databases:
1. Click **New** → **Database** → **Add PostgreSQL**.
2. Click **New** → **Database** → **Add Redis**.
3. (Optional but recommended for ChromaDB) Click **New** → **Docker Image** and type `chromadb/chroma:latest`. Then go to its settings, add a **Volume** mounted at `/chroma/chroma`, and set the Custom Domain to expose it internally. Add the Environment Variable `IS_PERSISTENT=TRUE`.

## 2. Deploy FastAPI Web Service
1. Click **New** → **GitHub Repo** and select the `algo-mentor` repository.
2. Go to the new service's **Settings** → **Service Mode** and ensure it's set to "Web".
3. Under **Build**, set the **Root Directory** to `/` (so it has access to the full repo).
4. Scroll down to **Deploy** and set the **Start Command** to:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Go to **Variables** and add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Use Railway's reference variables)
   - `REDIS_URL`: `${{Redis.REDIS_URL}}`
   - `CHROMA_URL`: URL of your ChromaDB container
   - `GROQ_API_KEY`: Your Groq API key
   - `AUTH_SECRET`: Your NextAuth secret

## 3. Deploy Celery Worker
1. Click **New** → **GitHub Repo** and select the `algo-mentor` repository *again* (this creates a second service for the worker).
2. Go to the new service's **Settings** → **Service Mode** and change it from "Web" to "Worker".
3. Under **Deploy**, set the **Start Command** to:
   ```bash
   cd backend && celery -A app.worker.celery_app worker --loglevel=info
   ```
4. Copy the exact same **Variables** from the Web Service into this Worker service.

> **Note:** The `railway-api.toml` and `railway-worker.toml` files in this folder contain the raw configuration code representing the above setup. You can use the Railway CLI (`railway link`) and these config files if you prefer deploying via terminal.
