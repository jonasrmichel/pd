import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Pending } from '../types'

// Skills that open a long-form input when run without an idea, like `/plan`.
const PERSONAS: Record<string, string> = {
  'competitor-ceo': 'Competitor CEO',
  'simplifier-storyteller': 'Simplifier & Storyteller',
  'pragmatic-scientist': 'Pragmatic Scientist',
  'tech-navigator': 'Tech Navigator',
  'consumer-champion': 'Consumer Champion',
  'engineering-challenger': 'Engineering Challenger',
  'growth-partner': 'Growth Partner',
  'visionary-optimist': 'Visionary Optimist',
}
const LABELS: Record<string, string> = { ...PERSONAS, panel: 'Persona Panel' }

const pending = atom({ plugin: 'pd', key: 'pending' } as const, null)

const skillOf = (command: string): string | undefined => {
  const name = command.startsWith('pd:') ? command.slice(3) : command
  return name in LABELS ? name : undefined
}

// The panel's arguments when they hold only a selection (`all`, `a,b`) and no idea.
const panelSelection = (args: string): string | undefined => {
  const selection = args.trim().replace(/\s*,\s*/g, ',')
  if (selection === 'all') {
    return selection
  }
  if (selection === '' || /\s/.test(selection)) {
    return undefined
  }
  return selection.split(',').every(name => name in PERSONAS) ? selection : undefined
}

// What a run arms, or undefined when it carries an idea and should run as typed.
const toArm = (skill: string, args: string): Pending | undefined => {
  if (args.trim() === '') {
    return { skill, label: LABELS[skill] ?? skill, prefix: '' }
  }
  if (skill !== 'panel') {
    return undefined
  }
  const selection = panelSelection(args)
  if (!selection) {
    return undefined
  }
  const label =
    selection === 'all'
      ? 'Persona Panel (all)'
      : `Persona Panel (${selection.split(',').map(name => PERSONAS[name]).join(', ')})`
  return { skill, label, prefix: selection }
}

export const register: Register = on => {
  // `/pd:<skill>` with no idea arms the next message instead of running the skill.
  on('command.run', async ($, e, next) => {
    const skill = skillOf(e.command)
    const armed = skill ? toArm(skill, e.args) : undefined
    if (!armed) {
      return next(e)
    }

    const current = await read($, pending)
    if (current?.skill === armed.skill && current.prefix === armed.prefix) {
      await update($, pending, () => null)
      return { text: `🎭 ${current.label} dismissed.` }
    }

    await update($, pending, () => armed)
    const target = armed.skill === 'panel' ? 'the panel' : 'this persona'
    const again = `/pd:${armed.skill}${armed.prefix ? ` ${armed.prefix}` : ''}`
    return {
      text:
        `🎭 ${armed.label} is listening. Describe your idea, paste a doc, or reference files; ` +
        `your next message goes to ${target}. Run ${again} again to cancel.`,
    }
  })

  // The next message the person sends becomes the armed skill's input.
  on('prompt.submit', async ($, e, next) => {
    const isPerson = e.origin.kind === 'composer' || e.origin.kind === 'bridge'
    if (e.command || e.isMeta || !isPerson) {
      return next(e)
    }

    const armed = await read($, pending)
    if (!armed) {
      return next(e)
    }

    await update($, pending, () => null)
    const args = armed.prefix
      ? `"${armed.prefix}" followed by this whole message`
      : 'this whole message'
    const instruction =
      `The user ran /pd:${armed.skill}${armed.prefix ? ` ${armed.prefix}` : ''} without an idea, ` +
      `and this message is their input for it. Invoke the Skill tool with skill "pd:${armed.skill}" ` +
      `and ${args} as its args, then respond as that skill directs.`
    return next({ ...e, context: [...(e.context ?? []), instruction] })
  })

  // A band above the prompt while a skill waits, like plan mode's indicator.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const armed = await read($, pending)
    if (!armed || e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box>
        <Text>🎭 </Text>
        <Text bold>{armed.label}</Text>
        <Text dimColor> · your next message goes here </Text>
        <Button key="cancel" label="Cancel" onPress={() => update($, pending, () => null)} />
      </Box>
    )
  })
}
