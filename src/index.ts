import { App } from '~/App'
import { init } from './utils/starter'

App
  .mount({
    debug: false,
    canvas: document.querySelector('canvas')!
  })
  .then(() => {
    init()
  })
