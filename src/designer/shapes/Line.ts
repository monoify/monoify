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

  //FIXME @deprecated
  get _direction(): Direction {
    if (this._begin.scy < this._end.scy) {
      return Direction.VERTICAL_DOWN
    }

    if (this._begin.scy > this._end.scy) {
      return Direction.VERTICAL_UP
    }

    if (this._begin.scx < this._end.scx) {
      return Direction.HORIZONTAL_RIGHT
    }

    if (this._begin.scx > this._end.scx) {
      return Direction.HORIZONTAL_LEFT
    }

    return Direction.None
  }

  // axis[0] fixed, axis[1] change
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
          anchor = Direction.HORIZONTAL_RIGHT
        }

        if (j == Math.abs(vector[1])) {
          anchor = Direction.HORIZONTAL_LEFT
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
          anchor = Direction.VERTICAL_DOWN
        }

        if (j == Math.abs(vector[0])) {
          anchor = Direction.VERTICAL_UP
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

  get ordered(): CellPosition[] {
    let vector = this.vector
    return vector[0] + vector[1] > 0
      ? [this._begin, this.end]
      : [this._end, this.begin]
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

type VectorInfo = {
  axes: Axis[]
  pos: number[]
  postive: boolean
}

export enum Axis {
  HORIZONTAL = 'row',
  VERTICAL = 'col',
}

export enum Direction {
  VERTICAL_UP = 0,
  VERTICAL_DOWN = 1,
  HORIZONTAL_RIGHT = 2,
  HORIZONTAL_LEFT = 3,
  None = 4,
}
