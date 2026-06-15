import asyncio
import os
from typing import Annotated

from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_agentchat.conditions import TextMentionTermination

# ==========================================
# 1. Define Tools for the Developer Agent
# ==========================================

def read_file(filepath: Annotated[str, "Path to the file to read"]) -> str:
    """Reads the content of a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

def list_files(directory: Annotated[str, "Directory path to list (e.g., './src' or './src/pages')"]) -> str:
    """Lists files and directories in a given path."""
    try:
        items = os.listdir(directory)
        output = []
        for item in items:
            path = os.path.join(directory, item)
            if os.path.isdir(path):
                output.append(f"[DIR]  {item}")
            else:
                output.append(f"[FILE] {item}")
        return "\n".join(output)
    except Exception as e:
        return f"Error listing directory: {e}"

def overwrite_file(filepath: Annotated[str, "Path to the file"], content: Annotated[str, "Full new content for the file"]) -> str:
    """Overwrites a file with new content. YOU MUST PROVIDE THE ENTIRE FILE CONTENT."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Success: Updated {filepath}"
    except Exception as e:
        return f"Error writing file: {e}"

# ==========================================
# 2. Main Async Execution
# ==========================================

async def main():
    # Read DeepSeek API key
    key_path = r"C:\Users\sorat\Desktop\Coding\Dev_api\deepseek.txt"
    if os.path.exists(key_path):
        with open(key_path, "r") as f:
            deepseek_key = f.read().strip()
    else:
        deepseek_key = os.environ.get("OPENAI_API_KEY", "")

    # Configure DeepSeek model client
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

    # 3. Define the Agents
    lead_implementer = AssistantAgent(
        name="Lead_Implementer",
        system_message=(
            "You are the Lead Implementer and Tech Lead. Your job is to:\n"
            "1. Read the 'autogen_website_review.md' file to understand the requested P0 and P1 changes.\n"
            "2. Instruct the Developer_Agent on exactly what needs to be changed (e.g., 'Find the hero section in src/pages/index.astro and update the CTA').\n"
            "3. Verify with the Developer_Agent that the changes were applied successfully.\n"
            "Once all priority tasks (P0 and P1) are complete, output exactly 'TERMINATE'."
        ),
        model_client=model_client,
        tools=[read_file, list_files]
    )

    developer_agent = AssistantAgent(
        name="Developer_Agent",
        system_message=(
            "You are an expert Web Developer (Astro, React, Tailwind). Your job is to implement changes "
            "requested by the Lead_Implementer.\n"
            "Use 'list_files' to explore the project structure.\n"
            "Use 'read_file' to examine code before changing it.\n"
            "Use 'overwrite_file' to apply changes. NEVER write partial code—always provide the FULL file content when overwriting.\n"
            "Confirm with the Lead_Implementer once a file is successfully updated."
        ),
        model_client=model_client,
        tools=[list_files, read_file, overwrite_file]
    )

    # 4. Create the Team
    termination = TextMentionTermination("TERMINATE")
    team = RoundRobinGroupChat(
        participants=[lead_implementer, developer_agent],
        termination_condition=termination,
        max_turns=30
    )

    artifact_path = r"C:\Users\sorat\.gemini\antigravity-cli\brain\04d797ae-a9f1-4442-89d6-8f053c2099a2\autogen_website_review.md"
    print("Starting AutoGen implementation phase...")
    print(f"Targeting review file at: {artifact_path}\n")

    task_prompt = (
        f"Please implement the P0 and P1 recommendations from the review.\n"
        f"Lead_Implementer, start by reading the review artifact located at '{artifact_path}'. "
        f"Then work with the Developer_Agent to find the relevant Astro/React files and update them."
    )
    
    await Console(team.run_stream(task=task_prompt))

if __name__ == "__main__":
    asyncio.run(main())
