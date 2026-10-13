import { describe, expect, it } from 'vitest'
import { GamepadSampler, type PadSnapshot } from './gamepad'

function pad(pressed: number[] = [], axes = [0, 0, 0, 0]): PadSnapshot {
  return {
    buttons: Array.from({ length: 17 }, (_, index) => ({
      pressed: pressed.includes(index),
      value: pressed.includes(index) ? 1 : 0,
    })),
    axes,
  }
}

describe('controller input isolation', () => {
  it('consumes held input on connection and requires a fresh press', () => {
    const sampler = new GamepadSampler()
    expect(sampler.sample(pad([0]), 0)).toEqual([])
    expect(sampler.sample(pad([0]), 1000)).toEqual([])
    expect(sampler.sample(pad(), 1100)).toEqual([])
    expect(sampler.sample(pad([0]), 1200)).toEqual(['confirm'])
    expect(sampler.sample(pad([0]), 2200)).toEqual([])
  })
  it('does not repeat confirmation across a scene transition', () => {
    const sampler = new GamepadSampler()
    sampler.sample(pad(), 0)
    expect(sampler.sample(pad([0]), 20)).toEqual(['confirm'])
    for (const time of [40, 500, 2000, 10000]) expect(sampler.sample(pad([0]), time)).toEqual([])
  })
  it('repeats navigation after its delay, without repeating face buttons', () => {
    const sampler = new GamepadSampler()
    sampler.sample(pad(), 0)
    expect(sampler.sample(pad([13, 2]), 20)).toEqual(['perception', 'down'])
    expect(sampler.sample(pad([13, 2]), 439)).toEqual([])
    expect(sampler.sample(pad([13, 2]), 440)).toEqual(['down'])
    expect(sampler.sample(pad([13, 2]), 599)).toEqual([])
    expect(sampler.sample(pad([13, 2]), 600)).toEqual(['down'])
  })
  it('ignores drift and uses hysteresis around the stick threshold', () => {
    const sampler = new GamepadSampler()
    sampler.sample(pad(), 0)
    expect(sampler.sample(pad([], [0.2, -0.15]), 20)).toEqual([])
    expect(sampler.sample(pad([], [0.7, 0]), 40)).toEqual(['right'])
    expect(sampler.sample(pad([], [0.45, 0]), 60)).toEqual([])
    expect(sampler.sample(pad([], [0.2, 0]), 80)).toEqual([])
    expect(sampler.sample(pad([], [0.7, 0]), 100)).toEqual(['right'])
  })
  it('baselines held input again after focus loss or disconnect', () => {
    const sampler = new GamepadSampler()
    sampler.sample(pad(), 0)
    sampler.sample(pad([0]), 20)
    sampler.reset()
    expect(sampler.sample(pad([0, 9]), 5000)).toEqual([])
    sampler.sample(pad(), 5020)
    expect(sampler.sample(pad([9]), 5040)).toEqual(['settings'])
  })
  it('maps standard buttons and prioritizes confirmation over same-frame movement', () => {
    const sampler = new GamepadSampler()
    sampler.sample(pad(), 0)
    expect(sampler.sample(pad([1, 3, 4, 5, 9]), 10)).toEqual([
      'back',
      'notes',
      'replay',
      'mute',
      'settings',
    ])
    sampler.sample(pad(), 20)
    expect(sampler.sample(pad([0, 15]), 30)).toEqual(['confirm'])
  })
})
