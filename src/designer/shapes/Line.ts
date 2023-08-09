import { Path } from 'two.js/src/path'
import { CellBorder, CellPosition } from '../types'
import { Anchor } from 'two.js/src/anchor'
import { Commands } from 'two.js/src/utils/path-commands'

export default class Line extends Path {

  _begin: CellPosition

  _end: CellPosition

  constructor(begin: CellPosition, end: CellPosition) {
    const points = [
      new Anchor(begin.scx, begin.scy),
      new Anchor(end.scx, end.scy),
    ]

    super(points)

    this.vertices[0].command = Commands.move
    this.vertices[1].command = Commands.line

    this.automatic = false

    this._begin = begin
    this._end = end
  }

  get vector(): number[] {
    return [this._end.row - this._begin.row, this._end.col - this._begin.col]
  }

  get cells(): any[] {
    let vector = this.vector
    let cells = []

    if (vector[0] == 0) {
      for (let j = 0; j <= Math.abs(vector[1]); j++) {
        let left: '_begin' | '_end' = vector[1] > 0 ? '_begin' : '_end'

        let anchor = Direction.None
        if (j == 0) {
          anchor = Direction.RIGHT
        }

        if (j == Math.abs(vector[1])) {
          anchor = Direction.LEFT
        }
        cells.push({
          row: this._begin.row,
          col: this[left].col + j,
          border: CellBorder.Horizontal,
          anchor,
        })
      }
    }

    if (vector[1] == 0) {
      for (let j = 0; j <= Math.abs(vector[0]); j++) {
        let left: '_begin' | '_end' = vector[0] > 0 ? '_begin' : '_end'
        let anchor = Direction.None
        if (j == 0) {
          anchor = Direction.DOWN
        }

        if (j == Math.abs(vector[0])) {
          anchor = Direction.UP
        }
        cells.push({
          row: this[left].row + j,
          col: this._begin.col,
          border: CellBorder.Vertical,
          anchor,
        })
      }
    }

    return cells
  }

  get begin() {
    return this._begin
  }

  get end() {
    return this._end
  }

  set end(end: CellPosition) {
    this._end = end
    this.vertices[1].x = end.scx
    this.vertices[1].y = end.scy
  }

  set begin(begin: CellPosition) {
    this._begin = begin
    this.vertices[0].x = begin.scx
    this.vertices[0].y = begin.scy
  }
}

export enum Direction {
  UP = 0,
  DOWN = 1,
  RIGHT = 2,
  LEFT = 3,
  None = 4,
}
