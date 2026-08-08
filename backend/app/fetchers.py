import requests
from datetime import datetime, timedelta
import time
import concurrent.futures

_LC_TAGS_CACHE = None

def get_leetcode_tags_map():
    global _LC_TAGS_CACHE
    if _LC_TAGS_CACHE is not None:
        return _LC_TAGS_CACHE
        
    try:
        url = "https://leetcode.com/graphql"
        query = """
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
            data { titleSlug topicTags { name } }
          }
        }
        """
        tags_map = {}
        
        def fetch_batch(skip):
            variables = {"categorySlug": "", "skip": skip, "limit": 100, "filters": {}}
            res = requests.post(url, json={"query": query, "variables": variables}, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
            if res.ok:
                return res.json().get("data", {}).get("problemsetQuestionList", {}).get("data", [])
            return []

        # Fetch in parallel (40 batches * 100 = 4000 problems)
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_skip = {executor.submit(fetch_batch, skip): skip for skip in range(0, 4000, 100)}
            for future in concurrent.futures.as_completed(future_to_skip):
                questions = future.result()
                if questions:
                    for q in questions:
                        tags = [t.get("name") for t in q.get("topicTags", [])]
                        tags_map[q.get("titleSlug")] = ", ".join(tags) if tags else None
        
        _LC_TAGS_CACHE = tags_map
        return tags_map
    except Exception as e:
        print(f"Failed to fetch LC tags map: {e}")
    return {}

def fetch_leetcode_calendar_timestamps(handle: str):
    import json
    try:
        res = requests.get(f"https://alfa-leetcode-api.onrender.com/userProfileCalendar?username={handle}", timeout=10)
        if res.ok:
            data = res.json()
            calendar_str = data.get("submissionCalendar")
            if calendar_str:
                calendar = json.loads(calendar_str)
                timestamps = []
                for ts_str, count in calendar.items():
                    ts = int(ts_str)
                    for _ in range(count):
                        timestamps.append(datetime.fromtimestamp(ts))
                timestamps.sort()
                return timestamps
    except Exception as e:
        print(f"Failed to fetch LC calendar for {handle}: {e}")
    return []

def fetch_codeforces_submissions(handle: str):
    """
    Fetches all submissions for a given Codeforces handle.
    Codeforces API limits to 1 request per 0.2 seconds.
    """
    url = f"https://codeforces.com/api/user.status?handle={handle}"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch CF for {handle}: {response.text}")
        return []
    
    data = response.json()
    if data.get("status") != "OK":
        return []
        
    submissions = []
    for sub in data.get("result", []):
        prob = sub.get("problem", {})
        
        # Determine status
        verdict = sub.get("verdict")
        if verdict == "OK":
            status = "Accepted"
        elif verdict == "WRONG_ANSWER":
            status = "Wrong Answer"
        elif verdict == "TIME_LIMIT_EXCEEDED":
            status = "Time Limit Exceeded"
        elif verdict == "COMPILATION_ERROR":
            status = "Compilation Error"
        else:
            status = verdict
            
        submissions.append({
            "platform_problem_id": f"{prob.get('contestId')}{prob.get('index')}",
            "title": prob.get("name"),
            "difficulty": str(prob.get("rating", "N/A")),
            "url": f"https://codeforces.com/contest/{prob.get('contestId')}/problem/{prob.get('index')}",
            "status": status,
            "language": sub.get("programmingLanguage"),
            "submitted_at": datetime.fromtimestamp(sub.get("creationTimeSeconds")),
            "runtime_ms": sub.get("timeConsumedMillis"),
            "memory_kb": sub.get("memoryConsumedBytes", 0) // 1024 if sub.get("memoryConsumedBytes") else None,
            "tags": ", ".join(prob.get("tags", [])) if prob.get("tags") else None,
        })
        
    return submissions

def fetch_leetcode_submissions(handle: str, auth_token: str = None):
    """
    Fetches recent submissions for a LeetCode handle via Alfa API.
    """
    tags_map = get_leetcode_tags_map()
    
    if auth_token:
        # Use the unpaginated /api/problems/all/ endpoint to get ALL solved questions instantly
        url = "https://leetcode.com/api/problems/all/"
        cookies = {"LEETCODE_SESSION": auth_token}
        
        try:
            res = requests.get(url, cookies=cookies, timeout=10)
            if not res.ok:
                print(f"Failed to fetch authenticated LeetCode /api/problems/all/ for {handle}: {res.status_code}")
                return []
                
            data = res.json()
            
            # Identify accepted problems
            solved_pairs = [p for p in data.get("stat_status_pairs", []) if p.get("status") == "ac"]
            
            submissions = []
            
            # Fetch actual calendar timestamps for accurate heatmap
            calendar_timestamps = fetch_leetcode_calendar_timestamps(handle)
            fallback_date = datetime.now() - timedelta(days=365)
            
            for i, pair in enumerate(solved_pairs):
                stat = pair.get("stat", {})
                difficulty_level = pair.get("difficulty", {}).get("level", 0)
                diff_map = {1: "Easy", 2: "Medium", 3: "Hard"}
                
                title_slug = stat.get("question__title_slug")
                
                if i < len(calendar_timestamps):
                    date_to_use = calendar_timestamps[i]
                else:
                    date_to_use = fallback_date + timedelta(minutes=i)
                
                submissions.append({
                    "platform_problem_id": title_slug,
                    "title": stat.get("question__title"),
                    "difficulty": diff_map.get(difficulty_level, "Unknown"),
                    "url": f"https://leetcode.com/problems/{title_slug}/",
                    "status": "Accepted",
                    "language": "Unknown", # /api/problems/all doesn't tell us language
                    "submitted_at": date_to_use,
                    "runtime_ms": None,
                    "memory_kb": None,
                    "tags": tags_map.get(title_slug),
                })
                
            return submissions
        except Exception as e:
            print(f"Failed to fetch authenticated LeetCode for {handle}: {str(e)}")
            return []
    else:
        # Unauthenticated public fetch using Alfa LeetCode API
        # We fetch acSubmission to get all accepted submissions up to 10000
        try:
            api_url = f"https://alfa-leetcode-api.onrender.com/{handle}/acSubmission?limit=10000"
            response = requests.get(api_url, timeout=20)
            data = response.json()
            
            if "errors" in data or "submission" not in data:
                print(f"Alfa LeetCode API Error for {handle}: {data}")
                return []
                
            recent_subs = data.get("submission", [])
            if not recent_subs:
                return []
                
            submissions = []
            for sub in recent_subs:
                submissions.append({
                    "platform_problem_id": sub.get("titleSlug"),
                    "title": sub.get("title"),
                    "difficulty": "Unknown", 
                    "url": f"https://leetcode.com/problems/{sub.get('titleSlug')}/",
                    "status": sub.get("statusDisplay"),
                    "language": sub.get("lang"),
                    "submitted_at": datetime.fromtimestamp(int(sub.get("timestamp"))),
                    "runtime_ms": None,
                    "memory_kb": None,
                    "tags": tags_map.get(sub.get("titleSlug")),
                })
                
            return submissions
        except Exception as e:
            print(f"Failed to fetch public LeetCode for {handle}: {str(e)}")
            return []

def fetch_smartinterviews_submissions(handle: str, session_cookie: str = None):
    """
    Skeleton fetcher for Smart Interviews (The Hive).
    Since they have no public API, this would require BeautifulSoup or Playwright.
    If it requires a login, session_cookie will be passed in.
    """
    print(f"Mocking Smart Interviews fetch for {handle}")
    # TODO: Implement actual scraper here
    return []
