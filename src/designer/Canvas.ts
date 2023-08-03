import Two from 'two.js'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import Selector from './Selector'
import Cursor from './Cursor'
import Box from './Box'

class Canvas {
  readonly ctx: Two

  cellHeight: number = 42

  cellWidth: number = 20

  readonly cursor: Cursor

  readonly selector: Selector

  readonly box: Box

  readonly addEventListener: Function

  readonly dispatchEvent: Function

  mode: Mode = Mode.Selector

  constructor(parent: HTMLElement) {
    this.initGrids(parent, 1, '#dedede') // draw grid background

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
    this.box = new Box(this)

    // pointer event handle delegation
    const { updateCursor } = this.cursor

    el.addEventListener('pointerup', (e: PointerEvent) =>
      updateCursor('cursorup', e)
    )
    el.addEventListener('pointermove', (e: PointerEvent) =>
      updateCursor('cursormove', e)
    )
    el.addEventListener('pointerdown', (e: PointerEvent) =>
      updateCursor('cursordown', e)
    )
  }

  private initGrids = (
    container: HTMLElement,
    lineWidth: number = 1,
    lineColor: string
  ) => {
    const style = container.style
    style.backgroundImage = `linear-gradient(to right, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px),
          linear-gradient(to bottom, ${lineColor} ${lineWidth}px, transparent ${lineWidth}px)`
    style.backgroundSize = `${this.cellWidth}px ${this.cellHeight}px`
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
  updateRegion = (region: Region, x: number, y: number, ) => {
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
