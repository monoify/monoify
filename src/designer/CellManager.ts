import Canvas from './Canvas'
import { Line } from './shapes'
import { Direction } from './shapes/Line'
import { CellBorder, Charset } from './types'

const DEFAULT_CHARSET: Charset = {
  [CellBorder.Empty]: ' ',
  [CellBorder.Horizontal]: '−',
  [CellBorder.Vertical]: '│',
  [CellBorder.DownRight]: '┌',
  [CellBorder.DownLeft]: '┐',
  [CellBorder.UpRight]: '└',
  [CellBorder.UpLeft]: '┘',
  [CellBorder.VerticalRight]: '├',
  [CellBorder.VerticalLeft]: '┤',
  [CellBorder.HorizontalDown]: '┬',
  [CellBorder.HorizontalUp]: '┴',
  [CellBorder.VerticalHorizontal]: '┼',
}

export class Cell {
  readonly row: number
  readonly col: number
  border: CellBorder
  state: Direction
  character?: string

  constructor(row: number, col: number) {
    this.row = row
    this.col = col
    this.border = CellBorder.Empty
    this.state = Direction.None
  }

  setBorder(
    type: CellBorder.Vertical | CellBorder.Horizontal,
    anchor: Direction
  ) {
    if (anchor != Direction.None && this.state == Direction.None) {
      this.state = anchor
    }

    if (this.border == CellBorder.Empty || this.border == type) {
      this.border = type
      return
    }

    if (type == CellBorder.Vertical) {
      if (
        this.border == CellBorder.DownLeft ||
        this.border == CellBorder.UpLeft
      ) {
        this.border = CellBorder.VerticalLeft
      }

      if (
        this.border == CellBorder.DownRight ||
        this.border == CellBorder.UpRight
      ) {
        this.border = CellBorder.VerticalRight
      }

      if (this.border == CellBorder.Horizontal) {
        if (this.state == Direction.None) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalHorizontal
          } else if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.HorizontalUp
          } else if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.HorizontalDown
          }
        }

        if (this.state == Direction.HORIZONTAL_LEFT) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalLeft
          }

          if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.UpLeft
          }

          if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.DownLeft
          }
        }

        if (this.state == Direction.HORIZONTAL_RIGHT) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalRight
          }

          if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.UpRight
          }

          if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.DownRight
          }
        }
      }
    }

    if (type == CellBorder.Horizontal) {
      if (
        this.border == CellBorder.DownLeft ||
        this.border == CellBorder.DownRight
      ) {
        this.border = CellBorder.HorizontalDown
      }

      if (
        this.border == CellBorder.UpLeft ||
        this.border == CellBorder.UpRight
      ) {
        this.border = CellBorder.HorizontalUp
      }

      if (this.border == CellBorder.Vertical) {
        if (this.state == Direction.None) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalHorizontal
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.VerticalLeft
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.VerticalRight
          }
        }

        if (this.state == Direction.VERTICAL_UP) {
          if (anchor == Direction.None) {
            this.border = CellBorder.HorizontalUp
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.UpLeft
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.UpRight
          }
        }

        if (this.state == Direction.VERTICAL_DOWN) {
          if (anchor == Direction.None) {
            this.border = CellBorder.HorizontalDown
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.DownLeft
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.DownRight
          }
        }
      }
    }
  }
}

export default class CellManager {
  private canvas: Canvas

  private store: Line[] = []

  constructor(canvas: Canvas) {
    this.canvas = canvas
  }

  addLine(line: Line) {
    this.store.push(line)
  }

  dumpText(charset: Charset = DEFAULT_CHARSET): string {
    let minCol: number = Number.MAX_VALUE
    let minRow: number = Number.MAX_VALUE
    let maxCol: number = Number.MIN_VALUE
    let maxRow: number = Number.MIN_VALUE

    // find boundry
    for (let i = 0; i < this.store.length; i++) {
      let obj = this.store[i]
      let { row: br, col: bc } = obj.begin
      let { row: er, col: ec } = obj.end

      minCol = Math.min(minCol, bc, ec)
      minRow = Math.min(minRow, br, er)
      maxCol = Math.max(maxCol, bc, ec)
      maxRow = Math.max(maxRow, br, er)
    }

    let map: Cell[][] = []
    for (let i = 0; i < maxRow - minRow + 1; i++) {
      let row: Cell[] = []
      for (let j = 0; j < maxCol - minCol + 1; j++) {
        let cell = new Cell(i, j)
        row.push(cell)
      }
      map.push(row)
    }

    // remapping
    for (let i = 0; i < this.store.length; i++) {
      let obj = this.store[i]
      let br = obj.begin.row - minRow
      let bc = obj.begin.col - minCol
      let er = obj.end.row - minRow
      let ec = obj.end.col - minCol

      if (obj.direction == Direction.HORIZONTAL_LEFT) {
        CellManager.fillToLeft(map, br, bc, ec)
      }

      if (obj.direction == Direction.HORIZONTAL_RIGHT) {
        CellManager.fillToRight(map, br, bc, ec)
      }

      if (obj.direction == Direction.VERTICAL_UP) {
        CellManager.fillToUp(map, bc, br, er)
      }

      if (obj.direction == Direction.VERTICAL_DOWN) {
        CellManager.fillToDown(map, bc, br, er)
      }
    }

    return map
      .map((line) => line.map((c) => charset[c.border]).join(''))
      .join('\n')
  }

  static fillToLeft(map: Cell[][], row: number, bc: number, ec: number) {
    for (let i = bc; i >= ec; i--) {
      map[row][i].setBorder(
        CellBorder.Horizontal,
        i == bc ? Direction.HORIZONTAL_LEFT : Direction.None
      )
    }
  }
  static fillToRight(map: Cell[][], row: number, bc: number, ec: number) {
    for (let i = bc; i <= ec; i++) {
      map[row][i].setBorder(
        CellBorder.Horizontal,
        i == bc ? Direction.HORIZONTAL_RIGHT : Direction.None
      )
    }
  }

  static fillToUp(map: Cell[][], col: number, br: number, er: number) {
    for (let i = br; i >= er; i--) {
      map[i][col].setBorder(
        CellBorder.Vertical,
        i == br ? Direction.VERTICAL_UP : Direction.None
      )
    }
  }

  static fillToDown(map: Cell[][], col: number, br: number, er: number) {
    for (let i = br; i <= er; i++) {
      map[i][col].setBorder(
        CellBorder.Vertical,
        i == br ? Direction.VERTICAL_DOWN : Direction.None
      )
    }
  }
}
