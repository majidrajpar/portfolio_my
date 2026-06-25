# Agent Roles Library

A framework-agnostic YAML-based library for defining agent roles, with tailored adapters for CrewAI, LangChain, and LangGraph.

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd roleforge

# Install dependencies with uv
uv sync
```

### Basic Usage

#### 1. Load and Discover Roles

```python
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from loader import RoleRegistry
from role_selector import RoleSelector

# Index all roles
registry = RoleRegistry()
registry.index()

# List all 31 roles
roles = registry.list_roles()
print(f"Loaded {len(roles)} roles")

# Search for specific roles
results = registry.search("risk")
for role in results:
    print(f"- {role.name} ({role.category})")
```

#### 2. Get Role Recommendations for a Task

```python
from role_selector import RoleSelector

selector = RoleSelector()

# Find best agents for your task
task = "I need to audit our cloud infrastructure for security risks"
recommendations = selector.recommend(task, top_k=3)

for i, role in enumerate(recommendations, 1):
    print(f"{i}. {role['name']} (Score: {role['score']})")
    print(f"   {role['description'][:100]}...")

# Or compose a multi-agent team
team = selector.recommend_team(
    "Write a corporate governance policy for AI usage",
    team_size=4
)
```

#### 3. Create a CrewAI Agent

```python
from crewai import LLM
from models import RuntimeContext
from adapters.crewai_adapter import CrewAIAdapter

# Load role with overlay
role, overlay = registry.get_role_with_overlay(
    "lead_internal_auditor", 
    "crewai"
)

# Create LLM
llm = LLM(
    model="kimi-k2.7-code:cloud",
    base_url="https://ollama.com/v1",
    api_key="your-api-key",
)

# Create runtime context
context = RuntimeContext(llm=llm, tools=[], allow_delegation=True)

# Adapt to CrewAI Agent
adapter = CrewAIAdapter(context)
agent = adapter.adapt(role, overlay.data if overlay else None)

# Use in a CrewAI Crew
from crewai import Task, Crew

task = Task(
    description="Assess IT controls and identify risks",
    expected_output="Risk assessment report",
    agent=agent,
)

crew = Crew(agents=[agent], tasks=[task])
result = crew.kickoff()
```

#### 4. Create a LangChain Chain

```python
from langchain_core.language_models.fake import FakeListLLM
from models import RuntimeContext
from adapters.langchain_adapter import LangChainAdapter

# Load role
role = registry.get("data_scientist")

# Create LLM
llm = FakeListLLM(responses=["Analysis complete"])

# Create runtime context with tools
context = RuntimeContext(llm=llm, tools=[])

# Adapt to LangChain chain
adapter = LangChainAdapter(context)
chain = adapter.adapt(role)

# Invoke
result = chain.invoke({"input": "Analyze this dataset"})
```

#### 5. Create a LangGraph Node

```python
from models import RuntimeContext
from adapters.langgraph_adapter import LangGraphAdapter
from graphs.templates import create_sequential_pipeline_graph

# Load roles
narrative = registry.get("narrative_architect")
editor = registry.get("developmental_editor")

# Create runtime context
context = RuntimeContext(llm=llm, tools=[])

# Create sequential pipeline graph
graph = create_sequential_pipeline_graph(
    roles=[narrative, editor],
    runtime_context=context,
)

# Execute
from langchain_core.messages import HumanMessage

result = graph.invoke({
    "messages": [HumanMessage(content="Write a sci-fi story outline")],
    "next": "",
})
```

### Advanced: Using LLM-Powered Recommendations

```python
from crewai import LLM
from role_selector import LLMRoleRecommender

# Initialize LLM
llm = LLM(model="kimi-k2.7-code:cloud", base_url="...", api_key="...")

# Create semantic recommender
recommender = LLMRoleRecommender(llm=llm)

# Get LLM-powered recommendations
results = recommender.recommend(
    "Evaluate the philosophical implications of AI consciousness",
    top_k=3,
    use_llm=True
)
```

## Project Structure

```
roleforge/
├── roles/              # 31 framework-agnostic role YAMLs
│   ├── audit/
│   ├── governance/
│   ├── risk/
│   ├── philosophy/
│   ├── creative_writing/
│   ├── book_writing/
│   └── data_analysis/
├── overlays/           # Framework-specific overlays
│   ├── crewai/        # 31 overlays with goals/backstories
│   └── langgraph/     # 31 overlays with node types
├── src/
│   ├── models.py      # RoleDefinition, RuntimeContext
│   ├── loader.py      # YAML loading & registry
│   ├── validators.py  # Deterministic validation
│   ├── role_selector.py # Query-to-agent matching
│   └── adapters/      # CrewAI, LangChain, LangGraph
├── graphs/
│   └── templates.py   # 9 pre-built LangGraph patterns
├── schemas/
│   └── role.schema.json
├── tests/             # 43 tests (pytest)
└── examples/          # Jupyter notebooks & demos
```

## Key Concepts

| Component | Purpose |
|---|---|
| **RoleDefinition** | Framework-agnostic YAML schema for agent personas |
| **RuntimeContext** | Framework-specific runtime config (LLM, tools, memory) |
| **Overlay** | Optional framework hints (CrewAI goals, LangGraph node types) |
| **Adapter** | Converts RoleDefinition + RuntimeContext → framework-native object |
| **RoleSelector** | Keyword-based query → agent matching |
| **LLMRoleRecommender** | Semantic query → agent matching using an LLM |

## Validation

```bash
# Validate all 31 roles and overlays
uv run python validate_roles.py

# Run all tests
uv run pytest tests/
```

## Requirements

- Python >= 3.11
- uv (dependency manager)
- Optional: Ollama Cloud API key for examples

See `pyproject.toml` for full dependency list.

## License

Elastic License 2.0 — see [LICENSE](LICENSE) for full details.

**What this means:**
- ✅ Free for personal, educational, and internal business use
- ✅ Free to embed in commercial products
- ✅ Free to modify and share
- ❌ Cannot offer as a competing managed/hosted service without permission
- ❌ Commercial SaaS requires a license

**Commercial Licensing:** For hosted service rights, enterprise support, and custom development, contact the maintainer.

**Philosophy:** The core library is free and open for the community. Commercial extraction as a service requires giving back through licensing.

