import { Group } from 'two.js/src/group'
import { CellPosition, CellVector } from '../Coordinate'
import CellLine from './CellLine'
import StateManager, { Cell } from '../StateManager'
import CellShape from './CellShape'
import { CoordinateRange } from '../types'

export default class CellRect extends Group implements CellShape {
  private _start: CellPosition

  private _end: CellPosition

  private _selected: boolean

  constructor(
    start: CellPosition,
    end: CellPosition,
    vertices: [CellVector, CellVector],
    state: StateManager
  ) {
    super()
    CellLine.MakeLine(start, vertices[0], state, this)
    CellLine.MakeLine(start, vertices[1], state, this)
    CellLine.MakeLine(
      end,
      { axis: vertices[0].axis, length: -vertices[0].length },
      state,
      this
    )
    CellLine.MakeLine(
      end,
      { axis: vertices[1].axis, length: -vertices[1].length },
      state,
      this
    )
    this._selected = false
    this._start = start
    this._end = end
  }

  get start(): CellPosition {
    return this._start
  }

  get end(): CellPosition {
    return this._end
  }

  getShapeCenter(): { x: number; y: number } {
    let x = (this.end.center[0] + this.start.center[0]) / 2
    let y = (this.end.center[1] + this.start.center[1]) / 2
    return { x, y }
  }

  inRange(range: CoordinateRange): boolean {
    let { x, y } = this.getShapeCenter()
    return (
      x >= range.x[0] && x <= range.x[1] && y >= range.y[0] && y <= range.y[1]
    )
  }

  get selected() {
    return this.selected
  }

  set selected(selected: boolean) {
    for (const i in this.children) {
      if (this.children[i] instanceof Cell) {
        this.children[i].selected = selected
      }
    }
    this._selected = selected
  }
}
