import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas from './Canvas'

export default class Cursor {
  private canvas: Canvas

  private row: number = 0

  private col: number = 0

  private width: number

  private height: number

  private _cursor: Rectangle

  private bg: string

  constructor(canvas: Canvas, fill: string = '#aaa') {
    this.canvas = canvas
    this.width = canvas.cellWidth
    this.height = canvas.cellHeight

    // style cursor
    this._cursor = this.canvas.ctx.makeRectangle(
      this.width / 2,
      this.height / 2,
      this.width,
      this.height
    )
    this._cursor.noStroke()
    this._cursor.fill = fill
    this.bg = fill
    this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
  }

  updateCursor = (type: string, e: PointerEvent) => {
    let col = Math.floor(e.x / this.width)
    let row = Math.floor(e.y / this.height)
    this.row = row
    this.col = col

    this._cursor.position.x = this.width * col + this.width / 2
    this._cursor.position.y = this.height * row + this.height / 2
    this.canvas.dispatchEvent(
      new CustomEvent<CursorDetail>(type, {
        detail: { col, row, x: e.x, y: e.y },
      })
    )
  }

  public set show(display: boolean) {
    if (this._cursor) {
      this._cursor.fill = display ? this.bg : 'transparent'
    }
  }

  hide = () => {
    this._cursor.fill = this.bg
  }
}

export type CursorDetail = {
  row: number
  col: number
  x: number
  y: number
}
