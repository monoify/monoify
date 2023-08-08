import { Rectangle } from 'two.js/src/shapes/rectangle'
import { CellPosition } from '../types'
import { Text } from 'two.js/src/text'
import { Group } from 'two.js/src/group'

export default class Character extends Group {
  _cell: CellPosition

  private _text: Text

  private _bg: Rectangle

  static getId(row: number, col: number) {
    return `ch_${row}_${col}`
  }

  constructor(cell: CellPosition, char: string, width: number, height: number) {
    super()
    this._text = new Text(char, cell.scx, cell.scy)
    this._cell = cell
    this._bg = new Rectangle(cell.scx, cell.scy, width, height)
    this._text = new Text(char, cell.scx, cell.scy)
    this._text.family = "FiraMono"
    this._bg.fill = '#fff'
    this._bg.linewidth = 1
    this._bg.stroke = '#dedede'
    this.add(this._bg, this._text)
    this.id = Character.getId(cell.row, cell.col)
  }

  get cell() {
    return this._cell
  }

  set cell(cell: CellPosition) {
    this._cell = cell
    this._text.position.x = cell.scx
    this._text.position.y = cell.scy
    this._bg.position.x = cell.scx
    this._bg.position.y = cell.scy
  }

  set value(char: string) {
    this._text.value = char
  }

  get value() {
    return this._text.value
  }
}
