import { App } from '~/App'

App
  .mount({
    debug: true,
    canvas: document.querySelector('canvas')!
  })
  .then(() => {
    const player: HTMLAudioElement|null = document.querySelector('#musicPlayer')
    player?.play()
    document.body.classList.add('loaded')
  })
