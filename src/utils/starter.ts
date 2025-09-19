const landing: HTMLElement|null = document.querySelector('#landing')

export function init(): void {
  if (!landing) return

  const revealBtn = landing.querySelector('.landing__button--reveal')!
  revealBtn.addEventListener('click', reveal)

  const startBtn = landing.querySelector('.landing__button--start')!
  startBtn.addEventListener('click', startExperience)
}

function reveal(): void {
  const voice: HTMLAudioElement|null = document.querySelector('#landingVoice')
  voice?.play()

  const revealBtn = landing!.querySelector('.landing__button--reveal')!
  revealBtn.remove()

  const content: HTMLParagraphElement = landing!.querySelector('.landing__content')!
  content.classList.add('revealed')
}

function startExperience(): void {
  const voice: HTMLAudioElement|null = document.querySelector('#landingVoice')
  voice?.pause()

  const rain: HTMLAudioElement|null = document.querySelector('#ambientRain')
  rain?.play()
  landing!.remove()
}
