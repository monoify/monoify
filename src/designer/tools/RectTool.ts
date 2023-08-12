import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas, { Mode } from '../Canvas'
import Coordinate, {
  Axis,
  CellPosition,
  CellVector,
  CursorDetail,
} from '../Coordinate'
import { Anchor } from 'two.js/src/anchor'
import { Path } from 'two.js/src/path'
import { Commands } from 'two.js/src/utils/path-commands'

export default class RectTool {
  private canvas: Canvas

  private coordinate: Coordinate

  private guideLines?: RectGuideLine

  // private rect?: Rect

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.coordinate = canvas.coordinate
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
  }

  private onModeChange = (leave: Mode, enter: Mode) => {
    if (enter == Mode.Rect) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
    }
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Rect) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    this.coordinate.showPointer = false

    if (!this.guideLines) {
      this.guideLines = new RectGuideLine(e.detail)
      this.canvas.cursor.add(this.guideLines)
    } else {
      this.confirm()
    }
  }

  confirm() {
    if (this.guideLines) {
      let { start, end } = this.guideLines
      let measure = this.guideLines.measure
      if (measure[0].length != 0 && measure[1].length != 0) {
        this.canvas.state.addRect(start, end, measure)
      }
      this.concel()
    }
  }

  concel = () => {
    this.guideLines?.remove()
    this.guideLines = undefined
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Rect) {
      return
    }
    if (this.guideLines) {
      this.guideLines.end = e.detail
    }
  }

  onCursorUp = (e: CustomEvent) => {
    //   if (this.canvas.mode != Mode.Box) {
    //     return
    //   }
    //   this.isDrawing = false
    //   if (this.rect) {
    //     if (RectTool.isValid(this.rect)) {
    //       this.confirm()
    //     } else {
    //       this.concel()
    //     }
    //   }
    //   this.coordinate.showPointer = true
    // }
  }
}

class RectGuideLine extends Path {
  private _start: CellPosition

  private _end: CellPosition

  constructor(start: CellPosition) {
    let end = start
    super(
      [
        new Anchor(start.center[0], start.center[1]),
        new Anchor(end.center[0], start.center[1]),
        new Anchor(end.center[0], end.center[1]),
        new Anchor(start.center[0], end.center[1]),
      ],
      true,
      false,
      true
    )

    this.vertices[0].command = Commands.move
    this.vertices[1].command = Commands.line
    this.vertices[2].command = Commands.line
    this.vertices[3].command = Commands.line
    this.vertices[0].command = Commands.line

    this.stroke = '#999'
    this.noFill()
    this.linewidth = 1
    this.dashes = [5, 2]
    this._start = start
    this._end = start
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }

  set end(end: CellPosition) {
    this._end = end
    this.vertices[1].x = end.center[0]
    this.vertices[2].x = end.center[0]
    this.vertices[2].y = end.center[1]
    this.vertices[3].y = end.center[1]
  }

  get measure(): [CellVector, CellVector] {
    return [
      {
        axis: Axis.Horizontal,
        length: this.end.col - this.start.col,
      },
      {
        axis: Axis.Vertical,
        length: this.end.row - this.start.row,
      },
    ]
  }
}
