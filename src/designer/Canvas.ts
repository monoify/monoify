import Two from 'two.js'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import Cursor from './Cursor'
import { RectTool, Selector, LineTool } from './tools'
import { KeyboardDetail } from './types'
import { Group } from 'two.js/src/group'

class Canvas {
  readonly ctx: Two

  cellHeight: number = 42

  cellWidth: number = 20

  readonly cursor: Cursor

  readonly selector: Selector

  readonly box: RectTool

  readonly line: LineTool

  readonly addEventListener: Function

  readonly dispatchEvent: Function

  mode: Mode = Mode.Selector

  readonly el: HTMLElement

  constructor(parent: HTMLElement) {
    this.el = parent

    this.ctx = new Two({
      // type: Two.Types.webgl,
      fullscreen: true,
      autostart: true,
      fitted: true,
    }).appendTo(parent)

    const { domElement: el } = this.ctx.renderer
    this.addEventListener = el.addEventListener.bind(el)
    this.dispatchEvent = el.dispatchEvent.bind(el)

    this.cursor = new Cursor(this)
    this.selector = new Selector(this)
    this.box = new RectTool(this)
    this.line = new LineTool(this)



    window.addEventListener('keydown', (e: KeyboardEvent) => {
      console.log(e)
      let event = new CustomEvent<KeyboardDetail>('canvaskeydown', {
        detail: { code: e.code },
      })

      el.dispatchEvent(event)
    })
  }


  createRegion = (
    x: number,
    y: number,
    width: number,
    height: number
  ): Region => {
    let centerX = x + width / 2
    let centerY = y + height / 2
    let region = this.ctx.makeRectangle(
      centerX,
      centerY,
      width,
      height
    ) as Region
    region.topleft = { x, y }
    return region
  }

  // param bottom right position
  updateRegion = (region: Region, x: number, y: number) => {
    if (region) {
      const { position, topleft } = region
      const offsetX = x - topleft.x
      const offsetY = y - topleft.y
      position.x = topleft.x + offsetX / 2
      position.y = topleft.y + offsetY / 2
      region.width = offsetX
      region.height = offsetY
    }
  }
}

export enum Mode {
  Selector = 0,
  Line = 1,
  Box = 2,
  Text = 3,
}

export interface PointerEventHandler {
  onPointerMove(e: PointerEvent): void
  onPointerUp(e: PointerEvent): void
  onPointerDown(e: PointerEvent): void
}

export type Region = Rectangle & {
  topleft: { x: number; y: number }
}

export default Canvas
