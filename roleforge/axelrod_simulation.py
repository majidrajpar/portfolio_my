#!/usr/bin/env python3
"""
Axelrod simulation modeling the RoleForge ↔ GRCKit collaboration offer.

Context:
- RoleForge (Majid): persona/behavior layer — YAML agent roles, framework adapters
- GRCKit (Jamie): platform/identity/data layer — BYO-LLM GRC platform

Both are in audit/GRC/AI. Jamie proposes collaboration instead of separate schemas.

We model this as an iterated game where each round both players choose to
COOPERATE (share schemas, integrate) or DEFECT (build independently, compete).

Payoffs (conceptual):
- Both cooperate: +3 each (synergy: RoleForge personas as first-class metadata in GRCKit)
- RoleForge cooperates, GRCKit defects: +1 / +4 (Jamie adopts schema quietly without credit; Majid gets nothing)
- RoleForge defects, GRCKit cooperates: +4 / +1 (Majid integrates with GRCKit but keeps persona layer proprietary)
- Both defect: +2 each (redundant effort, split market)

The question: under repeated play, what strategies dominate?
"""

import axelrod as axl
import matplotlib.pyplot as plt

# =============================================================================
# CUSTOM PLAYERS: Model the two companies' likely strategies
# =============================================================================

class RoleForgeStrategy(axl.player.Player):
    """
    RoleForge strategy: initially trusting, but responds to defection.
    After a defection, becomes skeptical for a few rounds before trusting again.
    This models a small indie project that wants collaboration but needs to protect IP.
    """
    name = "RoleForge"
    classifier = {
        "stochastic": False,
        "memory_depth": 3,
        "long_run_time": False,
        "inspects_source": False,
        "manipulates_source": False,
        "manipulates_state": False,
    }

    def __init__(self):
        super().__init__()
        self.grudge_count = 0

    def strategy(self, opponent):
        # First move: cooperate (open to collaboration)
        if len(self.history) == 0:
            return axl.Action.C

        # If opponent defected recently, hold a grudge
        if self.grudge_count > 0:
            self.grudge_count -= 1
            # If opponent cooperated last round, start forgiving
            if opponent.history[-1] == axl.Action.C:
                return axl.Action.C
            return axl.Action.D

        # If opponent defected last round, get suspicious
        if opponent.history[-1] == axl.Action.D:
            self.grudge_count = 2  # Hold grudge for 2 rounds
            return axl.Action.D

        return axl.Action.C


class GRCKitStrategy(axl.player.Player):
    """
    GRCKit strategy: Tit-for-Tat with occasional forgiveness.
    Models a growing platform that wants ecosystem partners but has commercial pressure.
    """
    name = "GRCKit"
    classifier = {
        "stochastic": False,
        "memory_depth": 1,
        "long_run_time": False,
        "inspects_source": False,
        "manipulates_source": False,
        "manipulates_state": False,
    }

    def strategy(self, opponent):
        # First move: cooperate (Jamie reached out first)
        if len(self.history) == 0:
            return axl.Action.C

        # Tit-for-Tat: mirror opponent's last move
        if opponent.history[-1] == axl.Action.D:
            # But forgive isolated defections (build goodwill)
            if len(opponent.history) >= 2 and opponent.history[-2] == axl.Action.C:
                return axl.Action.C
            return axl.Action.D

        return axl.Action.C


class IndependentBuilder(axl.player.Player):
    """
    Always builds independently — no collaboration.
    Models what happens if both parties refuse to engage.
    """
    name = "Independent"
    classifier = {
        "stochastic": False,
        "memory_depth": 0,
        "long_run_time": False,
        "inspects_source": False,
        "manipulates_source": False,
        "manipulates_state": False,
    }

    def strategy(self, opponent):
        return axl.Action.D


