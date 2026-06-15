import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import ScrapeWebsiteTool

# ==============================================================================
# Configuration: Local LLM Proxy Setup
# ==============================================================================
# Load the specific environment file
dotenv_path = r"C:\Users\sorat\Desktop\Coding\Dev_api\.env.ollama"
load_dotenv(dotenv_path)

LLM_BASE_URL = os.environ.get("OLLAMA_BASE_URL") 
LLM_API_KEY = os.environ.get("OLLAMA_API_KEY")

# Define the models using CrewAI's native LLM class (powered by LiteLLM)
# We prefix with 'openai/' to tell LiteLLM it's an OpenAI compatible endpoint
# Falling back to kimi-k2:1t for all models to bypass the 500 server error
vision_model = LLM(model="openai/kimi-k2:1t", base_url=LLM_BASE_URL, api_key=LLM_API_KEY)
content_model = LLM(model="openai/kimi-k2:1t", base_url=LLM_BASE_URL, api_key=LLM_API_KEY)
executive_model = LLM(model="openai/kimi-k2:1t", base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

# The target website to review
TARGET_URL = "https://majidrajpar.github.io/portfolio_my/"

# Instantiate tools (Allows the agents to read the actual live site content)
scrape_tool = ScrapeWebsiteTool(website_url=TARGET_URL)

# ==============================================================================
# 1. Define the Agents
# ==============================================================================

visual_designer = Agent(
    role='Enterprise Visual Design Expert',
    goal=f'Critique the visual hierarchy, color theory, layout balance, and premium polish of {TARGET_URL}.',
    backstory='You are a world-class UI/UX designer specializing in executive, enterprise-grade aesthetics. '
              'You can spot an amateur design from a mile away and know exactly how to elevate it to look expensive and premium.',
    verbose=True,
    allow_delegation=False,
    llm=vision_model,
    # Note: If the vision model requires actual image files rather than DOM parsing, 
    # you can pass screenshots as context to the task later. Here we give it the scraping tool 
    # to evaluate the structural HTML/Tailwind classes.
    tools=[scrape_tool]
)

branding_specialist = Agent(
    role='Professional Branding Specialist',
    goal='Scrutinize the copy, tone, and branding. Ensure phrasing matches a "leading professional".',
    backstory='You are a high-end copywriter and branding expert for C-suite executives. '
              'You ruthlessly eliminate weak adjectives and replace them with powerful, authoritative phrasing.',
    verbose=True,
    allow_delegation=False,
    llm=content_model,
    tools=[scrape_tool]
)

chief_marketing_officer = Agent(
    role='Strict Chief Marketing Officer (CMO)',
    goal='Perform the harshest, most critical executive review of the entire portfolio and website.',
    backstory='You are a strict CMO who demands absolute excellence. '
              'You ensure content is concise, impactful, and entirely free of fluff. You synthesize feedback into actionable recommendations.',
    verbose=True,
    allow_delegation=True,
    llm=executive_model
)

# ==============================================================================
# 2. Define the Tasks
# ==============================================================================

visual_review_task = Task(
    description=f'Analyze the frontend design and structure of {TARGET_URL}. Identify 3 areas where the UI design '
                f'lacks premium polish and suggest exactly how to fix them. Focus on visual hierarchy and layout balance.',
    expected_output='A detailed critique of the UI with 3 specific areas for improvement and actionable fixes.',
    agent=visual_designer
)

content_review_task = Task(
    description=f'Scrape and read the content from {TARGET_URL} (bio, project descriptions, case studies). '
                f'Critique the copy: Does it make the author sound like a leading professional? '
                f'Identify weak parts and rewrite them to sound more authoritative and executive.',
    expected_output='A critical analysis of the website copy, along with rewritten, authoritative versions of the weakest sections.',
    agent=branding_specialist
)

executive_review_task = Task(
    description='Review the overall website presentation, combining the insights from the visual designer and branding specialist. '
                'Provide a harsh, no-nonsense executive summary. Ensure your final recommendations are concise, impactful, and free of fluff.',
    expected_output='A final, harsh executive summary with bulleted, high-impact recommendations for the portfolio.',
    agent=chief_marketing_officer
)

# ==============================================================================
# 3. Form the Crew and Execute
# ==============================================================================

portfolio_review_crew = Crew(
    agents=[visual_designer, branding_specialist, chief_marketing_officer],
    tasks=[visual_review_task, content_review_task, executive_review_task],
    process=Process.sequential, # Execute sequentially so the CMO can review the preceding outputs
    verbose=True
)

if __name__ == "__main__":
    print("🚀 Starting the CrewAI Executive Portfolio Review...")
    print(f"Target: {TARGET_URL}\n")
    
    result = portfolio_review_crew.kickoff()
    
    print("\n\n" + "="*60)
    print("🏆 FINAL EXECUTIVE RECOMMENDATIONS:")
    print("="*60)
    print(result)
