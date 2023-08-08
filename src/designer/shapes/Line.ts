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
  get axesInfo(): AxesInfo {
    let axes =
      this._begin.row == this._end.row
        ? [Axis.HORIZONTAL, Axis.VERTICAL]
        : [Axis.VERTICAL, Axis.HORIZONTAL]
    return {
      axes,
      pos: [this._begin[axes[0]], this._begin[axes[1]], this._end[axes[1]]],
    }
  }

  get ordered() {
    let { axes } = this.axesInfo
    return this._begin[axes[1]] > this._end[axes[1]]
      ? [this._end, this._begin]
      : [this._begin, this._end]
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

type AxesInfo = {
  axes: Axis[]
  pos: number[]
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
