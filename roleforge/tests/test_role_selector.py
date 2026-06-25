"""
Tests for the Role Selector and LLM Role Recommender.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Add src to path
src_path = str(Path(__file__).parent.parent / "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Add project root
root_path = str(Path(__file__).parent.parent)
if root_path not in sys.path:
    sys.path.insert(0, root_path)

import pytest

from role_selector import RoleSelector, LLMRoleRecommender


class TestRoleSelector:
    def test_init_and_index(self):
        selector = RoleSelector()
        roles = selector.registry.list_roles()
        assert len(roles) == 31

    def test_recommend_basic(self):
        selector = RoleSelector()
        results = selector.recommend("audit cloud security", top_k=3)
        assert len(results) > 0
        # IT Auditor or Audit Report Writer should be in results
        role_names = [r["name"] for r in results]
        assert any("Audit" in name for name in role_names)

    def test_recommend_credit_risk(self):
        selector = RoleSelector()
        results = selector.recommend("assess credit risk loan portfolio", top_k=3)
        assert results[0]["name"] == "Credit Risk Analyst"
        assert results[0]["category"] == "risk"

    def test_recommend_team_diversity(self):
        selector = RoleSelector()
        team = selector.recommend_team("write corporate governance policy", team_size=3)
        assert len(team) == 3
        # Check category diversity
        categories = [m["category"] for m in team]
        assert len(set(categories)) >= 2  # At least 2 different categories

    def test_recommend_with_category_filter(self):
        selector = RoleSelector()
        results = selector.recommend(
            "audit", top_k=3, category_filter="audit"
        )
        assert len(results) > 0
        for r in results:
            assert r["category"] == "audit"

    def test_list_categories(self):
        selector = RoleSelector()
        categories = selector.list_categories()
        assert "audit" in categories
        assert "risk" in categories
        assert "philosophy" in categories
        assert len(categories) == 7

    def test_list_roles_in_category(self):
        selector = RoleSelector()
        roles = selector.list_roles_in_category("creative_writing")
        assert len(roles) == 4
        role_names = [r["name"] for r in roles]
        assert "Narrative Architect" in role_names
        assert "Character Developer" in role_names

    def test_get_role_by_id(self):
        selector = RoleSelector()
        role = selector.get_role_by_id("operational_risk_manager")
        assert role is not None
        assert role["name"] == "Operational Risk Manager"
        assert len(role["responsibilities"]) == 5

    def test_get_role_by_id_not_found(self):
        selector = RoleSelector()
        role = selector.get_role_by_id("nonexistent_role")
        assert role is None


class TestLLMRoleRecommender:
    def test_fallback_without_llm(self):
        recommender = LLMRoleRecommender(llm=None)
        results = recommender.recommend("audit security", top_k=3, use_llm=False)
        assert len(results) > 0

    def test_fallback_on_empty_llm(self):
        recommender = LLMRoleRecommender(llm=None)
        results = recommender.recommend("audit security", top_k=3, use_llm=True)
        assert len(results) > 0  # Should fallback to keyword matching


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
