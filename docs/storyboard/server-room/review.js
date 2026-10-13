const sequence = document.getElementById('sequence')
const detail = document.getElementById('detail')
const title = document.getElementById('detail-title')
const detailImage = document.getElementById('detail-image')
const event = document.getElementById('detail-event')
const caption = document.getElementById('detail-caption')
const previous = document.getElementById('previous')
const next = document.getElementById('next')
let current = 0
function show(index) {
  current = Math.max(0, Math.min(shots.length - 1, index))
  const shot = shots[current]
  title.textContent = `${shot.id} — ${shot.title}`
  detailImage.src = shot.image
  detailImage.alt = shot.alt
  event.textContent = shot.event
  caption.textContent = shot.caption
  caption.hidden = !shot.caption
  document.getElementById('position').textContent =
    `${current + 1} / 8 · ${shot.phase} · ${shot.seconds}s draft`
  previous.disabled = current === 0
  next.disabled = current === shots.length - 1
  if (!detail.open) detail.showModal()
}
shots.forEach((shot, index) => {
  const figure = document.createElement('figure')
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'frame'
  button.setAttribute('aria-label', `View ${shot.id}: ${shot.title}`)
  const image = document.createElement('img')
  image.src = shot.image
  image.alt = shot.alt
  image.width = 1672
  image.height = 941
  image.decoding = 'async'
  button.append(image)
  button.addEventListener('click', () => show(index))
  const figcaption = document.createElement('figcaption')
  const phase = document.createElement('div')
  phase.className = 'phase'
  const phaseName = document.createElement('span')
  phaseName.textContent = `${shot.id} · ${shot.phase}`
  const timing = document.createElement('span')
  timing.textContent = `${shot.start}–${shot.start + shot.seconds}s`
  phase.append(phaseName, timing)
  const heading = document.createElement('h2')
  heading.textContent = shot.title
  const description = document.createElement('p')
  description.className = 'event'
  description.textContent = shot.event
  figcaption.append(phase, heading, description)
  figure.append(button, figcaption)
  sequence.append(figure)
})
document.getElementById('close').addEventListener('click', () => detail.close())
previous.addEventListener('click', () => show(current - 1))
next.addEventListener('click', () => show(current + 1))
detail.addEventListener('keydown', (key) => {
  if (key.key === 'ArrowLeft') {
    key.preventDefault()
    show(current - 1)
  }
  if (key.key === 'ArrowRight') {
    key.preventDefault()
    show(current + 1)
  }
})

const playPreview = document.getElementById('play-preview')
const previewLoad = document.getElementById('preview-load')
const animatic = document.getElementById('animatic')
const stage = document.getElementById('preview-stage')
const layers = [document.getElementById('preview-a'), document.getElementById('preview-b')]
const previewTitle = document.getElementById('preview-title')
const previewSpeaker = document.getElementById('preview-speaker')
const previewLine = document.getElementById('preview-line')
const previewCaption = document.getElementById('preview-caption')
const previewToggle = document.getElementById('preview-toggle')
const previewReplay = document.getElementById('preview-replay')
const previewSeek = document.getElementById('preview-seek')
const previewTime = document.getElementById('preview-time')
const previewState = document.getElementById('preview-state')
const reduceMotion = document.getElementById('reduce-motion')
const totalSeconds = shots.at(-1).start + shots.at(-1).seconds
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
let elapsed = 0
let playing = false
let frameRequest = 0
let lastFrame = null
let previewShot = -1
let activeLayer = 0
let shownSecond = -1

previewSeek.max = totalSeconds
reduceMotion.checked = motionPreference.matches
function applyMotionPreference() {
  stage.classList.toggle('is-still', reduceMotion.checked)
}
applyMotionPreference()
reduceMotion.addEventListener('change', applyMotionPreference)
motionPreference.addEventListener('change', (change) => {
  reduceMotion.checked = change.matches
  applyMotionPreference()
})

function displayShot(index) {
  const shot = shots[index]
  const previousLayer = layers[activeLayer]
  activeLayer = 1 - activeLayer
  const nextLayer = layers[activeLayer]
  previousLayer.classList.remove('is-visible')
  previousLayer.alt = ''
  previousLayer.setAttribute('aria-hidden', 'true')
  nextLayer.classList.remove('is-visible')
  nextLayer.src = shot.image
  nextLayer.alt = shot.alt
  nextLayer.removeAttribute('aria-hidden')
  nextLayer.style.setProperty('--shot-duration', `${shot.seconds}s`)
  // Restart the gentle camera move for this image, including when replaying.
  void nextLayer.offsetWidth
  nextLayer.classList.add('is-visible')
  previewTitle.textContent = `${shot.id} — ${shot.title}`
  previewSpeaker.textContent = shot.line?.speaker ?? ''
  previewLine.textContent = shot.line?.text ?? ''
  previewCaption.hidden = !shot.line
  previewShot = index
}

