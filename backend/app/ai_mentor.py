import os
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

def get_ai_mentor_response(problem_title: str, chat_history: List[Dict[str, str]], similar_problems: List[Dict[str, Any]]):
    """
    problem_title: Title of the problem being asked about.
    chat_history: List of dicts with 'role' ('user' or 'ai') and 'content' (str)
    similar_problems: List of dicts representing similar problems retrieved from ChromaDB
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise Exception("Groq API key not configured")
        
    chat = ChatGroq(temperature=0.7, model_name="llama-3.1-8b-instant", groq_api_key=groq_api_key)
    
    # Construct System Prompt
    system_prompt = f"""You are the Algo Mentor, an elite competitive programming and algorithms tutor.
You are helping the user with the problem: "{problem_title}".

Provide hints, explanations, time complexities, or optimal approaches. Do not just hand them the complete raw solution unless they ask for it, guide them to the answer.
"""
    
    if similar_problems:
        system_prompt += "\n\nThe user has solved these semantically similar problems in the past:\n"
        for p in similar_problems:
            system_prompt += f"- {p['metadata'].get('title')} ({p['metadata'].get('difficulty')})\n"
        system_prompt += "\nYou can optionally mention these as references to build on their existing knowledge."
        
    messages = [SystemMessage(content=system_prompt)]
    
    # Add history
    for msg in chat_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            # skip the system online intro message to save tokens
            if "SYSTEM ONLINE" in msg["content"]:
                continue
            messages.append(AIMessage(content=msg["content"]))
            
    response = chat.invoke(messages)
    
    return {
        "response": response.content,
        "similar_problems_used": [p['metadata'] for p in similar_problems]
    }
