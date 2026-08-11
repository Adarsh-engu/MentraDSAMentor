import os

def generate_book():
    intro_content = """
# Mentra DSA Mentor: The Complete Architecture & Code Guide

## Table of Contents
1. **Chapter 1**: Introduction & System Architecture
2. **Chapter 2**: The Frontend (Next.js, NextAuth, Tailwind)
3. **Chapter 3**: The Backend (FastAPI, Celery, Postgres, Redis)
4. **Chapter 4**: AI Integration (Groq & ChromaDB)
5. **Chapter 5**: The Development Journey & Issues Resolved
6. **Chapter 6**: Codebase File-by-File Breakdown

---

## Chapter 1: Introduction & System Architecture

Mentra DSA Mentor is a cutting-edge platform designed to help students master Data Structures and Algorithms by leveraging Artificial Intelligence. It tracks their progress across multiple platforms (LeetCode, GitHub, etc.) and offers highly personalized recommendations based on past performance.

### The Stack:
- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, ShadCN UI, Framer Motion for animations.
- **Backend**: FastAPI (Python), providing a high-performance asynchronous API.
- **Workers**: Celery and Redis to handle long-running tasks such as fetching LeetCode submissions without blocking the API.
- **Database**: PostgreSQL for relational data (Users, Submissions) and ChromaDB for vector embeddings to perform AI similarity searches.
- **AI**: Groq API to provide instant, conversational AI mentoring.

---

## Chapter 2: The Frontend

The frontend is built using Next.js with the App Router. We utilized Server-Side Rendering (SSR) where possible and Client Components (`"use client"`) for interactive elements like the chat interface and the dynamic layout.
Authentication is handled entirely by `NextAuth.js` utilizing Google OAuth and storing sessions securely in our PostgreSQL database using the `@auth/pg-adapter`.

We used TailwindCSS for utility-first styling and incorporated Framer Motion to provide extremely polished, modern page transitions.

---

## Chapter 3: The Backend

The core of our logic resides in the FastAPI backend. It serves as the orchestrator.
When a user hits the Sync button, FastAPI offloads the heavy lifting to a Celery worker. The worker scrapes LeetCode, parses the submissions, and stores them in Postgres. 
Meanwhile, it converts problem descriptions into vector embeddings using a local embedding model, storing them in ChromaDB.

---

## Chapter 4: AI Integration (Groq & ChromaDB)

We chose Groq for its incredibly low-latency LLM inference, making the AI mentor feel truly conversational.
To find "Similar Problems", we use ChromaDB. Every solved problem is embedded into a vector space. When the user requests a similar problem, we query ChromaDB for the closest vectors, allowing us to recommend problems that teach similar concepts but offer a slight variation in difficulty.

---

## Chapter 5: The Development Journey & Issues Resolved

Building this massive system came with its share of challenges:
1. **Hydration Errors in Next.js**: We faced issues where the server-rendered HTML didn't match the client HTML (specifically with Recharts and dynamically loaded components). We solved this by using `next/dynamic` with `ssr: false` and ensuring conditional rendering happened only after the component mounted.
2. **Vercel Production Build Errors**: Vercel failed to build because it skipped `devDependencies` when we overrode the build command. We fixed this by removing the custom build command, letting Vercel's optimized engine handle Tailwind and PostCSS correctly.
3. **Database Connectivity on Vercel**: Vercel couldn't talk to our local Docker Postgres. We migrated the schema to Supabase to provide Vercel with a public `DATABASE_URL`.
4. **Celery Worker Syncing**: Getting FastAPI to trigger a Celery task required setting up Redis as the broker. We resolved this by defining a clear `celery_app` instance and ensuring the worker and API shared the exact same Redis URL.

---

## Chapter 6: Codebase File-by-File Breakdown

This chapter contains the entirety of the project source code. Every file has been meticulously included below for line-by-line review.

"""

    with open("book.md", "w", encoding="utf-8") as f:
        f.write(intro_content)

        # Walk through the directories
        exclude_dirs = {"node_modules", ".next", "__pycache__", ".git", "venv", "deployment", ".vscode"}
        exclude_files = {"package-lock.json", "book.md", "generate_book.py"}
        
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files or file.endswith((".png", ".jpg", ".ico", ".woff")):
                    continue
                
                filepath = os.path.join(root, file)
                
                # Write file header
                f.write(f"### File: `{filepath}`\n\n")
                f.write(f"**Purpose**: Core logic and implementation for `{file}`.\n\n")
                
                # Try to read and append file content
                try:
                    with open(filepath, "r", encoding="utf-8") as code_file:
                        code = code_file.read()
                        ext = file.split('.')[-1]
                        f.write(f"```{ext}\n{code}\n```\n\n")
                except Exception as e:
                    f.write(f"> Could not read file: {e}\n\n")

if __name__ == "__main__":
    generate_book()
    print("Successfully generated book.md")