function updatePosition() {
  let index = shots.findIndex((shot) => elapsed < shot.start + shot.seconds)
  if (index < 0) index = shots.length - 1
  if (index !== previewShot) displayShot(index)
  previewSeek.value = elapsed.toFixed(2)
  const second = Math.floor(elapsed)
  if (second !== shownSecond) {
    previewTime.textContent = `0:${String(second).padStart(2, '0')} / 0:${totalSeconds}`
    shownSecond = second
  }
}

function updatePlaybackState(message) {
  stage.classList.toggle('is-playing', playing)
  previewToggle.textContent = playing ? 'Pause' : elapsed >= totalSeconds ? 'Play again' : 'Resume'
  previewToggle.setAttribute(
    'aria-label',
    playing ? 'Pause preview' : elapsed >= totalSeconds ? 'Play preview again' : 'Resume preview',
  )
  previewState.textContent =
    message ?? (playing ? 'Playing' : elapsed >= totalSeconds ? 'Preview complete' : 'Paused')
}

function pausePreview(message) {
  playing = false
  cancelAnimationFrame(frameRequest)
  frameRequest = 0
  lastFrame = null
  updatePlaybackState(message)
}

function tick(timestamp) {
  if (!playing || !animatic.open) return
  if (lastFrame !== null) elapsed = Math.min(totalSeconds, elapsed + (timestamp - lastFrame) / 1000)
  lastFrame = timestamp
  updatePosition()
  if (elapsed >= totalSeconds) {
    pausePreview('Preview complete')
    return
  }
  frameRequest = requestAnimationFrame(tick)
}

function resumePreview() {
  if (!animatic.open) return
  if (document.hidden) {
    pausePreview('Paused while the page is hidden')
    return
  }
  if (elapsed >= totalSeconds) restartPreview()
  else {
    playing = true
    lastFrame = null
    updatePlaybackState()
    frameRequest = requestAnimationFrame(tick)
  }
}

function restartPreview() {
  pausePreview()
  elapsed = 0
  previewShot = -1
  shownSecond = -1
  layers.forEach((layer) => layer.classList.remove('is-visible'))
  updatePosition()
  resumePreview()
}

function startPreview() {
  if (playPreview.disabled) return
  if (detail.open) detail.close()
  if (!animatic.open) animatic.showModal()
  restartPreview()
}

playPreview.addEventListener('click', startPreview)
previewToggle.addEventListener('click', () => (playing ? pausePreview() : resumePreview()))
previewReplay.addEventListener('click', restartPreview)
document.getElementById('preview-close').addEventListener('click', () => animatic.close())
animatic.addEventListener('close', () => pausePreview())
animatic.addEventListener('cancel', () => pausePreview())
previewSeek.addEventListener('input', () => {
  elapsed = Math.max(0, Math.min(totalSeconds, Number(previewSeek.value)))
  lastFrame = null
  updatePosition()
  if (elapsed >= totalSeconds) pausePreview('Preview complete')
})
animatic.addEventListener('keydown', (key) => {
  if (
    key.code === 'Space' &&
    key.target !== previewSeek &&
    key.target.tagName !== 'BUTTON' &&
    key.target.tagName !== 'INPUT'
  ) {
    key.preventDefault()
    if (playing) pausePreview()
    else resumePreview()
  }
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) pausePreview('Paused while the page is hidden')
})
window.addEventListener('blur', () => {
  if (playing) pausePreview('Paused while the window is unfocused')
})

const artLoads = Array.from(sequence.querySelectorAll('img')).map(
  (image) =>
    new Promise((resolve, reject) => {
      if (image.complete) {
        if (image.naturalWidth > 0) resolve()
        else reject(new Error(image.alt))
      } else {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', () => reject(new Error(image.alt)), { once: true })
      }
    }),
)
Promise.all(artLoads)
  .then(() => {
    playPreview.disabled = false
    previewLoad.textContent = 'Silent timing preview · still images with draft captions'
  })
  .catch(() => {
    previewLoad.textContent = 'A frame could not load. Reload this page to try again.'
  })
