from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
import os
import json
import requests
import datetime

from .database import get_db
from . import models, schemas, worker, ai_mentor, vector_db, auth

app = FastAPI(title="Algo Mentor API")

# Configure CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Algo Mentor API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/platforms", response_model=List[schemas.PlatformResponse])
def get_platforms(db: Session = Depends(get_db)):
    return db.query(models.Platform).all()

@app.get("/users/{user_id}/profile", response_model=schemas.UserProfileResponse)
def get_user_profile(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}/profile", response_model=schemas.UserProfileResponse)
def update_user_profile(payload: schemas.UserProfileUpdate, user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if payload.name is not None:
        user.name = payload.name
    if payload.college is not None:
        user.college = payload.college
    if payload.dob is not None:
        user.dob = payload.dob
    if payload.summary is not None:
        user.summary = payload.summary
        
    db.commit()
    db.refresh(user)
    return user

@app.get("/users/{user_id}/heatmap")
def get_user_combined_heatmap(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    try:
        # Check for LeetCode platform link
        lc_platform = db.query(models.Platform).filter(models.Platform.name == "LeetCode").first()
        user_lc_link = None
        if lc_platform:
            user_lc_link = db.query(models.UserPlatform).filter(
                models.UserPlatform.user_id == user_id,
                models.UserPlatform.platform_id == lc_platform.id
            ).first()
            
        # Always fetch LeetCode calendar from public API because our DB timestamps are faked for historical syncs
        fetch_lc_public = False
        if user_lc_link and user_lc_link.handle:
            fetch_lc_public = True
            
        # Query local DB for submissions
        query = db.query(
            func.date(models.Submission.submitted_at).label("date"),
            func.count(models.Submission.id).label("count")
        ).filter(models.Submission.user_id == user_id)
        
        # Exclude LeetCode submissions from DB if we're using public API to avoid double-counting
        if fetch_lc_public:
            query = query.join(models.Problem).filter(models.Problem.platform_id != lc_platform.id)
            
        results = query.group_by(func.date(models.Submission.submitted_at)).all()
        activity_by_date = {str(r.date): r.count for r in results}
        
        # Merge public LeetCode calendar if needed
        if fetch_lc_public and user_lc_link.handle:
            try:
                url = f"https://alfa-leetcode-api.onrender.com/{user_lc_link.handle}/calendar"
                response = requests.get(url, timeout=10)
                if response.ok:
                    data = response.json()
                    calendar_str = data.get("submissionCalendar", "{}")
                    calendar_data = json.loads(calendar_str)
                    for ts_str, count in calendar_data.items():
                        dt = datetime.datetime.fromtimestamp(int(ts_str))
                        date_str = dt.strftime("%Y-%m-%d")
                        activity_by_date[date_str] = activity_by_date.get(date_str, 0) + count
            except Exception as e:
                print(f"Failed to fetch public LC calendar: {e}")
        
        heatmap = []
        today = datetime.datetime.now()
        start_date = today - datetime.timedelta(days=364)
        
        for i in range(365):
            current_date = start_date + datetime.timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")
            count = activity_by_date.get(date_str, 0)
            
            if count == 0:
                level = 0
            elif count <= 2:
                level = 1
            elif count <= 4:
                level = 2
            elif count <= 6:
                level = 3
            else:
                level = 4
                
            heatmap.append({
                "date": date_str,
                "count": count,
                "level": level
            })
            
        return heatmap
    except Exception as e:
        print(f"Failed to fetch combined heatmap for user {user_id}: {e}")
        return []
@app.get("/users/{user_id}/solved-problems")
def get_user_solved_problems(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    try:
        from sqlalchemy import func
        solved_subs = db.query(
            models.Problem.id,
            models.Problem.title,
            models.Problem.difficulty,
            models.Problem.url,
            models.Problem.tags,
            models.Platform.name.label("platform_name"),
            func.max(models.Submission.submitted_at).label("submitted_at")
        ).join(
            models.Submission, models.Submission.problem_id == models.Problem.id
        ).join(
            models.Platform, models.Platform.id == models.Problem.platform_id
        ).filter(
            models.Submission.user_id == user_id,
            models.Submission.status == "Accepted"
        ).group_by(
            models.Problem.id,
            models.Problem.title,
            models.Problem.difficulty,
            models.Problem.url,
            models.Problem.tags,
            models.Platform.name
        ).all()
        
        results = []
        for p in solved_subs:
            results.append({
                "id": str(p.id),
                "title": p.title,
                "difficulty": p.difficulty,
                "url": p.url,
                "tags": p.tags.split(", ") if p.tags else [],
                "platform": p.platform_name,
                "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None
            })
            
        return results
    except Exception as e:
        print(f"Failed to fetch solved problems for user {user_id}: {e}")
        return []

@app.get("/users/{user_id}/recommendations")
def get_user_recommendations(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    try:
        from .recommender import get_recommendations
        
        solved_subs = db.query(
            models.Submission
        ).join(
            models.Problem, models.Submission.problem_id == models.Problem.id
        ).filter(
            models.Submission.user_id == user_id,
            models.Submission.status == "Accepted"
        ).order_by(models.Submission.submitted_at.desc()).all()
        
        # In SQLAlchemy, the joined problem is accessible via backref (sub.problem)
        # But we need to pass objects that have title, tags, difficulty, submitted_at
        class SimpleProb:
            def __init__(self, s):
                self.title = s.problem.title
                self.tags = s.problem.tags
                self.difficulty = s.problem.difficulty
                self.submitted_at = s.submitted_at
                
        problems = [SimpleProb(s) for s in solved_subs]
        
        recs = get_recommendations(problems)
        return recs
    except Exception as e:
        print(f"Failed to fetch recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{user_id}/platforms", response_model=List[schemas.UserPlatformResponse])
def get_user_platforms(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    return db.query(models.UserPlatform).filter(models.UserPlatform.user_id == user_id).all()

@app.post("/users/{user_id}/platforms", response_model=schemas.UserPlatformResponse)
def link_user_platform(payload: schemas.UserPlatformCreate, user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if platform exists
    platform = db.query(models.Platform).filter(models.Platform.id == payload.platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
        
    existing_link = db.query(models.UserPlatform).filter(
        models.UserPlatform.user_id == user_id,
        models.UserPlatform.platform_id == payload.platform_id
    ).first()
    
    if existing_link:
        existing_link.handle = payload.handle
        existing_link.auth_token = payload.auth_token
        db.commit()
        db.refresh(existing_link)
        return existing_link
        
    new_link = models.UserPlatform(
        user_id=user_id,
        platform_id=payload.platform_id,
        handle=payload.handle,
        auth_token=payload.auth_token
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    return new_link

@app.post("/users/{user_id}/sync")
def sync_user_platforms(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    """
    Triggers a Celery task to fetch latest submissions for all platforms linked by the user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Trigger celery task
    worker.sync_platforms_task.delay(str(user_id))
    
    return {"message": "Sync started in the background"}

from sqlalchemy import func
from datetime import timedelta

@app.get("/users/{user_id}/submissions", response_model=schemas.PaginatedSubmissions)
def get_user_submissions(page: int = 1, size: int = 20, user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    query = db.query(models.Submission).filter(models.Submission.user_id == user_id).order_by(models.Submission.submitted_at.desc())
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return schemas.PaginatedSubmissions(items=items, total=total, page=page, size=size)

@app.get("/users/{user_id}/dashboard-stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    submissions = db.query(models.Submission).filter(models.Submission.user_id == user_id).all()
    total = len(submissions)
    accepted = sum(1 for s in submissions if s.status.lower() in ["accepted", "ok"])
    
    # Heatmap data (aggregate by date string YYYY-MM-DD)
    date_counts = {}
    for sub in submissions:
        date_str = sub.submitted_at.strftime("%Y-%m-%d")
        date_counts[date_str] = date_counts.get(date_str, 0) + 1
        
    heatmap = [{"date": k, "count": v} for k, v in date_counts.items()]
    
    # Platform distribution
    platform_counts = {}
    for sub in submissions:
        # Avoid N+1 in a real app, but this is okay for prototype
        p_name = sub.problem.platform.name
        platform_counts[p_name] = platform_counts.get(p_name, 0) + 1
        
    platform_distribution = [{"name": k, "count": v} for k, v in platform_counts.items()]
    
    return schemas.DashboardStatsResponse(
        total_submissions=total,
        total_accepted=accepted,
        heatmap=heatmap,
        platform_distribution=platform_distribution
    )

@app.get("/users/{user_id}/analytics", response_model=schemas.AnalyticsResponse)
def get_user_analytics(user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    
    # Get all accepted submissions
    submissions = db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.status.in_(["Accepted", "OK", "accepted", "ok"])
    ).all()
    
    total_accepted = len(submissions)
    unique_problems = {sub.problem_id for sub in submissions}
    total_unique_problems = len(unique_problems)
    
    # Topics for Radar (Top 6 Core)
    CORE_TOPICS = ["array", "string", "dynamic programming", "tree", "graph", "math"]
    topic_counts = {t: 0 for t in CORE_TOPICS}
    
    # Difficulty Stats
    diff_stats = {"Easy": 0, "Medium": 0, "Hard": 0}
    
    # Date tracking for Line Chart and Streak
    dates_solved = set()
    
    for sub in submissions:
        d = sub.problem.difficulty
        if d in diff_stats:
            diff_stats[d] += 1
            
        if sub.problem.tags:
            tags = [t.strip().lower() for t in sub.problem.tags.split(",")]
            for t in tags:
                if t in topic_counts:
                    topic_counts[t] += 1
                    
        d_str = sub.submitted_at.strftime("%Y-%m-%d")
        dates_solved.add(d_str)

    max_count = max(topic_counts.values()) if topic_counts.values() else 10
    full_mark = max(max_count + 10, 150)
    radar_data = []
    for t in CORE_TOPICS:
        radar_data.append({
            "subject": t.title(),
            "A": topic_counts[t],
            "fullMark": full_mark
        })
        
    today = datetime.utcnow().date()
    line_data = []
    daily_subs = {}
    for sub in submissions:
        d = sub.submitted_at.date()
        if d >= today - timedelta(days=6):
            d_str = d.strftime("%m-%d")
            daily_subs[d_str] = daily_subs.get(d_str, 0) + 1
            
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%m-%d")
        line_data.append({
            "time": d_str,
            "load": daily_subs.get(d_str, 0)
        })
        
    streak = 0
    curr_date = today
    # Also count streak if they haven't solved today but solved yesterday
    if curr_date.strftime("%Y-%m-%d") not in dates_solved:
        curr_date -= timedelta(days=1)
        
    while curr_date.strftime("%Y-%m-%d") in dates_solved:
        streak += 1
        curr_date -= timedelta(days=1)
        
    mastery_score = (diff_stats["Easy"] * 10) + (diff_stats["Medium"] * 30) + (diff_stats["Hard"] * 50) + (streak * 15)
        
    return schemas.AnalyticsResponse(
        radar_data=radar_data,
        line_data=line_data,
        difficulty_distribution=schemas.DifficultyStats(**diff_stats),
        total_unique_problems=total_unique_problems,
        current_streak=streak,
        total_accepted=total_accepted,
        mastery_score=mastery_score
    )

@app.get("/problems/{problem_id}/similar")
def get_similar_problems(problem_id: UUID, n: int = 5, db: Session = Depends(get_db), _current_user: UUID = Depends(auth.get_current_user)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    from .vector_db import search_similar_problems
    try:
        similar = search_similar_problems(str(problem.id), f"{problem.title} ({problem.difficulty})", n_results=n)
        
        # Fetch the actual URLs and platform names from the DB
        sim_ids = [sim["id"] for sim in similar]
        db_probs = db.query(models.Problem).filter(models.Problem.id.in_(sim_ids)).all()
        
        prob_map = {str(p.id): {"url": p.url, "platform": p.platform.name if p.platform else "Unknown"} for p in db_probs}
        
        for sim in similar:
            if sim["id"] in prob_map:
                sim["metadata"]["url"] = prob_map[sim["id"]]["url"]
                sim["metadata"]["platform_name"] = prob_map[sim["id"]]["platform"]
                
        return {"problem_id": problem_id, "similar_problems": similar}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/problems/{problem_id}/chat")
def chat_with_mentor(problem_id: UUID, payload: schemas.ChatMessage, db: Session = Depends(get_db), _current_user: UUID = Depends(auth.get_current_user)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key == "your_groq_api_key":
        raise HTTPException(status_code=400, detail="Groq API key not configured")
        
    try:
        from .vector_db import search_similar_problems
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage, SystemMessage
        
        similar_problems = search_similar_problems(str(problem.id), f"{problem.title} ({problem.difficulty})", n_results=3)
        
        similar_context = ""
        if similar_problems:
            similar_context = "\nSimilar problems the user has in their history:\n"
            for sim in similar_problems:
                similar_context += f"- {sim['metadata'].get('title')} ({sim['metadata'].get('difficulty')})\n"
                
        llm = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=groq_api_key)
        
        system_msg = (
            "You are an expert algorithms mentor helping a student. "
            f"The student is asking about the problem '{problem.title}' on {problem.platform.name}. "
            f"{similar_context}"
            "Provide helpful hints, optimize their approach, or explain concepts clearly. "
            "Keep your responses concise, encouraging, and formatted in Markdown. Do not just give the code immediately unless asked."
        )
        
        messages = [
            SystemMessage(content=system_msg),
            HumanMessage(content=payload.message)
        ]
        
        response = llm.invoke(messages)
        
        return {"response": response.content, "similar_problems_used": similar_problems}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{user_id}/chat")
def chat_with_mentor_v2(payload: schemas.AiMentorChatRequest, user_id: UUID = Depends(auth.verify_user_access), db: Session = Depends(get_db)):
    from uuid import UUID
    
    problem_title = ""
    problem_difficulty = ""
    problem_platform = "LeetCode"
    problem_id_str = ""
    
    try:
        # Try as UUID first
        uid = UUID(payload.problem_id)
        problem = db.query(models.Problem).filter(models.Problem.id == uid).first()
        if problem:
            problem_title = problem.title
            problem_difficulty = problem.difficulty
            problem_platform = problem.platform.name
            problem_id_str = str(problem.id)
    except ValueError:
        pass
        
    if not problem_title:
        # Try fetching from curated problems in recommender
        from .recommender import CURATED_PROBLEMS
        found = False
        for diffs in CURATED_PROBLEMS.values():
            for prob_list in diffs.values():
                for prob in prob_list:
                    if prob.get("titleSlug") == payload.problem_id or prob.get("id") == payload.problem_id or prob.get("platform_problem_id") == payload.problem_id:
                        problem_title = prob.get("title")
                        problem_difficulty = prob.get("difficulty")
                        problem_id_str = payload.problem_id
                        found = True
                        break
                if found: break
            if found: break
            
        if not found:
            raise HTTPException(status_code=404, detail="Problem not found in history or curated list.")
        
    try:
        from .vector_db import search_similar_problems
        from .ai_mentor import get_ai_mentor_response
        
        similar_problems = search_similar_problems(problem_id_str, f"{problem_title} ({problem_difficulty})", n_results=3)
        
        response = get_ai_mentor_response(
            problem_title=f"{problem_title} on {problem_platform}",
            chat_history=payload.history,
            similar_problems=similar_problems
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
