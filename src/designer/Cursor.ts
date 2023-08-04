import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas from './Canvas'
import Two from 'two.js'
import { ZUI } from 'two.js/extras/jsm/zui'
import { Vector } from 'two.js/src/vector'

export default class Cursor {
  private canvas: Canvas

  private row: number = 0

  private col: number = 0

  private width: number

  private height: number

  private _cursor: Rectangle

  private bg: string

  private zui: ZUI

  private mv: Vector = new Two.Vector()

  constructor(canvas: Canvas, fill: string = '#aaa') {
    this.canvas = canvas
    this.width = canvas.cellWidth
    this.height = canvas.cellHeight
    this.zui = new ZUI(this.canvas.ctx.scene, this.canvas.el)
    this.zui.addLimits(0.06, 8)

    this.initGrids()

    this.canvas.addEventListener('wheel', this.zoom)
    this.canvas.addEventListener('pointerup', (e: PointerEvent) =>
      this.updateCursor('cursorup', e)
    )
    this.canvas.addEventListener('pointermove', (e: PointerEvent) =>
      this.updateCursor('cursormove', e)
    )
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) =>
      this.updateCursor('cursordown', e)
    )

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

  initGrids = () => {
    for (let ri = 0; ri <= this.canvas.ctx.height; ri++) {
      let h = this.canvas.ctx.makeLine(0, ri, this.canvas.ctx.width, ri)
      h.stroke = '#dedede'
      h.linewidth = 1
      ri += this.canvas.cellHeight
    }

    for (let ci = 0; ci <= this.canvas.ctx.width; ci++) {
      let v = this.canvas.ctx.makeLine(ci, 0, ci, this.canvas.ctx.height)
      v.stroke = '#dedede'
      v.linewidth = 1
      ci += this.canvas.cellWidth
    }
  }

  zoom = (e: WheelEvent) => {
    let dy = (e.deltaY || -e.deltaY) / 1000
    this.zui.zoomBy(dy, e.clientX, e.clientY)
  }

  updateCursor = (type: string, e: PointerEvent) => {
    let { x, y } = e

    let { x: cx, y: cy } = this.zui.clientToSurface(x, y)

    console.log(x, y)
    let col = Math.floor(cx / (this.width + 1))
    let row = Math.floor(cy / (this.height + 1))
    let clientCenterX = (this.width + 1) * col + (this.width + 1) / 2
    let clientCenterY = (this.height + 1) * row + (this.height + 1) / 2
    this._cursor.position.x = clientCenterX
    this._cursor.position.y = clientCenterY

    this.canvas.dispatchEvent(
      new CustomEvent<CursorDetail>(type, {
        detail: {
          col,
          row,
          x: clientCenterX,
          y: clientCenterY,
          clientX: x,
          clientY: y,
        },
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
  clientX: number
  clientY: number
}
