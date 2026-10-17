// A skill armed by a bare `/pd:<skill>`, waiting for the person's next message.
// `prefix` holds a panel's persona selection (`all`, `a,b`) typed without an idea.
export type Pending = { skill: string; label: string; prefix: string }

declare module 'claude-code' {
  interface PluginState {
    pd: { pending: Pending | null }
  }
}
