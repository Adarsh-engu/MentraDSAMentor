import os
from celery import Celery
from .database import SessionLocal
from .models import UserPlatform, Platform, Problem, Submission
from .fetchers import fetch_codeforces_submissions, fetch_leetcode_submissions, fetch_smartinterviews_submissions

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery(
    "algo_mentor_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="sync_platforms_task")
def sync_platforms_task(user_id: str):
    db = SessionLocal()
    try:
        # Fetch all linked platforms for this user
        user_platforms = db.query(UserPlatform).filter(UserPlatform.user_id == user_id).all()
        
        for up in user_platforms:
            platform = db.query(Platform).filter(Platform.id == up.platform_id).first()
            if not platform:
                continue
                
            submissions_data = []
            if platform.name == "Codeforces":
                submissions_data = fetch_codeforces_submissions(up.handle)
            elif platform.name == "LeetCode":
                submissions_data = fetch_leetcode_submissions(up.handle, up.auth_token)
            elif platform.name == "Smart Interviews":
                submissions_data = fetch_smartinterviews_submissions(up.handle)
                
            for sub_data in submissions_data:
                # 1. Upsert Problem
                problem = db.query(Problem).filter(
                    Problem.platform_id == platform.id,
                    Problem.platform_problem_id == sub_data["platform_problem_id"]
                ).first()
                
                if not problem:
                    problem = Problem(
                        platform_id=platform.id,
                        platform_problem_id=sub_data["platform_problem_id"],
                        title=sub_data["title"],
                        difficulty=sub_data["difficulty"],
                        url=sub_data["url"],
                        tags=sub_data.get("tags")
                    )
                    db.add(problem)
                    db.commit()
                    db.refresh(problem)
                elif sub_data.get("tags") and not problem.tags:
                    problem.tags = sub_data.get("tags")
                    db.commit()
                
                # 2. Check if submission already exists for this problem
                existing_sub = db.query(Submission).filter(
                    Submission.user_id == user_id,
                    Submission.problem_id == problem.id
                ).first()
                
                if existing_sub:
                    # If it exists, update it only if the new submission is more recent
                    if sub_data["submitted_at"] and (not existing_sub.submitted_at or sub_data["submitted_at"] > existing_sub.submitted_at):
                        existing_sub.status = sub_data["status"]
                        existing_sub.language = sub_data["language"]
                        existing_sub.submitted_at = sub_data["submitted_at"]
                        existing_sub.runtime_ms = sub_data["runtime_ms"]
                        existing_sub.memory_kb = sub_data["memory_kb"]
                        db.add(existing_sub)
                else:
                    new_sub = Submission(
                        user_id=user_id,
                        problem_id=problem.id,
                        status=sub_data["status"],
                        language=sub_data["language"],
                        submitted_at=sub_data["submitted_at"],
                        runtime_ms=sub_data["runtime_ms"],
                        memory_kb=sub_data["memory_kb"],
                    )
                    db.add(new_sub)
                    
        db.commit()
        
        # Trigger embedding sync after pulling new problems
        sync_problem_embeddings_task.delay()
        
        return {"status": "success", "user_id": user_id, "message": "Synced platforms"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(name="sync_problem_embeddings_task")
def sync_problem_embeddings_task():
    db = SessionLocal()
    try:
        from .vector_db import upsert_problem_embeddings
        problems = db.query(Problem).all()
        
        problems_data = []
        for p in problems:
            problems_data.append({
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty,
                "platform_id": p.platform_id
            })
            
        upsert_problem_embeddings(problems_data)
        return {"status": "success", "message": f"Synced {len(problems_data)} embeddings to ChromaDB"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
