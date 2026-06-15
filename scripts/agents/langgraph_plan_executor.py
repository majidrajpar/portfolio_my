import os
from typing import TypedDict
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# ==============================================================================
# Configuration: Local LLM Setup
# ==============================================================================
dotenv_path = r"C:\Users\sorat\Desktop\Coding\Dev_api\.env.ollama"
load_dotenv(dotenv_path)

LLM_BASE_URL = os.environ.get("OLLAMA_BASE_URL")
LLM_API_KEY = os.environ.get("OLLAMA_API_KEY")

# Pick the models as defined in your .env.ollama routing configuration
CODING_MODEL_NAME = os.environ.get("OLLAMA_MODEL_CODING", "deepseek-v4-pro")
REVIEW_MODEL_NAME = os.environ.get("OLLAMA_MODEL_REASONING", "kimi-k2:1t")

# Initialize LangChain wrappers for the local Ollama proxy
coder_llm = ChatOpenAI(model=CODING_MODEL_NAME, base_url=LLM_BASE_URL, api_key=LLM_API_KEY)
reviewer_llm = ChatOpenAI(model=REVIEW_MODEL_NAME, base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

# ==============================================================================
# 1. Define the Graph State
# ==============================================================================
class AgentState(TypedDict):
    plan: str
    code_draft: str
    reviewer_feedback: str
    iteration: int

# ==============================================================================
# 2. Define the Nodes (Agents)
# ==============================================================================
def coder_agent(state: AgentState):
    """The coding agent drafts the exact file modifications."""
    print(f"\n👨‍💻 [Coder: {CODING_MODEL_NAME}] Drafting code to execute the plan...")
    
    prompt = f"""You are an elite coding agent working on an Astro & Tailwind CSS repository.
    Execute the following plan:
    {state['plan']}
    
    Previous Feedback to address (if any):
    {state.get('reviewer_feedback', 'None')}
    
    Provide the exact file paths and the specific code snippets or Tailwind class changes required to implement this plan. Do not use placeholders."""
    
    response = coder_llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "code_draft": response.content, 
        "iteration": state.get("iteration", 0) + 1
    }

def reviewer_agent(state: AgentState):
    """The reviewer agent checks if the code meets executive standards."""
    print(f"🧐 [Reviewer: {REVIEW_MODEL_NAME}] Checking code against executive standards...")
    
    prompt = f"""You are the Strict CMO from the previous review. Review these proposed code changes.
    Plan to execute: {state['plan']}
    Proposed Changes: {state['code_draft']}
    
    Check if the changes successfully remove junior-level aesthetics (e.g. script fonts, uncontained divs) and implement enterprise-grade Tailwind UI.
    If the code is perfect, reply EXACTLY with the word "APPROVED".
    If it fails the standard, provide harsh, specific feedback on what to fix."""
    
    response = reviewer_llm.invoke([HumanMessage(content=prompt)])
    
    return {"reviewer_feedback": response.content}

# ==============================================================================
# 3. Define the Edge Routing
# ==============================================================================
def review_router(state: AgentState):
    """Routes the workflow based on the reviewer's decision."""
    feedback = state.get("reviewer_feedback", "")
    
    if "APPROVED" in feedback.upper():
        print("✅ [Reviewer] Code Approved! Outputting final implementation plan.")
        return "end"
    
    if state["iteration"] >= 3:
        print("⚠️ [System] Max iterations reached. Outputting best attempt.")
        return "end"
        
    print("❌ [Reviewer] Code Rejected. Sending back to Coder.")
    return "coder"

# ==============================================================================
# 4. Build and Compile the LangGraph
# ==============================================================================
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("coder", coder_agent)
workflow.add_node("reviewer", reviewer_agent)

# Add Edges
workflow.set_entry_point("coder")
workflow.add_edge("coder", "reviewer")
workflow.add_conditional_edges(
    "reviewer",
    review_router,
    {"end": END, "coder": "coder"}
)

app = workflow.compile()

# ==============================================================================
# Execute the Plan
# ==============================================================================
if __name__ == "__main__":
    print("🚀 Firing up LangGraph Execution Engine...\n")
    
    # We feed it the Phase 1: Emergency plan from the CrewAI report
    emergency_plan = """
    Phase 1: Emergency Implementation Plan
    1. Containerize: Add a strict 1200px container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) to all main layouts.
    2. Typography: Kill any cursive/script font classes (e.g. `font-script`, `font-cursive`) and replace with clean geometric classes like `font-sans tracking-wide`.
    3. Remove Progress Bars: Rip out old progress bar UI components entirely and replace them with modern, minimal skill badges (`bg-slate-800 text-slate-300 rounded-full px-3 py-1`).
    4. Footer Fix: Delete the self-crediting "Designed and Developed by" footer and replace it with "© 2026 Majid Rajpar. All rights reserved."
    """
    
    final_state = app.invoke({"plan": emergency_plan, "iteration": 0})
    
    print("\n" + "="*60)
    print("🏆 FINAL APPROVED CODE IMPLEMENTATION:")
    print("="*60)
    print(final_state["code_draft"])
    print("="*60)
