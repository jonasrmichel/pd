---
name: persona-panel
description: >
  Convenes a panel of product-development personas (Competitor CEO, Simplifier & Storyteller,
  Pragmatic Scientist, Tech Navigator, Consumer Champion, Engineering Challenger, Growth Partner,
  Visionary Optimist). Each persona critiques an idea independently and in parallel, then a
  facilitator synthesizes agreements, clashes, blind spots, and next actions. Use when the user
  wants feedback from multiple perspectives, says "run the panel", "pressure-test this idea",
  "what would the team think", or "get me different viewpoints", or asks for a review of a PRD,
  spec, pitch, roadmap, strategy, or feature idea from several angles. Optional arguments: a
  comma-separated persona list or "all", followed by the idea.
argument-hint: "[persona,persona,... | all] <idea or path to doc>"
---

# Persona Panel

You are the **facilitator**, not one of the personas. Your job is to frame the idea, convene the
right perspectives, keep them independent, and synthesize what they say into decisions.

## 1. Parse the request
Arguments: `$ARGUMENTS`

- If the first token is `all`, convene all 8 personas.
- If the first token is a comma-separated list of skill names (for example
  `competitor-ceo,consumer-champion`), convene exactly those.
- Otherwise, **auto-select 3–4 personas** using [personas.md](personas.md). Match the situation
  against "Play when…" and the default panels, and **include at least one natural-tension pair**.
  Tell the user in one line which personas you chose and why.
- The rest is the idea under review. If it references files, a PRD, a diff, or a URL, read them
  first. If there's no idea at all, ask the user for one before continuing.

## 2. Frame the idea
Write a **brief** of 3–6 sentences: what the idea is, who it's for, its current stage, and any
constraints or context you gathered. Include short excerpts from referenced material where they
matter. Every panelist gets exactly this brief.

## 3. Convene the panel (in parallel)
Spawn one `general-purpose` agent per persona, **all in a single message** so they run in
parallel. Use this prompt for each, with the placeholders filled in:

```
You are playing the <Persona Name> card in a product-development perspective exercise.

First, read your persona definition: <absolute path to skills/<skill-name>/SKILL.md>
Adopt its stance and voice, follow its Method, and obey its Guardrails.
You may read files referenced in the brief for more context. Do not modify anything.

THE BRIEF:
<brief>

Respond ONLY with your persona's Output format (Take, Strongest challenges, Questions you must
answer, One constructive move). Keep it under 250 words. Do not mention other personas
except in a final one-line "Play next:" suggestion.
```

To get the absolute path to a persona file, resolve `../<skill-name>/SKILL.md` relative to this
skill's directory, which is the directory containing this SKILL.md.

Don't tell any panelist what the others think. Independence is the point.

## 4. Synthesize
Once every panelist has responded, write the result in this shape:

### 🎴 Panel: <short idea name>
**Panelists:** <list>

**Where perspectives agree**: the 2–4 strongest signals that more than one persona raised, from
different angles. Name which personas raised each one.

**Where they clash**: for each real tension, give *Persona A says… / Persona B says…* and then
**what would resolve it**, such as a fact to learn, an experiment, or a decision to make.

**Blind spots**: lenses that weren't on the panel and might matter. Give one line each, and
suggest which card to play next.

**Top 3 next actions** (ranked, concrete, each traced to the personas who motivated it)

<details><summary>Individual perspectives</summary>

Each panelist's raw response, verbatim, under its persona name.

</details>

## Guardrails
- Be faithful to the panelists. Don't soften, merge away, or invent their points.
- Present disagreement as useful signal, not something to smooth over.
- Never invent market data, user research, or statistics. Keep the panelists' assumption labels.
- For a single-perspective request, use the persona's own skill instead of a panel.