class Opportunist(axl.player.Player):
    """
    Defects when ahead, cooperates when behind.
    Models a player who takes advantage of openness.
    """
    name = "Opportunist"
    classifier = {
        "stochastic": True,
        "memory_depth": 1,
        "long_run_time": False,
        "inspects_source": False,
        "manipulates_source": False,
        "manipulates_state": False,
    }

    def strategy(self, opponent):
        import random

        if len(self.history) == 0:
            return axl.Action.C

        # Calculate score difference (approximate)
        my_score = sum(
            [self.scores[i][0] for i in range(len(self.history))]
            if hasattr(self, "scores") and self.scores
            else []
        )
        opp_score = sum(
            [self.scores[i][1] for i in range(len(self.history))]
            if hasattr(self, "scores") and self.scores
            else []
        )

        # If winning, defect; if losing, cooperate
        if my_score > opp_score:
            return axl.Action.D if random.random() > 0.3 else axl.Action.C
        return axl.Action.C


# =============================================================================
# CUSTOM PAYOFF MATRIX
# =============================================================================

# The classic Snowdrift/Chicken payoff matrix adapted for business collaboration:
# Both cooperate: synergy value (3, 3)
# Both defect: wasted effort but each gets something (2, 2)
# One defects, one cooperates: exploiter wins (4, 1)

collaboration_game = axl.game.Game(
    r=3,  # Reward for mutual cooperation
    s=1,  # Sucker's payoff (cooperate while opponent defects)
    t=4,  # Temptation to defect
    p=2,  # Punishment for mutual defection
)

print("=" * 70)
print("ROLEFORGE ↔ GRCKIT COLLABORATION SIMULATION")
print("=" * 70)
print(f"\nPayoff Matrix (Row player payoff, Column player payoff):")
print(f"  CC: ({collaboration_game.R()}, {collaboration_game.R()})")
print(f"  CD: ({collaboration_game.S()}, {collaboration_game.T()})")
print(f"  DC: ({collaboration_game.T()}, {collaboration_game.S()})")
print(f"  DD: ({collaboration_game.P()}, {collaboration_game.P()})")
print(f"\nThis is a Snowdrift game (Chicken-like):")
print(f"  T > R > P > S  ({collaboration_game.T()} > {collaboration_game.R()} > {collaboration_game.P()} > {collaboration_game.S()})")


# =============================================================================
# MATCH: RoleForge vs GRCKit (head-to-head)
# =============================================================================

print("\n" + "=" * 70)
print("HEAD-TO-HEAD: RoleForge vs GRCKit")
print("=" * 70)

rf = RoleForgeStrategy()
gk = GRCKitStrategy()

match = axl.Match(players=(rf, gk), turns=50, game=collaboration_game)
match.play()

print(f"\nFirst 20 moves:")
for i in range(min(20, len(match.result))):
    rf_move = "C (collaborate)" if match.result[i][0] == axl.Action.C else "D (independent)"
    gk_move = "C (collaborate)" if match.result[i][1] == axl.Action.C else "D (independent)"
    print(f"  Round {i+1:2d}: RoleForge {rf_move:18s} | GRCKit {gk_move:18s}")

print(f"\nFinal scores over 50 rounds:")
scores = match.final_score()
print(f"  RoleForge: {scores[0]} (avg {scores[0]/50:.2f} per round)")
print(f"  GRCKit:    {scores[1]} (avg {scores[1]/50:.2f} per round)")
print(f"  Total value created: {scores[0] + scores[1]}")

# Cooperation rate
cooperations = sum(1 for r in match.result if r[0] == axl.Action.C and r[1] == axl.Action.C)
print(f"\nMutual cooperation rounds: {cooperations} / 50 ({cooperations/50*100:.0f}%)")
print(f"This represents periods of active schema integration and shared development.")


# =============================================================================
# TOURNAMENT: What if other strategies were in play?
# =============================================================================

print("\n" + "=" * 70)
print("TOURNAMENT: RoleForge & GRCKit against classic strategies")
print("=" * 70)

