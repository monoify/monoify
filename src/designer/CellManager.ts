import Canvas from './Canvas'
import { Line } from './shapes'
import { Direction } from './shapes/Line'

export default class CellManager {
  private canvas: Canvas

  private store: Line[] = []

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.ctx.addEventListener('hello', (e: any) => console.log(e))
  }

  addLine(line: Line) {
    this.store.push(line)
    this.dumpText()
  }

  dumpText() {
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

    let map: string[][] = Array.from(Array(maxRow - minRow + 1), (_) =>
      Array(maxCol - minCol + 1).fill(' ')
    )

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
  }

  static fillToLeft(map: string[][], row: number, bc: number, ec: number) {
    for (let i = bc; i >= ec; i--) {
      map[row][i] = '-'
    }
  }
  static fillToRight(map: string[][], row: number, bc: number, ec: number) {
    for (let i = bc; i <= ec; i++) {
      map[row][i] = '-'
    }
  }

  static fillToUp(map: string[][], col: number, br: number, er: number) {
    for (let i = br; i >= er; i--) {
      map[i][col] = '|'
    }
  }

  static fillToDown(map: string[][], col: number, br: number, er: number) {
    for (let i = br; i <= er; i++) {
      map[i][col] = '|'
    }
  }
}
