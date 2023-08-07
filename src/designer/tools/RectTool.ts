import Canvas, { Mode } from '../Canvas'
import Coordinate, { CursorDetail } from '../Coordinate'
import { Rect } from '../shapes'
import { CellPosition } from '../types'

export default class RectTool {

  private canvas: Canvas

  private coordinate: Coordinate

  private isDrawing: boolean = false

  private rect?: Rect

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.coordinate = canvas.coordinate
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
  }

  makeRect(start: CellPosition): Rect {
    let rect = new Rect(start, start)
    rect.dashes = [5, 2]
    rect.stroke = '#999'
    rect.linewidth = 1
    rect.noFill()
    this.canvas.ctx.scene.add(rect)
    return rect
  }

  static isValid(rect: Rect) {
    if (!rect) {
      return false
    }

    let { scx: bx, scy: by } = rect.bottomright
    let { scx: ex, scy: ey } = rect.topleft

    return bx != ex && by != ey
  }

  concel() {
    if (this.rect) {
      this.canvas.ctx.remove(this.rect)
      this.rect = undefined
      this.isDrawing = false
    }
  }

  confirm() {
    if (this.rect) {
      this.rect.stroke = '#000'
      this.rect.dashes = [0, 0]
      this.isDrawing = false
      this.canvas.cellMgr.addLines(this.rect.lines)
      this.rect = undefined
    }
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    let { x, y, col, row } = e.detail

    this.coordinate.show = false
    this.isDrawing = true
    this.rect = this.makeRect({ col, row, scx: x, scy: y })
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }

    if (this.isDrawing && this.rect) {
      let { x, y, col, row } = e.detail
      this.rect.bottomright = { col, row, scx: x, scy: y }
    }
  }

  onCursorUp = (e: CustomEvent) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }
    this.isDrawing = false
    if (this.rect) {
      if (RectTool.isValid(this.rect)) {
        this.confirm()
      } else {
        this.concel()
      }
    }
    this.coordinate.show = true
  }
}
