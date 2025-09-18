import { App } from '~/App'

App
  .mount({
    debug: true,
    canvas: document.querySelector('canvas')!
  })
  .then(() => {
    document.body.classList.add('loaded')
    const rain: HTMLAudioElement|null = document.querySelector('#ambientRain')
    rain?.play()
  })
