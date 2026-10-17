# 🎭 pd

A Claude Code plugin that turns eight product development "perspective cards" into personas.
You can call on a persona yourself, or Claude can pick one when the situation fits. Each persona
gives feedback on your ideas, challenges them, and offers another point of view. A **panel**
skill runs several personas in parallel and pulls their views together.

## Personas

| Skill | Persona | Perspective they bring | Invoke this persona when… |
|---|---|---|---|
| `competitor-ceo` | Competitor CEO | *Why should I worry?* | You think you have a winning idea; need sharper differentiation; are preparing for tough questions |
| `simplifier-storyteller` | Simplifier & Storyteller | *What could you remove and still keep the magic?* | The idea has become too complicated; features keep piling up; you're preparing a pitch |
| `pragmatic-scientist` | Pragmatic Scientist | *Can this actually happen?* | The idea feels exciting but unrealistic; you're entering execution; you need to find the risks |
| `tech-navigator` | Tech Navigator | *What is really causing the problem?* | You're troubleshooting more than delivering; the team keeps working around a problem |
| `consumer-champion` | Consumer Champion | *Why would your audience care about your idea?* | Demand isn't validated; "Would anyone actually use this?" |
| `engineering-challenger` | Engineering Challenger | *How can we solve the hardest problem?* | The problem is technically hard; someone says "that can't be done"; you have trade-offs to weigh |
| `growth-partner` | Growth Partner | *Where is the value (marketing & commercial lens)?* | You're unsure who would pay; you need a stronger value proposition or a path to scale |
| `visionary-optimist` | Visionary Optimist | *What could this become?* | The idea feels incremental or safe; you're stuck inside current constraints |

Every persona answers in the same shape: **Take**, **Strongest challenges**, **Questions you
must answer**, and **One constructive move**. Each one also suggests an opposing persona to invoke
next (for example Visionary Optimist ↔ Pragmatic Scientist).

## Install

```
/plugin marketplace add jonasrmichel/pd
/plugin install pd@pd
```

Restart Claude Code. The skills show up as `/pd:<skill>`.

## Usage

**Call a persona yourself:**

```
/pd:competitor-ceo We're building an AI meeting summarizer for SMBs
/pd:simplifier-storyteller docs/prd.md
```

**Or run it bare and write at length**, like `/plan`: `/pd:competitor-ceo` on its own answers at
once without calling the model, shows a 🎭 band above the prompt, and sends your next message
(as long as you like: paste a doc, reference files) to that persona. Run the same command again,
or press **Cancel** on the band, to back out.

**Let Claude pick one:** describe the situation and Claude invokes the matching persona. It always
says so first, so you can decline:

> "Our spec keeps growing, help me cut it down"
> → `🎭 Invoking the Simplifier & Storyteller persona — …`

**Run a panel:**

```
/pd:panel <idea or path>                               # picks 3–4 personas, incl. at least one opposing pair
/pd:panel competitor-ceo,consumer-champion <idea>      # the personas you list
/pd:panel all <idea>                                   # all eight
/pd:panel                                              # bare: your next message is the idea
/pd:panel all                                          # a selection with no idea works the same way
```

Each panelist runs as its own subagent and never sees the others' answers. Claude then writes up
where they **agree**, where they **clash** (and what would settle it), **blind spots**, and the
**top 3 next actions**.

## Layout

```
.claude-plugin/
  plugin.json          # plugin manifest
  marketplace.json     # lets the repo itself be added as a marketplace
skills/
  <persona>/SKILL.md   # one file per persona; each is the only place that persona is defined
  panel/
    SKILL.md           # how the panel runs and how answers are combined
    personas.md        # list of personas, opposing pairs, default panels by artifact type
hooks/
  register.tsx         # bare /pd:<skill> → wait for the next message (with a band above the prompt)
  register.test.ts     # its tests: `claude plugin test .`
types/index.d.ts       # the hooks module's state contract
```

## Customizing

- **Change a persona:** edit `skills/<persona>/SKILL.md`. The panel reads these files directly,
  so your change applies everywhere.
- **Add a persona:** create `skills/<new-persona>/SKILL.md` with the same structure as the
  others, then add a row to `skills/panel/personas.md`.
- **Change when Claude picks a persona on its own:** edit the `description` in the skill's
  frontmatter.

Check your changes with `claude plugin validate .`.
