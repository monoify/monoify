import Canvas, { Mode } from '../Canvas'
import Coordinate from '../Coordinate'
import { CellPosition, CellVector, CursorDetail } from '../Coordinate'
import { onKey } from '../util'
import { Anchor } from 'two.js/src/anchor'
import { Path } from 'two.js/src/path'
import { Commands } from 'two.js/src/utils/path-commands'

export default class LineTool {
  private canvas

  public style: Style = Style.Plain

  private isDrawing: boolean = false

  private guideLine?: GuideLine

  private start?: CellPosition

  constructor(canvas: Canvas) {
    this.canvas = canvas

    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
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

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    if (!this.guideLine) {
      // drawing
      this.guideLine = new GuideLine(e.detail)
      this.canvas.cursor.add(this.guideLine)
    } else {
      this.confirm()
    }
  }

  confirm = () => {
    if (this.guideLine) {
      let measure = this.guideLine.measure
      if (measure) {
        this.canvas.state.addLine(this.guideLine.start, this.guideLine.end, measure)
      }
      this.concel()
    }
  }

  concel = () => {
    this.guideLine?.remove()
    this.guideLine = undefined
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Line) {
      return
    }
    if (this.guideLine) {
      this.guideLine.end = e.detail
    }
  }

  private onModeChange = (leave: Mode, enter: Mode) => {
    if (enter == Mode.Line) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
    }
  }
}

class GuideLine extends Path {
  private _start: CellPosition
  private _end: CellPosition
  constructor(start: CellPosition) {
    super([
      new Anchor(start.center[0], start.center[1]),
      new Anchor(start.center[0], start.center[1]),
    ])
    this._start = start
    this._end = start
    this.vertices[0].command = Commands.move
    this.vertices[1].command = Commands.line
    this.stroke = '#999'
    this.dashes = [5, 2]
    this.linewidth = 1
  }

  set end(end: CellPosition) {
    this._end = end
    this.vertices[1].x = end.center[0]
    this.vertices[1].y = end.center[1]
  }

  get end() {
    return this._end
  }

  get start() {
    return this._start
  }

  get measure(): CellVector | undefined {
    return Coordinate.Measure(this._end, this._start)
  }
}

export enum Style {
  Plain = 0,
  ArrowStart = 1,
  ArrowEnd = 2,
  ArrowDouble = 3,
}
