import asyncio
import os
import requests
from bs4 import BeautifulSoup

from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_agentchat.conditions import TextMentionTermination

# 1. Define the Custom Tool to scrape website content
def fetch_website_content(url: str) -> str:
    """Fetches and extracts text content from a given URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text and clean it up
        text = soup.get_text(separator=' ', strip=True)
        return text[:8000] # Limit characters to avoid exceeding context window
    except Exception as e:
        return f"Error fetching website: {e}"

async def main():
    # Read DeepSeek API key
    key_path = r"C:\Users\sorat\Desktop\Coding\Dev_api\deepseek.txt"
    if os.path.exists(key_path):
        with open(key_path, "r") as f:
            deepseek_key = f.read().strip()
    else:
        deepseek_key = os.environ.get("OPENAI_API_KEY", "")

    # Define the model client using DeepSeek API
    model_client = OpenAIChatCompletionClient(
        model="deepseek-chat",
        api_key=deepseek_key,
        base_url="https://api.deepseek.com",
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "family": "unknown"
        }
    )

    # 2. Define the Agents
    lead_reviewer = AssistantAgent(
        name="Lead_Reviewer",
        system_message=(
            "You are the Lead Reviewer and project manager. "
            "First, use the 'fetch_website_content' tool to get the content of the website and share it with the team. "
            "Then, ask the UX_Reviewer and Content_Reviewer for their feedback. "
            "Once both have provided their feedback, summarize the findings into a comprehensive executive summary. "
            "End your final summary with the word 'TERMINATE'."
        ),
        model_client=model_client,
        tools=[fetch_website_content]
    )

    ux_reviewer = AssistantAgent(
        name="UX_Reviewer",
        system_message=(
            "You are an expert UX/UI designer and web auditor. "
            "Review the structure, usability, and accessibility of the provided website text and context. "
            "Provide constructive feedback. Focus on layout inferences and user journey based on the copy."
        ),
        model_client=model_client,
    )

    content_reviewer = AssistantAgent(
        name="Content_Reviewer",
        system_message=(
            "You are an expert copywriter and career coach for executives (specifically Internal Audit & Finance). "
            "Review the text of the portfolio for impact, tone, clarity, and grammatical correctness. "
            "Provide actionable suggestions to improve the copy."
        ),
        model_client=model_client,
    )

    # 3. Create the Group Chat Team
    termination = TextMentionTermination("TERMINATE")
    team = RoundRobinGroupChat(
        participants=[lead_reviewer, ux_reviewer, content_reviewer],
        termination_condition=termination
    )

    url_to_review = "https://majidrajpar.github.io/portfolio_my/"
    print(f"Starting AutoGen review of: {url_to_review}\n")

    # 4. Run the simulation
    task_prompt = f"Please review the portfolio website at {url_to_review}. Lead_Reviewer, please fetch the website content first and guide the team."
    await Console(team.run_stream(task=task_prompt))

if __name__ == "__main__":
    asyncio.run(main())
