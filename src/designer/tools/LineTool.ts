import Canvas, { Mode } from '../Canvas'
import { CursorDetail } from '../Cursor'
import { Line } from '../shapes'
import { CellPosition } from '../types'
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
        Enter: this.confirm,
        Space: this.confirm,
        Escape: this.concel,
      })
    )
  }

  static isValid(line: Line): boolean {
    if (!line) {
      return false
    }
    let { scx: bx, scy: by } = line.begin
    let { scx: ex, scy: ey } = line.end

    return (bx != ex && by == ey) || (by != ey && bx == ex)
  }

  makeLine = (start: CursorDetail) => {
    let p: CellPosition = {
      row: start.row,
      col: start.col,
      scx: start.x,
      scy: start.y,
    }
    this.line = new Line(p, p)
    this.line.dashes = [5, 2]
    this.line.stroke = '#999'
    this.line.linewidth = 1

    this.canvas.ctx.scene.add(this.line)
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }


    if (this.line) {
      if (LineTool.isValid(this.line)) {
        this.confirm()
      } else {
        this.concel()
      }
    } else {
      this.isDrawing = true
      this.makeLine(e.detail)
    }
  }

  confirm = () => {
    if (this.line) {
      this.line.stroke = '#000'
      this.line.dashes = [0, 0]
      this.isDrawing = false

      this.canvas.cellMgr.addLines(this.line)
      this.line = undefined
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
      let { row, col, x: scx, y: scy } = e.detail

      let p: CellPosition = {
        row,
        col,
        scx,
        scy,
      }
      // this.line.right.x = scx
      // this.line.right.y = scy

      this.line.end = p
    }
  }
}

export enum Style {
  Plain = 0,
  ArrowStart = 1,
  ArrowEnd = 2,
  ArrowDouble = 3,
}
