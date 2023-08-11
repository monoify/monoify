import { Rectangle } from 'two.js/src/shapes/rectangle'
import { CellPosition } from '../Coordinate'

export default class Cursor extends Rectangle {

  private _cell: CellPosition

  constructor(
    cell: CellPosition,
    width: number,
    height: number,
    fill: string,
  ) {
    super(cell.center[0], cell.center[1], width, height)
    this.fill = fill
    this._cell = cell
    this.noStroke()
  }

  get cell() {
    return this._cell
  }

  set cell(cell: CellPosition) {
    this._cell = cell
    this.position.x = cell.center[0]
    this.position.y = cell.center[1]
  }
}
