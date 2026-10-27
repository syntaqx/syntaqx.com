+++
title = "Weighing Competing Objectives"
description = "Folding many goals into one solver score: levels or weighted sums, hard and soft constraints, money as the unit, integer scaling, replay and explanations."
category = "Architecture"
order = 422
tags = ["architecture", "optimization", "solvers", "scheduling", "routing"]
+++

A solver minimizes one number. Routing, scheduling, staffing, assignment, bin packing and pricing all reduce to the same move: everything the business cares about (cost, lateness, unserved work, overtime, fairness, a customer's preferred person) gets folded into a single score before the solve starts, and the solver finds the plan with the best score it can. The engine decides how well the score is optimized. The weights decide what "best" means, so two teams running the same engine on the same data can want very different plans, and the difference lives in a configuration file.

That's also where policy hides. A weight that makes the solver drop the least profitable customers, or always give the long shift to the newest employee, is a business decision nobody approved, made in a number nobody reads. My rule: **every term in the objective has a unit, a price someone owns, a version, and a test against history before it changes.**

## Two Ways to Fold

There are two ways to combine objectives, and most real systems use both.

A **weighted sum** puts every term on one scale: cost equals so much per hour of travel, plus so much per minute late, plus a penalty per unserved task. Any term can be traded for enough of any other, which is the point: ten more minutes of driving is worth it to avoid a 30-minute late arrival if the prices say so. Gurobi calls this a **blended** objective, each term with a weight that defaults to 1.0.

A **lexicographic** (hierarchical) objective ranks terms instead: optimize the top level, then use the next level only to break ties among solutions that are equally good at the top. Gurobi optimizes by priority, and each later pass keeps higher-priority results from degrading, unless you allow a **degradation tolerance** (`ObjNRelTol`, `ObjNAbsTol`) that lets a lower objective cost a bounded amount of a higher one. Timefold compares score levels "lexicographically": the first level decides, and "if those differ, the remaining score levels are ignored."

| | Weighted sum | Lexicographic |
| --- | ------------ | ------------- |
| Trades between terms | Always, at the stated prices | Never across levels (unless a tolerance allows it) |
| What you must decide | A price for every term | An order of the terms |
| Typical failure | A wrong price silently changes behavior | A trivial gain at a high level costs anything at a lower one |
| Good for | Costs that are genuinely exchangeable | Rules that must dominate everything below them |

The failure modes are mirror images. With unserved work on a level above travel, a solver will add two hours of driving to place one low-value task, because no amount of a lower level outweighs a higher one. With everything in one sum, a skip penalty set too low lets the solver sell a customer for a few dollars of fuel, and nothing in the output says the weights did it. The usual design is **levels for what must dominate, a weighted sum within the bottom level**: hard rules at the top, unserved work in the middle, priced costs at the bottom.

## Hard and Soft Constraints

A **hard constraint** defines feasibility: a plan that breaks one is invalid, whatever it saves. Legal limits (working hours, required licenses), physical ones (capacity, a closed road) and contractual ones (a guaranteed window) are hard. A **soft constraint** is a preference with a price: shorter travel, fewer late arrivals, an even workload.

- **Keep hard things hard.** Don't fake a hard rule with a huge weight in the sum. Timefold warns against using large weights to simulate levels, and Gurobi cautions that weights above 10^6 produce very large coefficients and numerical difficulties. A big-weight "hard" rule eventually gets traded away when enough soft cost piles up on the other side.
- **Don't over-harden.** Every hard constraint shrinks the feasible space, and a problem with no feasible plan returns nothing useful. Preferences ("try to keep this technician in the north zone") belong in the soft level.
- **Plan for over-constrained days.** When there's more work than capacity, the solver needs a legal way to leave work out. By default Timefold assigns every planning variable, so an over-constrained problem yields an infeasible best solution; allowing tasks to be unassigned, with a penalty, turns that into a plan that does the most valuable work. Google's Route Optimization API makes the safe choice the default: with no `penalty_cost`, a shipment's skip penalty "is considered infinite, i.e. the shipment must be completed."

## One Unit, Preferably Money

Convert every term to one unit before it reaches the solver. Money is the one people can check: cents per minute of labor, per kilometer, per minute late, per unserved task, per unit of imbalance. Google's Route Optimization API states the rule directly: a penalty "may be expressed in the same unit used for all other cost-related fields in the model." Terms that aren't money by nature (a preferred person, an even day, a customer's goodwill) still get a price, which forces the useful question of what each is worth.

Magnitudes then interact in ways you can calculate. The skip penalty is the price at which the solver may sell a task. If serving an outlying task takes a 50-minute detour of 60 kilometers, and a minute of labor costs 75 cents and a kilometer 47 cents (illustrative rates), the detour costs 50 × 0.75 + 60 × 0.47 = $65.70. A skip penalty of $50 tells the solver to drop that task every time. That's either the right business decision or a hidden one, and only the arithmetic tells you which.

Watch defaults too. VROOM's vehicle cost defaults to `per_hour` 3600 and `per_km` 0, which makes cost equal travel seconds unless you set prices; a team that adds a per-kilometer cost without rescaling the rest has changed every trade in the plan.

## Integer Scaling

Many engines work in integers. OR-Tools' routing solver "does all computations with integers," so callbacks must return integer costs and you must "round either the matrix entries, or the return values of the callback, to integers." Timefold says to "avoid the use of `float` or `double` in score calculation," which causes "score corruption," and to use "`BigDecimal` or scaled `long` instead." So:

- **Price per leg, not per unit.** 47 cents per kilometer is 0.047 cents per meter, which rounds to zero; a 6,400-meter leg priced in one step is 301 cents. Compute the term in floating point if you must, then round once.
- **Scale to the smallest unit that matters,** cents or tenths of a cent, and check that the largest possible total fits comfortably in the integer type. A sum over thousands of tasks of penalties in the millions overflows faster than it looks.
- **Mind the other end.** Gurobi warns that a weight below 10^-6 can push a term's contribution below the solver's tolerances, where it is effectively ignored. A term priced so small it never moves the solution isn't a term.

## Calibrating Weights

Weights are set by experiment, not by meeting:

- **Replay history.** Take snapshots of real inputs (the demand, the resources, the constraints as they stood) and re-solve each under the candidate weights, with the same time limit. Include ordinary days, peak days and short-staffed days.
- **Compare a scorecard, not the objective value.** The objective is defined by the weights, so it can't be compared across weight sets. Compare the business metrics instead: cost, lateness, unserved work, overtime, utilization and fairness, overall and per resource.
- **Look at the frontier.** Plot candidates on two metrics that conflict (cost against on-time rate, cost against fairness). Candidates worse on both are out; choosing among the rest is a business decision, so put it in front of whoever owns it.
- **Change one weight at a time,** so a result can be traced to a cause.
- **Compare distributions, not single runs.** A time-limited search can stop at a different point on a busier machine, so solve each snapshot several times per candidate. A 2% improvement inside run-to-run noise isn't one.
- **Expose weights as configuration,** owned and versioned. Timefold recommends making weights configurable because they're often hard to set, and notes that "a non-accurate weight is less damaging than mediocre algorithms": get the structure right first, then tune.

## Replay and Shadow Testing

Most optimization changes can't be A/B tested. Splitting a day's work between two weight sets makes the halves compete for the same people, vehicles or inventory, the interference problem in [Experimentation](/docs/telemetry/experimentation#interference-and-network-effects). Two methods avoid it:

- **Replay** (above) answers "what would this have done on days we've seen?" It can't capture how people react to different plans.
- **Shadow runs** answer "what would this do today?" Run the candidate beside the live configuration on live inputs, publish only the live plan, and compare both against what actually happened. After a few weeks, switch on an effective date.

Keep the snapshots: a test bench of historical inputs is what makes every later change cheap to evaluate.

## Explaining a Decision

"Why did the plan do that?" will be asked by a dispatcher, a customer or a regulator, and "the algorithm decided" isn't an answer.

- **Record cost by term for every run,** and for every resource or task where the engine can report it. "Travel 61%, lateness 22%, unserved 9%, overtime 8%" answers most questions without a re-solve. If one term is nearly all of the cost and the others barely move when their weights change, the weights aren't doing what they say.
- **Use the engine's breakdown.** Timefold's score analysis shows the score each constraint contributes and "which planning entities and problem facts are responsible for breaking which constraints," and can diff two solutions constraint by constraint. Other engines expose the same through per-dimension costs; where they don't, recompute the terms from the solution.
- **Answer counterfactuals by constraint.** "Why wasn't task X assigned to Y?" is best answered by re-solving with X pinned to Y and reporting how the score changed by term.
- **Record which configuration decided.** Each run stores the objective profile name and version, the input snapshot and the time limit, the same discipline as [Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided), with the record shape in [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions).

## Guarding Against Degenerate Solutions

An optimizer is a very literal employee: it does exactly what the score rewards, including things nobody meant.

- **Dropping work to save cost.** If unserved work is cheaper than serving it, the solver serves less. Check the unserved count and value on every run and alert when it jumps.
- **One term swamping the rest.** A lateness price in dollars beside travel in cents, or a balance term with a large coefficient, makes the others irrelevant. The cost-by-term report shows it.
- **Fair on average, unfair in the tails.** Equal mean workload can hide one person who always gets the longest day. Measure the worst resource over several weeks, not the average.
- **Weights that encode hidden policy.** A low penalty for a class of customer, or a preference that keeps a person out of an area, is a decision. Name it, and have someone accountable approve it.
- **Tuning to last week.** Weights fitted to one unusual week overfit. Replay a season.
- **Plans people keep overriding.** If dispatchers or planners repeatedly move the same kind of task, the weights disagree with them; override rates by reason are the best calibration signal you have.
- **Post-solve checks.** Validate every published plan against invariants in code (no hard constraint broken, no resource over capacity, unserved work under a bound) before it reaches anyone, and fall back to the previous plan if it fails.

## Checklist

- **Hard constraints for what must hold,** levels for what must dominate, a weighted sum for exchangeable costs.
- **Every term in one unit, preferably money,** with prices owned by someone and reviewed against the arithmetic of real trade-offs.
- **An explicit penalty for unserved work** that reflects its value, never a default nobody chose.
- **Integer-safe scaling:** price per leg, scale to the smallest unit that matters, check overflow and terms too small to matter.
- **A test bench:** historical snapshots, several runs per candidate, a scorecard and a frontier, then a shadow period before switching.
- **Weights as versioned configuration,** with the version, input snapshot and cost by term recorded on every run.
- **Post-solve invariant checks** and alerts on unserved work, term dominance and fairness tails.

## References

**Reference**

- [Gurobi: Multiple Objectives](https://docs.gurobi.com/projects/optimizer/en/current/features/multiobjective.html), blended and hierarchical objectives, priorities, degradation tolerances and the warning about very large or very small weights
- [Timefold Solver: Constraints and score overview](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/overview), hard and soft levels compared lexicographically, constraint weights as configuration, over-constrained planning and avoiding floating point
- [Timefold Solver: Understanding the score](https://docs.timefold.ai/timefold-solver/latest/constraints-and-score/understanding-the-score), score analysis per constraint and entity, and diffing two solutions
- [Google OR-Tools: Traveling Salesperson Problem](https://developers.google.com/optimization/routing/tsp), integer-only computation and rounding costs
- [Google Maps Platform: ShipmentModel](https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/ShipmentModel), a shipment with no penalty treated as mandatory, and one cost unit across the model
- [VROOM: API documentation](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md), vehicle costs (fixed, per hour, per kilometer) and their defaults, and task priority

**In practice**

- [Weighing the Routing Objective](/books/field-operations/route-objectives), the same method applied to field service routing
