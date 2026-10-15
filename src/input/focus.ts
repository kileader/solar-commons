export function visibleControls(scope: ParentNode): HTMLElement[] {
  return [...scope.querySelectorAll<HTMLElement>('button, input, select, a[href]')].filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  )
}

/** Ranges and voice selection remain operable with a controller, inside the modal's scope. */
export function adjustControl(element: HTMLElement, direction: number): boolean {
  if (element instanceof HTMLInputElement && element.type === 'range') {
    const next = Math.max(
      Number(element.min),
      Math.min(Number(element.max), Number(element.value) + direction * Number(element.step || 1)),
    )
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(element, String(next))
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }
  if (element instanceof HTMLSelectElement) {
    const options = [...element.options].filter((option) => !option.disabled)
    const current = options.findIndex((option) => option.value === element.value)
    element.value =
      options[(current + direction + options.length) % options.length]?.value ?? element.value
    element.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }
  return false
}

export function moveFocus(controls: readonly HTMLElement[], direction: number) {
  if (controls.length === 0) return
  const current = controls.indexOf(document.activeElement as HTMLElement)
  const next = current < 0 ? 0 : (current + direction + controls.length) % controls.length
  controls[next].focus({ preventScroll: true })
}
