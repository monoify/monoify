import Canvas, { Mode } from '../Canvas'
import { CursorDetail } from '../Cursor'
import { onKey } from '../util'

export default class LineTool {
  private canvas

  public style: Style = Style.Plain

  private isDrawing: boolean = false

  private line?: any // FIXME: wait for upstream upgrade

  constructor(canvas: Canvas) {
    this.canvas = canvas

    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
    this.canvas.addEventListener(
      'canvaskeydown',
      onKey({
        'Enter': this.confirm,
        'Space': this.confirm,
        'Escape': this.concel,
      })
    )
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }
    this.isDrawing = true

    if (this.line) {
      this.confirm()
    } else {
      // new line
      const { x, y } = e.detail
      this.line = this.canvas.ctx.makeLine(x, y, x, y)
      this.line.dashes = [5, 2]
      this.line.stroke = '#999'
      this.line.linewidth = 1
    }
  }

  confirm = () => {
    if (this.line) {
      this.line.stroke = '#000'
      this.line.dashes = [0, 0]
      this.line = undefined
      this.isDrawing = false
    }
  }

  concel = () => {
    if (this.line) {
      this.canvas.ctx.remove(this.line)
      this.line = undefined
      this.isDrawing = false
    }
  }

  validate = (): boolean => {
    if (!this.line) {
      return false
    }

    return false
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }

    if (this.line && this.isDrawing) {
      this.line.left.x = e.detail.x
      this.line.left.y = e.detail.y
    }
  }
}

export enum Style {
  Plain = 0,
  ArrowStart = 1,
  ArrowEnd = 2,
  ArrowDouble = 3,
}
