const landing: HTMLElement|null = document.querySelector('#landing')

export function init(): void {
  if (!landing) return

  const btn = landing.querySelector('.landing__button')
  btn!.addEventListener('click', startExperience)
}

function startExperience(): void {
  const rain: HTMLAudioElement|null = document.querySelector('#ambientRain')
  rain?.play()
  landing!.remove()
}
