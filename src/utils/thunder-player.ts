const MIN_DELAY = 2000 // 5 seconds
const MAX_DELAY = 5000 // 10 seconds

const thunderSounds = document.querySelectorAll('.thunder') as unknown as HTMLAudioElement[]

function getRandomSound(sounds: HTMLAudioElement[]) {
  const index = Math.floor(Math.random() * sounds.length)
  return sounds[index]
}

function getRandomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function playThunderLoop() {
    const sound = getRandomSound(thunderSounds)

    await new Promise((resolve) => {
      sound.play();
      sound.onended = resolve;
    });

    const delay = getRandomDelay(MIN_DELAY, MAX_DELAY)
    await new Promise(resolve => setTimeout(resolve, delay))

    playThunderLoop();
  }