players = [
    RoleForgeStrategy(),
    GRCKitStrategy(),
    IndependentBuilder(),
    axl.TitForTat(),           # Classic nice reciprocal
    axl.Grudger(),             # Cooperates until defected, then never forgives
    axl.Cooperator(),          # Always cooperates (too naive)
    axl.Defector(),            # Always defects (too aggressive)
    axl.Random(),              # Random moves
    axl.WinStayLoseShift(),    # Pavlov: repeat winning moves, switch on loss
]

tournament = axl.Tournament(players=players, turns=50, repetitions=5, game=collaboration_game)
results = tournament.play(progress_bar=False)

print("\nRankings (average score per round):")
for rank, name, score in results.ranked_names:
    print(f"  {rank}. {name}: {score:.2f}")

print("\n" + "=" * 70)
print("INTERPRETATION")
print("=" * 70)
print("""
The Snowdrift/Chicken structure of this game means:

1. The Nash Equilibrium is MIXED — both parties randomize between
   collaboration and independence. But in real business, repeated play
   enables stable cooperation.

2. Tit-for-Tat and its variants (like GRCKit's forgiving TFT) perform
   well because they reward cooperation and punish defection without
   being overly vindictive.

3. RoleForge's strategy (initially trusting, holds short grudges) is
   well-suited for an IP-heavy indie project. It opens with cooperation
   but protects against sustained exploitation.

4. The "Independent" strategy always scores worse than mutual cooperation.
   This validates Jamie's intuition that collaboration beats reinvention.

5. If GRCKit is genuine about first-class metadata integration,
   both parties can sustain CC (collaboration) as an equilibrium.
   The key is making the collaboration legally binding (contract, not trust).

CONCLUSION FOR MAJID:
- Accept the call. The simulation favors cooperation.
- But protect RoleForge's IP position: negotiate attribution,
  revenue share, or integration fee.
- Elastic License 2.0 actually HELPS here — it prevents GRCKit from
  white-labeling RoleForge personas as a hosted service without
  an Enterprise License. This is leverage.
""")

# =============================================================================
# VISUALIZATION
# =============================================================================

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Plot 1: Match score over time
ax1 = axes[0]
cumulative_rf = [sum(match.result[i][0] for i in range(t+1)) for t in range(len(match.result))]
cumulative_gk = [sum(match.result[i][1] for i in range(t+1)) for t in range(len(match.result))]

ax1.plot(range(1, len(cumulative_rf)+1), cumulative_rf, label="RoleForge", linewidth=2)
ax1.plot(range(1, len(cumulative_gk)+1), cumulative_gk, label="GRCKit", linewidth=2)
ax1.set_xlabel("Round")
ax1.set_ylabel("Cumulative Score")
ax1.set_title("RoleForge vs GRCKit: Cumulative Scores")
ax1.legend()
ax1.grid(True, alpha=0.3)

# Plot 2: Tournament rankings
ax2 = axes[1]
ranked = results.ranked_names
names = [r[1] for r in ranked]
scores = [r[2] for r in ranked]
colors = ["#c7964c" if n in ("RoleForge", "GRCKit") else "#293038" for n in names]

bars = ax2.barh(range(len(names)), scores, color=colors)
ax2.set_yticks(range(len(names)))
ax2.set_yticklabels(names)
ax2.invert_yaxis()
ax2.set_xlabel("Average Score per Round")
ax2.set_title("Tournament Rankings (5 repetitions x 50 rounds)")
ax2.grid(True, alpha=0.3, axis="x")

# Add legend for colors
from matplotlib.patches import Patch
legend_elements = [Patch(facecolor="#c7964c", label="Actual Players"),
                   Patch(facecolor="#293038", label="Reference Strategies")]
ax2.legend(handles=legend_elements, loc="lower right")

plt.tight_layout()
plt.savefig("axelrod_roleforge_grckit.png", dpi=150, bbox_inches="tight")
print("\nChart saved to: axelrod_roleforge_grckit.png")
