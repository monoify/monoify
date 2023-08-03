import Two from 'two.js'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import Selector, { Region } from './Selector'
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

export default Canvas
