export type GamepadAction =
  | 'confirm'
  | 'back'
  | 'perception'
  | 'notes'
  | 'settings'
  | 'replay'
  | 'mute'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
export interface PadSnapshot {
  buttons: readonly { pressed: boolean; value: number }[]
  axes: readonly number[]
}
const actions: Partial<Record<number, GamepadAction>> = {
  0: 'confirm',
  1: 'back',
  2: 'perception',
  3: 'notes',
  4: 'replay',
  5: 'mute',
  9: 'settings',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
}
const navigation = new Set<GamepadAction>(['up', 'down', 'left', 'right'])

/** Standard mapping only; activation is edge-triggered, navigation alone may repeat. */
export class GamepadSampler {
  private held = new Set<GamepadAction>()
  private nextRepeat = 0
  private stick: GamepadAction | null = null
  private initialized = false

  reset() {
    this.held.clear()
    this.stick = null
    this.initialized = false
    this.nextRepeat = 0
  }

  sample(pad: PadSnapshot, now: number): GamepadAction[] {
    const current = new Set<GamepadAction>()
    for (const [index, action] of Object.entries(actions)) {
      const button = pad.buttons[Number(index)]
      if (button && (button.pressed || button.value > 0.55)) current.add(action!)
    }
    const x = Number.isFinite(pad.axes[0]) ? pad.axes[0] : 0
    const y = Number.isFinite(pad.axes[1]) ? pad.axes[1] : 0
    const magnitude = Math.max(Math.abs(x), Math.abs(y))
    if (magnitude > 0.55)
      this.stick = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up'
    else if (magnitude < 0.35) this.stick = null
    if (this.stick) current.add(this.stick)
    // Connecting or returning focus while a button is held must not act on a new scene.
    if (!this.initialized) {
      this.initialized = true
      this.held = current
      this.nextRepeat = now + 420
      return []
    }
    const fresh = [...current].filter((action) => !this.held.has(action))
    const movement = [...current].find((action) => navigation.has(action))
    if (fresh.some((action) => navigation.has(action))) this.nextRepeat = now + 420
    else if (movement && now >= this.nextRepeat) {
      fresh.push(movement)
      this.nextRepeat = now + 160
    }
    this.held = current
    // A direction + confirm on the same frame selects where you already were, rather than moving and choosing unexpectedly.
    return fresh.includes('confirm') ? ['confirm'] : fresh
  }
}
