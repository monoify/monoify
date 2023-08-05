import { Path } from 'two.js/src/path'
import { CellPosition } from '../types'
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

  get direction():Direction {
    if (this._begin.scy < this._end.scy) {
      return Direction.VERTICAL_DOWN
    }

    if (this._begin.scy > this._end.scy) {
      return Direction.VERTICAL_UP
    }

    if(this._begin.scx < this._end.scx) {
      return Direction.HORIZONTAL_RIGHT
    }

    if(this._begin.scx > this._end.scx) {
      return Direction.HORIZONTAL_LEFT
    }

    return Direction.UNKNOWN
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
  VERTICAL_UP = 0,
  VERTICAL_DOWN = 1,
  HORIZONTAL_RIGHT = 2,
  HORIZONTAL_LEFT = 3,
  UNKNOWN = 4

}
