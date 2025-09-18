import { Scene } from "three"

const MIN_DURATION = 1000 // 1 second
const MAX_DURATION = 2500 // 2.5 seconds
const MIN_DELAY = 2000 // 2 seconds
const MAX_DELAY = 5000 // 5 seconds

const thunderSounds = document.querySelectorAll('.thunder') as unknown as HTMLAudioElement[]

function getRandomSound(sounds: HTMLAudioElement[]) {
  const index = Math.floor(Math.random() * sounds.length)
  return sounds[index]
}

function getRandomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function thunderIntensity(scene: Scene, from: number, to: number, duration: number) {
  return new Promise<void>((resolve) => {
    const start = performance.now()
    
    function step(time: number) {
      const elapsed = time - start
      const progress = Math.min(elapsed / duration, 1)
      
      scene.backgroundIntensity = from + (to - from) * progress
      
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        resolve()
      }
    }
    
    requestAnimationFrame(step)
  })
}

function oscillation(scene: Scene, min: number, max: number, signal: { stop: boolean }) {
  return new Promise<void>((resolve) => {
    const start = performance.now()
    const amplitude = (max - min) / 2
    const mid = (max + min) / 2
    const freqMin = 2
    const freqMax = 5
    const freqAmplitude = (freqMax - freqMin) / 2
    const freqMid = (freqMax + freqMin) / 2

    function step(time: number) {
      if (signal.stop) {
        resolve()
        return
      }

      const elapsed = (time - start) / 1000
      const modulatingFreq = freqMid + freqAmplitude * Math.sin(2 * Math.PI * 0.2 * elapsed)
      scene.backgroundIntensity = mid + amplitude * Math.sin(2 * Math.PI * modulatingFreq * elapsed)

      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  })
}

export async function playThunderLoop(scene: Scene) {
  const sound = getRandomSound(thunderSounds)
  
  sound.play()

  const signal = { stop: false }
  const oscillationPromise = oscillation(scene, 0.1, 0.4, signal)

  const randomDuration = getRandomDelay(MIN_DURATION, MAX_DURATION)
  await new Promise(resolve => setTimeout(resolve, randomDuration))

  signal.stop = true

  await oscillationPromise
  
  await thunderIntensity(scene, scene.backgroundIntensity, 0.1, 500)

  await new Promise((resolve) => {
    sound.onended = resolve
  })

  const delay = getRandomDelay(MIN_DELAY, MAX_DELAY)
  await new Promise(resolve => setTimeout(resolve, delay))

  playThunderLoop(scene)
}
