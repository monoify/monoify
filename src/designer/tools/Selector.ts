import Coordinate, { CursorDetail } from '../Coordinate'
import Canvas, { Mode } from '../Canvas'
import { Shape } from 'two.js/src/shape'
import { onKey } from '../util'
import { Path } from 'two.js/src/path'
import { Anchor } from 'two.js/src/anchor'
import { Commands } from 'two.js/src/utils/path-commands'
import { CoordinateRange } from '../types'
import type CellShape from '../shapes/CellShape'

class Selector {
  private canvas: Canvas

  private coordinate: Coordinate

  private selected?: SelectedRange

  private selectedShapes?: Shape[]

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.coordinate = canvas.coordinate
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
    this.canvas.addEventListener(
      'canvaskeydown',
      onKey({
        Backsapce: this.removeSelected,
        Delete: this.removeSelected,
      })
    )
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Select) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    if (!this.selected) {
      this.selected = new SelectedRange(e.detail)
      this.canvas.cursor.add(this.selected)
      this.coordinate.showPointer = false
    }
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Select) {
      return
    }

    if (this.selected) {
      this.selected.end = e.detail
    }
  }

  onCursorUp = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Select) {
      return
    }

    if (this.selected) {
      this.selected.end = e.detail
      this.canvas.state.findShapes(this.selected.range).forEach((cell:CellShape)=> {
        cell.selected = true
      })
    }

    this.coordinate.showPointer = true
    this.clearRange()
  }

  removeSelected = () => {
    // FIXME cellmgr remove

    this.selected?.remove()
  }

  private clearRange() {
    this.selected?.remove()
    this.selected = undefined
  }

  private onModeChange = (leave: Mode, enter: Mode) => {
    if (enter == Mode.Select) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'cell'
    }
  }
}

class SelectedRange extends Path {
  private _start: CursorDetail

  private _end: CursorDetail

  constructor(start: CursorDetail) {
    let end = start
    super(
      [
        new Anchor(start.x, start.y),
        new Anchor(end.x, start.y),
        new Anchor(end.x, end.y),
        new Anchor(start.x, end.y),
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

    this.stroke = '#dedede'
    this.fill = 'rgba(31,104,187,0.3)'
    this.linewidth = 1
    // this.dashes = [5, 2]
    this._start = start
    this._end = start
  }

  get start() {
    return this._start
  }

  set end(end: CursorDetail) {
    this.vertices[1].x = end.x
    this.vertices[2].x = end.x
    this.vertices[2].y = end.y
    this.vertices[3].y = end.y
    this._end = end
  }

  get end() {
    return this._end
  }

  get range(): CoordinateRange {
    return {
      x: [this.start.x, this.end.x].sort() as [number, number],
      y: [this.start.y, this.end.y].sort() as [number, number],
    }
  }
}
export default Selector
