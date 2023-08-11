import { Group } from 'two.js/src/group'
import { Axis, CellPosition, CellVector } from '../Coordinate'
import { Direction } from '../StateManager'
import StateManager from '../StateManager'
import CellRect from './CellRect'

export default class CellLine extends Group {
  static MakeLine(
    start: CellPosition,
    vector: CellVector,
    state: StateManager,
    group: CellLine | CellRect
  ) {
    console.log(start, vector)
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

  constructor(start: CellPosition, vector: CellVector, state: StateManager) {
    super()
    CellLine.MakeLine(start, vector, state, this)
  }
}
