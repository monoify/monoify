import { Rectangle } from 'two.js/src/shapes/rectangle'
import { CellPosition } from '../types'

export default class CursorShape extends Rectangle {

  private _cell: CellPosition

  constructor(
    cell: CellPosition,
    width: number,
    height: number,
    fill: string,
    blink: boolean = false
  ) {
    super(cell.scx, cell.scy, width, height)
    this.fill = fill
    this._cell = cell
    this.noStroke()
  }

  get cell() {
    return this._cell
  }

  set cell(cell: CellPosition) {
    this._cell = cell
    this.position.x = cell.scx
    this.position.y = cell.scy
  }
}
