import { App } from '~/App'
import { init } from './utils/starter'

App
  .mount({
    debug: true,
    canvas: document.querySelector('canvas')!
  })
  .then(() => {
    init()
  })
