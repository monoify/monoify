import Line from './Line'
import { CellPosition } from '../types'
import { Group } from 'two.js/src/group'

export default class Rect extends Group {
  lines: Line[] = []

  constructor(topleft: CellPosition, bottomright: CellPosition) {
    let topright = {
      row: topleft.row,
      col: bottomright.col,
      scx: bottomright.scx,
      scy: topleft.scy,
    }

    let bottomleft = {
      row: bottomright.row,
      col: topleft.col,
      scx: topleft.scx,
      scy: bottomright.scy,
    }
    const lines = [
      new Line(topleft, topright),
      new Line(topright, bottomright),
      new Line(bottomright, bottomleft),
      new Line(bottomleft, topleft),
    ]

    super(lines)

    this.lines = lines
  }

  get topleft() {
    return this.lines[0].begin //fixed
  }

  get bottomright() {
    return this.lines[1].end //fixed
  }

  set bottomright(bottomright: CellPosition) {
    let topleft = this.lines[0].begin //fixed
    let topright = {
      row: topleft.row,
      col: bottomright.col,
      scx: bottomright.scx,
      scy: topleft.scy,
    }
    let bottomleft = {
      row: bottomright.row,
      col: topleft.col,
      scx: topleft.scx,
      scy: bottomright.scy,
    }

    this.lines[0].end = topright
    this.lines[1].begin = topright
    this.lines[1].end = bottomright
    this.lines[2].begin = bottomright
    this.lines[2].end = bottomleft
    this.lines[3].begin = bottomleft
    this.lines[3].end = topleft
  }

  set dashes(dashes: number[]) {
    this.lines[0].dashes = dashes
    this.lines[1].dashes = dashes
    this.lines[2].dashes = dashes
    this.lines[3].dashes = dashes
  }
}
