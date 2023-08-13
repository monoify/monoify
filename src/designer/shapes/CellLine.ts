import { Group } from 'two.js/src/group'
import { Axis, CellPosition, CellVector } from '../Coordinate'
import { Cell, Direction } from '../StateManager'
import StateManager from '../StateManager'
import CellRect from './CellRect'
import CellShape from './CellShape'
import { CoordinateRange } from '../types'

export default class CellLine extends Group implements CellShape {
  private _selected: boolean

  private _start: CellPosition

  private _end: CellPosition

  static MakeLine(
    start: CellPosition,
    vector: CellVector,
    state: StateManager,
    group: CellLine | CellRect
  ) {
    const { length, axis } = vector
    const len = Math.abs(length)
    let i = len
    while (i >= 0) {
      let cell
      let joinpoint: number = 0

      if (axis == Axis.Horizontal) {
        let col = start.col + (i * length) / len
        joinpoint = Direction.LEFT | Direction.RIGHT

        if (len > 0) {
          if (i == len) {
            joinpoint = length > 0 ? Direction.LEFT : Direction.RIGHT
          }

          if (i == 0) {
            joinpoint = length > 0 ? Direction.RIGHT : Direction.LEFT
          }
        }
        cell = state.cell(start.row, col)
      }

      if (axis == Axis.Vertical) {
        let row = start.row + (i * length) / len
        joinpoint = Direction.UP | Direction.DOWN

        if (len >= 0) {
          if (i == len) {
            joinpoint = length > 0 ? Direction.UP : Direction.DOWN
          }

          if (i == 0) {
            joinpoint = length > 0 ? Direction.DOWN : Direction.UP
          }
        }

        cell = state.cell(row, start.col)
      }

      if (cell) {
        cell.setLine(joinpoint, group.id)
        group.add(cell)
      }
      i--
    }
  }

  constructor(
    start: CellPosition,
    end: CellPosition,
    vector: CellVector,
    state: StateManager
  ) {
    super()
    CellLine.MakeLine(start, vector, state, this)
    this._selected = false
    this._start = start
    this._end = end
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }

  getShapeCenter(): { x: number; y: number } {
    let x = (this.start.center[0] + this.end.center[0]) / 2
    let y = (this.start.center[1] + this.end.center[1]) / 2
    return { x, y }
  }
  inRange(range: CoordinateRange): boolean {
    let { x, y } = this.getShapeCenter()
    return (
      x >= range.x[0] && x <= range.x[1] && y >= range.y[0] && y <= range.y[1]
    )
  }

  get selected(): boolean {
    return this._selected
  }

  set selected(selected: boolean) {
    this._selected = selected
    for (let i in this.children) {
      if (this.children[i] instanceof Cell) {
        this.children[i].selected = selected
      }
    }
  }
}
