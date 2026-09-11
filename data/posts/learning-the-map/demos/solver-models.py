"""CVXPY equivalents for the browser demos. Install: pip install cvxpy highspy numpy

The browser uses JavaScript Hungarian assignment and heuristic tour search.
These functions show the corresponding optimization models in Python.
Inputs are the learner's scores, never the simulator's hidden true values.
"""
import cvxpy as cp
import numpy as np


def ucb_scores(sums, counts, t, beta, prior, scale, minimize=False):
    """Tabular policy: optimism lowers costs or raises rewards."""
    means = np.divide(sums, counts, out=np.full_like(sums, prior, dtype=float),
                      where=counts > 0)
    bonus = beta * scale * np.sqrt(np.log(t + 1) / (counts + 1))
    return np.maximum(0.02 * prior, means - bonus) if minimize else means + bonus


def solve_assignment(scores):
    """Rows = clients; columns = experts (matching) or OPEN slots (scheduling).

    Scheduling creates columns only for available (expert, day, time) slots.
    In these demos there are exactly as many clients as columns.
    """
    scores = np.asarray(scores, dtype=float)
    n, m = scores.shape
    if n != m:
        raise ValueError("These demos use a square, complete assignment")
    x = cp.Variable((n, m), boolean=True)
    constraints = [cp.sum(x, axis=1) == 1,  # each client gets one assignment
                   cp.sum(x, axis=0) == 1]  # each expert/open slot used once
    problem = cp.Problem(cp.Maximize(cp.sum(cp.multiply(scores, x))), constraints)
    problem.solve(solver=cp.HIGHS)
    if problem.status != cp.OPTIMAL:
        raise RuntimeError(f"Assignment solve: {problem.status}")
    return np.argmax(x.value, axis=1)


def solve_tour(costs):
    """Exact directed TSP formulation; may be slow for all 52 stops.

    Symmetric input costs describe the same undirected tour problem.
    The browser uses nearest-neighbour + 2-opt + Or-opt for responsiveness.
    Degree constraints alone allow disconnected subtours; MTZ prevents them.
    """
    costs = np.asarray(costs, dtype=float)
    n = len(costs)
    x = cp.Variable((n, n), boolean=True)
    u = cp.Variable(n - 1)  # visit order for every stop except depot 0
    constraints = [cp.diag(x) == 0,
                   cp.sum(x, axis=1) == 1,  # leave every stop once
                   cp.sum(x, axis=0) == 1,  # enter every stop once
                   u >= 1, u <= n - 1]
    for i in range(1, n):
        for j in range(1, n):
            if i != j:
                constraints.append(u[i - 1] - u[j - 1] + n * x[i, j] <= n - 1)
    problem = cp.Problem(cp.Minimize(cp.sum(cp.multiply(costs, x))), constraints)
    problem.solve(solver=cp.HIGHS, highs_options={"time_limit": 30.0})
    if problem.status != cp.OPTIMAL:
        raise RuntimeError(f"No certified optimum within the limit: {problem.status}")
    return np.argmax(x.value, axis=1)  # successor of each stop


def update_selected(sums, counts, observations, undirected=False):
    """Each (i, j, value) is one selected component's noisy outcome.

    No samples for unchosen components. Contextual policies additionally
    update shared group estimates from these same observations.
    """
    for i, j, value in observations:
        sums[i, j] += value
        counts[i, j] += 1
        if undirected:
            sums[j, i] += value
            counts[j, i] += 1
