import { Group } from 'two.js/src/group'
import { CellPosition, CellVector } from '../Coordinate'
import CellLine from './CellLine'
import StateManager from '../StateManager'

export default class CellRect extends Group {
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
  }
}
