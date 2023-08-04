import Canvas, { Mode } from './Canvas'
import { CursorDetail } from './Cursor'

export default class Line {
  private canvas

  public style: Style = Style.Plain

  private isDrawing: boolean = false

  private line?: any

  constructor(canvas: Canvas) {
    this.canvas = canvas

    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }

    this.isDrawing = true

    const { x, y } = e.detail

    this.line = this.canvas.ctx.makeLine(x, y,x,y)
    this.line.dashes = [5, 2]
    this.line.stroke = '#999'
    this.line.linewidth = 1
  }

  onCursorUp = () => {
    if (this.canvas.mode != Mode.Line) {
      return
    }
    this.line.stroke = '#000'
    this.line.dashes = [0,0]
    this.isDrawing = false
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
