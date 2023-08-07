import { CellPosition } from "../types";
import { Text } from "two.js/src/text";

export default class Character extends Text {

  _cell: CellPosition

  char: string

  constructor(cell: CellPosition, char: string) {
    super(char,cell.scx,cell.scy)
    this._cell = cell
    this.char = char
  }

  get cell() {
    return this._cell
  }

  set cell(cell:CellPosition) {
    this._cell = cell
    this.position.x = cell.scx
    this.position.y = cell.scy
  }

}
