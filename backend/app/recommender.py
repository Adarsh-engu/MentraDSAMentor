import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Expanded list of curated LeetCode problems grouped by topic and difficulty
CURATED_PROBLEMS = {
    "dynamic programming": {
        "Easy": [
            {"id": "70", "title": "Climbing Stairs", "difficulty": "Easy", "titleSlug": "climbing-stairs", "url": "https://leetcode.com/problems/climbing-stairs/"},
            {"id": "118", "title": "Pascal's Triangle", "difficulty": "Easy", "titleSlug": "pascals-triangle", "url": "https://leetcode.com/problems/pascals-triangle/"},
            {"id": "338", "title": "Counting Bits", "difficulty": "Easy", "titleSlug": "counting-bits", "url": "https://leetcode.com/problems/counting-bits/"},
            {"id": "392", "title": "Is Subsequence", "difficulty": "Easy", "titleSlug": "is-subsequence", "url": "https://leetcode.com/problems/is-subsequence/"},
            {"id": "746", "title": "Min Cost Climbing Stairs", "difficulty": "Easy", "titleSlug": "min-cost-climbing-stairs", "url": "https://leetcode.com/problems/min-cost-climbing-stairs/"}
        ],
        "Medium": [
            {"id": "322", "title": "Coin Change", "difficulty": "Medium", "titleSlug": "coin-change", "url": "https://leetcode.com/problems/coin-change/"},
            {"id": "300", "title": "Longest Increasing Subsequence", "difficulty": "Medium", "titleSlug": "longest-increasing-subsequence", "url": "https://leetcode.com/problems/longest-increasing-subsequence/"},
            {"id": "198", "title": "House Robber", "difficulty": "Medium", "titleSlug": "house-robber", "url": "https://leetcode.com/problems/house-robber/"},
            {"id": "213", "title": "House Robber II", "difficulty": "Medium", "titleSlug": "house-robber-ii", "url": "https://leetcode.com/problems/house-robber-ii/"},
            {"id": "5", "title": "Longest Palindromic Substring", "difficulty": "Medium", "titleSlug": "longest-palindromic-substring", "url": "https://leetcode.com/problems/longest-palindromic-substring/"},
            {"id": "62", "title": "Unique Paths", "difficulty": "Medium", "titleSlug": "unique-paths", "url": "https://leetcode.com/problems/unique-paths/"},
            {"id": "64", "title": "Minimum Path Sum", "difficulty": "Medium", "titleSlug": "minimum-path-sum", "url": "https://leetcode.com/problems/minimum-path-sum/"},
            {"id": "91", "title": "Decode Ways", "difficulty": "Medium", "titleSlug": "decode-ways", "url": "https://leetcode.com/problems/decode-ways/"}
        ],
        "Hard": [
            {"id": "72", "title": "Edit Distance", "difficulty": "Hard", "titleSlug": "edit-distance", "url": "https://leetcode.com/problems/edit-distance/"},
            {"id": "10", "title": "Regular Expression Matching", "difficulty": "Hard", "titleSlug": "regular-expression-matching", "url": "https://leetcode.com/problems/regular-expression-matching/"},
            {"id": "115", "title": "Distinct Subsequences", "difficulty": "Hard", "titleSlug": "distinct-subsequences", "url": "https://leetcode.com/problems/distinct-subsequences/"},
            {"id": "312", "title": "Burst Balloons", "difficulty": "Hard", "titleSlug": "burst-balloons", "url": "https://leetcode.com/problems/burst-balloons/"},
            {"id": "132", "title": "Palindrome Partitioning II", "difficulty": "Hard", "titleSlug": "palindrome-partitioning-ii", "url": "https://leetcode.com/problems/palindrome-partitioning-ii/"}
        ]
    },
    "binary search": {
        "Easy": [
            {"id": "704", "title": "Binary Search", "difficulty": "Easy", "titleSlug": "binary-search", "url": "https://leetcode.com/problems/binary-search/"},
            {"id": "278", "title": "First Bad Version", "difficulty": "Easy", "titleSlug": "first-bad-version", "url": "https://leetcode.com/problems/first-bad-version/"},
            {"id": "35", "title": "Search Insert Position", "difficulty": "Easy", "titleSlug": "search-insert-position", "url": "https://leetcode.com/problems/search-insert-position/"},
            {"id": "367", "title": "Valid Perfect Square", "difficulty": "Easy", "titleSlug": "valid-perfect-square", "url": "https://leetcode.com/problems/valid-perfect-square/"},
            {"id": "374", "title": "Guess Number Higher or Lower", "difficulty": "Easy", "titleSlug": "guess-number-higher-or-lower", "url": "https://leetcode.com/problems/guess-number-higher-or-lower/"}
        ],
        "Medium": [
            {"id": "33", "title": "Search in Rotated Sorted Array", "difficulty": "Medium", "titleSlug": "search-in-rotated-sorted-array", "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/"},
            {"id": "153", "title": "Find Minimum in Rotated Sorted Array", "difficulty": "Medium", "titleSlug": "find-minimum-in-rotated-sorted-array", "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"},
            {"id": "34", "title": "Find First and Last Position of Element in Sorted Array", "difficulty": "Medium", "titleSlug": "find-first-and-last-position-of-element-in-sorted-array", "url": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/"},
            {"id": "74", "title": "Search a 2D Matrix", "difficulty": "Medium", "titleSlug": "search-a-2d-matrix", "url": "https://leetcode.com/problems/search-a-2d-matrix/"},
            {"id": "875", "title": "Koko Eating Bananas", "difficulty": "Medium", "titleSlug": "koko-eating-bananas", "url": "https://leetcode.com/problems/koko-eating-bananas/"}
        ],
        "Hard": [
            {"id": "4", "title": "Median of Two Sorted Arrays", "difficulty": "Hard", "titleSlug": "median-of-two-sorted-arrays", "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/"},
            {"id": "154", "title": "Find Minimum in Rotated Sorted Array II", "difficulty": "Hard", "titleSlug": "find-minimum-in-rotated-sorted-array-ii", "url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/"},
            {"id": "410", "title": "Split Array Largest Sum", "difficulty": "Hard", "titleSlug": "split-array-largest-sum", "url": "https://leetcode.com/problems/split-array-largest-sum/"}
        ]
    },
    "sliding window": {
        "Easy": [
            {"id": "121", "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "titleSlug": "best-time-to-buy-and-sell-stock", "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},
            {"id": "219", "title": "Contains Duplicate II", "difficulty": "Easy", "titleSlug": "contains-duplicate-ii", "url": "https://leetcode.com/problems/contains-duplicate-ii/"},
            {"id": "643", "title": "Maximum Average Subarray I", "difficulty": "Easy", "titleSlug": "maximum-average-subarray-i", "url": "https://leetcode.com/problems/maximum-average-subarray-i/"}
        ],
        "Medium": [
            {"id": "3", "title": "Longest Substring Without Repeating Characters", "difficulty": "Medium", "titleSlug": "longest-substring-without-repeating-characters", "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
            {"id": "424", "title": "Longest Repeating Character Replacement", "difficulty": "Medium", "titleSlug": "longest-repeating-character-replacement", "url": "https://leetcode.com/problems/longest-repeating-character-replacement/"},
            {"id": "567", "title": "Permutation in String", "difficulty": "Medium", "titleSlug": "permutation-in-string", "url": "https://leetcode.com/problems/permutation-in-string/"},
            {"id": "438", "title": "Find All Anagrams in a String", "difficulty": "Medium", "titleSlug": "find-all-anagrams-in-a-string", "url": "https://leetcode.com/problems/find-all-anagrams-in-a-string/"},
            {"id": "1004", "title": "Max Consecutive Ones III", "difficulty": "Medium", "titleSlug": "max-consecutive-ones-iii", "url": "https://leetcode.com/problems/max-consecutive-ones-iii/"}
        ],
        "Hard": [
            {"id": "76", "title": "Minimum Window Substring", "difficulty": "Hard", "titleSlug": "minimum-window-substring", "url": "https://leetcode.com/problems/minimum-window-substring/"},
            {"id": "239", "title": "Sliding Window Maximum", "difficulty": "Hard", "titleSlug": "sliding-window-maximum", "url": "https://leetcode.com/problems/sliding-window-maximum/"},
            {"id": "992", "title": "Subarrays with K Different Integers", "difficulty": "Hard", "titleSlug": "subarrays-with-k-different-integers", "url": "https://leetcode.com/problems/subarrays-with-k-different-integers/"}
        ]
    },
    "tree": {
        "Easy": [
            {"id": "104", "title": "Maximum Depth of Binary Tree", "difficulty": "Easy", "titleSlug": "maximum-depth-of-binary-tree", "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"},
            {"id": "226", "title": "Invert Binary Tree", "difficulty": "Easy", "titleSlug": "invert-binary-tree", "url": "https://leetcode.com/problems/invert-binary-tree/"},
            {"id": "100", "title": "Same Tree", "difficulty": "Easy", "titleSlug": "same-tree", "url": "https://leetcode.com/problems/same-tree/"},
            {"id": "112", "title": "Path Sum", "difficulty": "Easy", "titleSlug": "path-sum", "url": "https://leetcode.com/problems/path-sum/"},
            {"id": "543", "title": "Diameter of Binary Tree", "difficulty": "Easy", "titleSlug": "diameter-of-binary-tree", "url": "https://leetcode.com/problems/diameter-of-binary-tree/"}
        ],
        "Medium": [
            {"id": "102", "title": "Binary Tree Level Order Traversal", "difficulty": "Medium", "titleSlug": "binary-tree-level-order-traversal", "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
            {"id": "236", "title": "Lowest Common Ancestor of a Binary Tree", "difficulty": "Medium", "titleSlug": "lowest-common-ancestor-of-a-binary-tree", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"},
            {"id": "105", "title": "Construct Binary Tree from Preorder and Inorder Traversal", "difficulty": "Medium", "titleSlug": "construct-binary-tree-from-preorder-and-inorder-traversal", "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"},
            {"id": "199", "title": "Binary Tree Right Side View", "difficulty": "Medium", "titleSlug": "binary-tree-right-side-view", "url": "https://leetcode.com/problems/binary-tree-right-side-view/"},
            {"id": "114", "title": "Flatten Binary Tree to Linked List", "difficulty": "Medium", "titleSlug": "flatten-binary-tree-to-linked-list", "url": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/"}
        ],
        "Hard": [
            {"id": "124", "title": "Binary Tree Maximum Path Sum", "difficulty": "Hard", "titleSlug": "binary-tree-maximum-path-sum", "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/"},
            {"id": "297", "title": "Serialize and Deserialize Binary Tree", "difficulty": "Hard", "titleSlug": "serialize-and-deserialize-binary-tree", "url": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"},
            {"id": "968", "title": "Binary Tree Cameras", "difficulty": "Hard", "titleSlug": "binary-tree-cameras", "url": "https://leetcode.com/problems/binary-tree-cameras/"}
        ]
    },
    "graph": {
        "Easy": [
            {"id": "733", "title": "Flood Fill", "difficulty": "Easy", "titleSlug": "flood-fill", "url": "https://leetcode.com/problems/flood-fill/"},
            {"id": "997", "title": "Find the Town Judge", "difficulty": "Easy", "titleSlug": "find-the-town-judge", "url": "https://leetcode.com/problems/find-the-town-judge/"},
            {"id": "1791", "title": "Find Center of Star Graph", "difficulty": "Easy", "titleSlug": "find-center-of-star-graph", "url": "https://leetcode.com/problems/find-center-of-star-graph/"}
        ],
        "Medium": [
            {"id": "200", "title": "Number of Islands", "difficulty": "Medium", "titleSlug": "number-of-islands", "url": "https://leetcode.com/problems/number-of-islands/"},
            {"id": "207", "title": "Course Schedule", "difficulty": "Medium", "titleSlug": "course-schedule", "url": "https://leetcode.com/problems/course-schedule/"},
            {"id": "133", "title": "Clone Graph", "difficulty": "Medium", "titleSlug": "clone-graph", "url": "https://leetcode.com/problems/clone-graph/"},
            {"id": "417", "title": "Pacific Atlantic Water Flow", "difficulty": "Medium", "titleSlug": "pacific-atlantic-water-flow", "url": "https://leetcode.com/problems/pacific-atlantic-water-flow/"},
            {"id": "684", "title": "Redundant Connection", "difficulty": "Medium", "titleSlug": "redundant-connection", "url": "https://leetcode.com/problems/redundant-connection/"}
        ],
        "Hard": [
            {"id": "127", "title": "Word Ladder", "difficulty": "Hard", "titleSlug": "word-ladder", "url": "https://leetcode.com/problems/word-ladder/"},
            {"id": "212", "title": "Word Search II", "difficulty": "Hard", "titleSlug": "word-search-ii", "url": "https://leetcode.com/problems/word-search-ii/"},
            {"id": "329", "title": "Longest Increasing Path in a Matrix", "difficulty": "Hard", "titleSlug": "longest-increasing-path-in-a-matrix", "url": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/"}
        ]
    }
}

CORE_TOPICS = ["dynamic programming", "binary search", "sliding window", "tree", "graph"]

def get_recommendations(solved_problems: List[Any]) -> Dict[str, Any]:
    # Extract tags and difficulties of solved problems
    solved_titles = {p.title for p in solved_problems}
    
    topic_counts = {t: 0 for t in CORE_TOPICS}
    
    # Analyze recent momentum (last 20 submissions)
    # Sort solved problems by submitted_at
    sorted_problems = sorted(solved_problems, key=lambda p: p.submitted_at, reverse=True)
    recent_problems = sorted_problems[:20]
    
    recent_topic_counts = {}
    recent_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}
    
    for p in recent_problems:
        diff = p.difficulty if p.difficulty in recent_difficulty else "Medium"
        recent_difficulty[diff] += 1
        if p.tags:
            for tag in p.tags.split(", "):
                t = tag.strip().lower()
                if t in recent_topic_counts:
                    recent_topic_counts[t] += 1
                else:
                    recent_topic_counts[t] = 1
                if t in topic_counts:
                    topic_counts[t] += 1
                    
    # Also count all history for weak points
    for p in solved_problems:
        if p.tags:
            for tag in p.tags.split(", "):
                t = tag.strip().lower()
                if t in topic_counts:
                    topic_counts[t] += 1

    # 1. Weak Point (Gap Analysis)
    # Find the core topic with the lowest count
    weak_topic = min(topic_counts, key=topic_counts.get)
    
    # 2. Progressive Mastery (Momentum)
    # Find the most dominant topic in recent history (excluding the weak topic)
    momentum_topic = None
    
    # Try to find their strongest recent topic that isn't their weakest
    valid_recent = {k: v for k, v in recent_topic_counts.items() if k != weak_topic and k in CURATED_PROBLEMS}
    if valid_recent:
        momentum_topic = max(valid_recent, key=valid_recent.get)
    
    # If they don't have recent activity in other curated topics, find their strongest historical topic
    if not momentum_topic:
        valid_history = {k: v for k, v in topic_counts.items() if k != weak_topic and k in CURATED_PROBLEMS}
        if valid_history:
            momentum_topic = max(valid_history, key=valid_history.get)
        else:
            # Absolute fallback
            momentum_topic = random.choice([t for t in CORE_TOPICS if t != weak_topic])
        
    # Determine the difficulty to suggest for Momentum
    # If they mostly solve Mediums, suggest Hard. If mostly Easy, suggest Medium.
    momentum_diff = "Medium"
    if recent_difficulty["Medium"] > recent_difficulty["Easy"] and recent_difficulty["Medium"] > recent_difficulty["Hard"]:
        momentum_diff = "Hard"
    elif recent_difficulty["Hard"] > recent_difficulty["Medium"]:
        momentum_diff = "Hard"
    elif recent_difficulty["Easy"] > recent_difficulty["Medium"]:
        momentum_diff = "Medium"

    def get_unsolved_curated(topic: str, target_difficulty: str = None) -> List[Dict]:
        topic_normalized = topic.lower()
        if topic_normalized not in CURATED_PROBLEMS:
            # Fallback to a random topic that isn't the current one to guarantee variety
            topic_normalized = random.choice([t for t in CORE_TOPICS if t != weak_topic])
            
        # Gather from all difficulties
        pool = []
        for diff in CURATED_PROBLEMS[topic_normalized]:
            pool.extend(CURATED_PROBLEMS[topic_normalized][diff])
                
        unsolved = [p for p in pool if p["title"] not in solved_titles]
        
        # Shuffle first so items within same difficulty are randomized
        random.shuffle(unsolved)
        
        if target_difficulty:
            # Prioritize target_difficulty by sorting (True sorts after False, so we negate condition)
            unsolved.sort(key=lambda p: p.get("difficulty") != target_difficulty)
            
        # If we have less than 15, mix in concepts from other topics!
        if len(unsolved) < 15:
            other_topics = [t for t in CORE_TOPICS if t != topic_normalized]
            other_pool = []
            for ot in other_topics:
                if ot in CURATED_PROBLEMS:
                    for diff in CURATED_PROBLEMS[ot]:
                        other_pool.extend(CURATED_PROBLEMS[ot][diff])
            
            other_unsolved = [p for p in other_pool if p["title"] not in solved_titles]
            random.shuffle(other_unsolved)
            
            if target_difficulty:
                other_unsolved.sort(key=lambda p: p.get("difficulty") != target_difficulty)
                
            # Append enough to reach 15
            needed = 15 - len(unsolved)
            unsolved.extend(other_unsolved[:needed])
            
        return unsolved[:15]

    # Generate Weak Point recommendations
    weak_recs = get_unsolved_curated(weak_topic)
    
    # Generate Momentum recommendations
    momentum_recs = get_unsolved_curated(momentum_topic, momentum_diff)
    
    return {
        "weak_point": {
            "topic": weak_topic.title(),
            "recommendations": weak_recs
        },
        "progressive_mastery": {
            "topic": momentum_topic.title(),
            "target_difficulty": momentum_diff,
            "recommendations": momentum_recs
        }
    }
