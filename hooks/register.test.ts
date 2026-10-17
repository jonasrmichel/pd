import { expect, test } from 'claude-code/testing'

const presentation = { isFullscreen: false, columns: 120 }
const composer = { kind: 'composer' } as const

const run = ($: any, command: string, args = '') =>
  $.command.run({ command, args, origin: composer, presentation })

const submit = ($: any, text: string) =>
  $.prompt.submit({ text, origin: composer, wait: false })

test('a bare persona command arms the next message without running the skill', async ($, on) => {
  let ran = 0
  on('command.run', () => {
    ran += 1
    return { text: 'skill ran' }
  })
  let seen: any
  on('prompt.submit', (_$, e) => {
    seen = e
    return { text: e.text, context: e.context }
  })

  const answer = await run($, 'pd:competitor-ceo')
  expect(ran).toBe(0)
  expect(answer.text).toContain('Competitor CEO is listening')

  await submit($, 'An AI meeting summarizer for SMBs')
  expect(seen.text).toBe('An AI meeting summarizer for SMBs')
  expect(seen.context.join('\n')).toContain('skill "pd:competitor-ceo"')

  // Armed once: the message after that goes through untouched.
  await submit($, 'thanks')
  expect(seen.context ?? []).toEqual([])
})

test('a persona command with an idea runs as typed', async ($, on) => {
  let ran = 0
  on('command.run', () => {
    ran += 1
    return { text: 'skill ran' }
  })

  const answer = await run($, 'pd:growth-partner', 'a B2B pricing idea')
  expect(ran).toBe(1)
  expect(answer.text).toBe('skill ran')
})

test('running the same bare command again cancels it', async ($, on) => {
  let seen: any
  on('command.run', () => ({ text: 'skill ran' }))
  on('prompt.submit', (_$, e) => {
    seen = e
    return { text: e.text, context: e.context }
  })

  await run($, 'pd:visionary-optimist')
  const answer = await run($, 'pd:visionary-optimist')
  expect(answer.text).toContain('dismissed')

  await submit($, 'hello')
  expect(seen.context ?? []).toEqual([])
})

test('a bare panel command arms the panel', async ($, on) => {
  let seen: any
  on('command.run', () => ({ text: 'skill ran' }))
  on('prompt.submit', (_$, e) => {
    seen = e
    return { text: e.text, context: e.context }
  })

  const answer = await run($, 'pd:panel')
  expect(answer.text).toContain('Persona Panel is listening')
  expect(answer.text).toContain('the panel')

  await submit($, 'Our Q3 roadmap')
  expect(seen.context.join('\n')).toContain('skill "pd:panel" and this whole message')
})

test('a panel selection with no idea arms the panel and keeps the selection', async ($, on) => {
  let ran = 0
  let seen: any
  on('command.run', () => {
    ran += 1
    return { text: 'skill ran' }
  })
  on('prompt.submit', (_$, e) => {
    seen = e
    return { text: e.text, context: e.context }
  })

  const answer = await run($, 'pd:panel', 'competitor-ceo, growth-partner')
  expect(ran).toBe(0)
  expect(answer.text).toContain('Persona Panel (Competitor CEO, Growth Partner)')

  await submit($, 'A pricing change')
  expect(seen.context.join('\n')).toContain('"competitor-ceo,growth-partner" followed by this whole message')

  await run($, 'pd:panel', 'all')
  await submit($, 'A pricing change')
  expect(seen.context.join('\n')).toContain('"all" followed by this whole message')
})

test('a panel run with an idea runs as typed', async ($, on) => {
  let ran = 0
  on('command.run', () => {
    ran += 1
    return { text: 'skill ran' }
  })

  await run($, 'pd:panel', 'all our new onboarding flow')
  await run($, 'pd:panel', 'competitor-ceo our new onboarding flow')
  expect(ran).toBe(2)
})

test('other commands pass through', async ($, on) => {
  let ran = 0
  on('command.run', () => {
    ran += 1
    return { text: 'ran' }
  })

  await run($, 'compact')
  expect(ran).toBe(1)
})
