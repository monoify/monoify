import { Text } from 'two.js/src/text'
import { Shape } from 'two.js/src/shape'
import { Line } from 'two.js/src/shapes/line'
import { Group } from 'two.js/src/group'
import { Path } from 'two.js/src/path'
import { Anchor } from 'two.js/src/anchor'
import { Commands } from 'two.js/src/utils/path-commands'
import Canvas from './Canvas'
import CellSpec from './CellSpec'
import { CellPosition, CellVector } from './Coordinate'
import CellLine from './shapes/CellLine'
import CellRect from './shapes/CellRect'
import { Charset, CellRange as CellRange, CoordinateRange } from './types'
import CellShape from './shapes/CellShape'

export enum Direction {
  UP = 1,
  DOWN = 2,
  LEFT = 4,
  RIGHT = 8,
}

export enum CellValueType {
  Empty, // ' ',
  Horizontal, // '─',
  Vertical, // '│',
  DownRight, // '┌',
  DownLeft, // '┐',
  UpRight, // '└',
  UpLeft, // '┘',
  VerticalRight, // '├',
  VerticalLeft, // '┤',
  HorizontalDown, // '┬',
  HorizontalUp, // '┴',
  VerticalHorizontal, //'┼',
  Char,
}

const DefaultCharset: Charset = {
  [CellValueType.Empty]: ' ',
  [CellValueType.Horizontal]: '─',
  [CellValueType.Vertical]: '│',
  [CellValueType.DownRight]: '┌',
  [CellValueType.DownLeft]: '┐',
  [CellValueType.UpRight]: '└',
  [CellValueType.UpLeft]: '┘',
  [CellValueType.VerticalRight]: '├',
  [CellValueType.VerticalLeft]: '┤',
  [CellValueType.HorizontalDown]: '┬',
  [CellValueType.HorizontalUp]: '┴',
  [CellValueType.VerticalHorizontal]: '┼',
  [CellValueType.Char]: '__CHAR__',
}
const CellValueMapper: { [key: number]: CellValueType } = {
  [0]: CellValueType.Empty,
  [1]: CellValueType.Vertical,
  [2]: CellValueType.Vertical,
  [3]: CellValueType.Vertical,
  [4]: CellValueType.Horizontal,
  [5]: CellValueType.UpLeft,
  [6]: CellValueType.DownLeft,
  [7]: CellValueType.VerticalLeft,
  [8]: CellValueType.Horizontal,
  [9]: CellValueType.UpRight,
  [10]: CellValueType.DownRight,
  [11]: CellValueType.VerticalRight,
  [12]: CellValueType.Horizontal,
  [13]: CellValueType.HorizontalUp,
  [14]: CellValueType.HorizontalDown,
  [15]: CellValueType.VerticalHorizontal,
}

export default class StateManager {
  private canvas: Canvas

  private cells: { [key: string]: Cell } = {}

  readonly spec: CellSpec

  constructor(canvas: Canvas, spec: CellSpec) {
    this.canvas = canvas
    this.spec = spec
  }

  findByCell(row: number, col: number): CellShape[] {
    let shapes: CellShape[] = []
    let cell = this.getCell(row, col)
    if (cell) {
      if (cell.text) {
        shapes.push(cell)
      } else {
        const len = cell.cellshapes.length
        const shapeId = len > 0 ? cell.cellshapes[len - 1] : undefined
        if (shapeId) {
          for (let i = 0; i < this.canvas.shapes.children.length; i++) {
            if (this.canvas.shapes.children[i].id == shapeId) {
              shapes.push(this.canvas.shapes.children[i])
            }
          }
        }
      }
    }
    return shapes
  }

  remove(shape: CellShape) {
    for (const i in this.cells) {
      this.cells[i].delete(shape)
    }
  }

  findByRange(range: CoordinateRange): CellShape[] {
    let shapes = []
    const children = this.canvas.shapes.children
    for (let i = 0; i < children.length; i++) {
      if (children[i].inRange(range)) {
        shapes.push(children[i])
      }
    }
    return shapes
  }

  setText(position: CellPosition, text: string) {
    let { row, col } = position
    let cell = this.cell(row, col)
    cell.setText(text)
    this.canvas.shapes.add(cell)
  }

  deleteText(position: CellPosition) {
    let { row, col } = position
    let cell = this.cell(row, col)
    cell.deleteText()
  }

  addLine(start: CellPosition, end: CellPosition, measure: CellVector) {
    this.canvas.shapes.add(new CellLine(start, end, measure, this))
  }

  addRect(
    start: CellPosition,
    end: CellPosition,
    vertices: [CellVector, CellVector]
  ) {
    this.canvas.shapes.add(new CellRect(start, end, vertices, this))
  }

  cell(row: number, col: number): Cell {
    return this.getCell(row, col) || this.createCell(row, col)
  }

  private createCell(row: number, col: number): Cell {
    const cell = new Cell(row, col, this.spec)
    const key = `${row}_${col}`
    this.cells[key] = cell
    return cell
  }

  getCell(row: number, col: number): Cell | undefined {
    const key = `${row}_${col}`
    return this.cells[key]
  }

  renderText(): any {
    let maxRow = Number.MIN_VALUE
    let maxCol = Number.MIN_VALUE
    let minRow = Number.MAX_VALUE
    let minCol = Number.MAX_VALUE

    for (const key in this.cells) {
      let { col, row } = this.cells[key]
      maxRow = Math.max(maxRow, row)
      maxCol = Math.max(maxCol, col)
      minRow = Math.min(minRow, row)
      minCol = Math.min(minCol, col)
    }

    let text: string = ''
    for (let i = minRow; i <= maxRow; i++) {
      let line = ''
      for (let j = minCol; j <= maxCol; j++) {
        let cell = this.getCell(i, j)
        if (cell) {
          line += cell.renderText()
        } else {
          line += ' '
        }
      }
      text = text + line + `\n`
    }

    return {
      text,
      row: maxRow - minRow + 1,
      col: maxCol - minCol + 1,
    }
  }
}

export class Cell extends Group implements CellShape {
  private _selected: boolean
  readonly row: number
  readonly col: number
  readonly _center: [number, number]
  readonly top: [number, number]
  readonly left: [number, number]
  readonly bottom: [number, number]
  readonly right: [number, number]
  text?: Text
  readonly lines: { [key: string]: number } = {}
  readonly cellshapes: string[] = []

  constructor(row: number, col: number, spec: CellSpec) {
    super()
    this.id = `cell_${row}_${col}`
    this.row = row
    this.col = col
    this.text = undefined
    const centerX = (col + 0.5) * spec.width
    const centerY = (row + 0.5) * spec.height
    this._center = [centerX, centerY]
    this.top = [centerX, centerY - spec.height / 2]
    this.bottom = [centerX, centerY + spec.height / 2]
    this.left = [centerX - spec.width / 2, centerY]
    this.right = [centerX + spec.width / 2, centerY]
    this._selected = false
  }
  getShapeCenter(): { x: number; y: number } {
    return { x: this._center[0], y: this._center[1] }
  }

  inRange(range: CoordinateRange): boolean {
    let { x, y } = this.getShapeCenter()
    return (
      x >= range.x[0] && x <= range.x[1] && y >= range.y[0] && y <= range.y[1]
    )
  }

  get selected(): boolean {
    return this._selected
  }

  delete(shape: CellShape) {
    if (shape == this) {
      this.text?.remove()
      this.text = undefined
    } else {
      let i = this.cellshapes.findIndex((id) => id == shape.id)
      if (i >= 0) {
        this.cellshapes.splice(i, 1)
      }
      delete this.lines[shape.id]
    }
    this.renderShapes()
  }

  set selected(selected: boolean) {
    if (selected) {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i] instanceof Text) {
          this.children[i].fill = '#999'
        }
        if (this.children[i] instanceof Path) {
          this.children[i].stroke = '#999'
          this.children[i].dashes = [5, 2]
        }
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i] instanceof Text) {
          this.children[i].fill = '#000'
        }
        if (this.children[i] instanceof Path) {
          this.children[i].stroke = '#000'
          this.children[i].dashes = [0, 0]
        }
      }
    }
    this._selected = selected
  }

  setLine(joinpoint: number, shapeId: string) {
    let j = this.lines[shapeId] | 0
    this.lines[shapeId] = j | joinpoint
    this.cellshapes.push(shapeId)
    this.renderShapes()
  }

  setText(text: string) {
    this.text = new Text(text, this._center[0], this._center[1], 'FiraCode')
    this.renderShapes()
  }

  deleteText() {
    this.text = undefined
    this.renderShapes()
  }

  getCellValueType(): CellValueType {
    if (this.text) {
      return CellValueType.Char
    }

    let joinpoints: number = 0

    for (const line in this.lines) {
      joinpoints = joinpoints | this.lines[line]
    }

    return CellValueMapper[joinpoints] | CellValueType.Empty
  }

  getText(type: CellValueType, charset: Charset): string {
    return charset[type]
  }

  getShape(type: CellValueType): Shape | undefined {
    if (type == CellValueType.Empty) {
      return undefined
    }

    if (type == CellValueType.Char) {
      return this.text
    }

    if (type == CellValueType.Horizontal) {
      return new Line(this.left[0], this.left[1], this.right[0], this.right[1])
    }

    if (type == CellValueType.Vertical) {
      return new Line(this.top[0], this.top[1], this.bottom[0], this.bottom[1])
    }
    const left = new Anchor(this.left[0], this.left[1])
    const right = new Anchor(this.right[0], this.right[1])
    const center = new Anchor(this._center[0], this._center[1])
    const top = new Anchor(this.top[0], this.top[1])
    const bottom = new Anchor(this.bottom[0], this.bottom[1])

    if (type == CellValueType.VerticalLeft) {
      const path = new Path([left, center, top, bottom], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.move
      path.vertices[3].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.VerticalRight) {
      const path = new Path([right, center, top, bottom], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.move
      path.vertices[3].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.HorizontalUp) {
      const path = new Path([left, right, center, top], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.move
      path.vertices[3].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.HorizontalDown) {
      const path = new Path([left, right, center, bottom], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.move
      path.vertices[3].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.UpLeft) {
      const path = new Path([top, center, left], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.UpRight) {
      const path = new Path([top, center, right], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.DownLeft) {
      const path = new Path([bottom, center, left], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.DownRight) {
      const path = new Path([bottom, center, right], false, false, true)
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.line
      path.noFill()
      return path
    }

    if (type == CellValueType.VerticalHorizontal) {
      const path = new Path(
        [top, bottom, center, left, right],
        false,
        false,
        true
      )
      path.vertices[0].command = Commands.move
      path.vertices[1].command = Commands.line
      path.vertices[2].command = Commands.move
      path.vertices[3].command = Commands.line
      path.vertices[4].command = Commands.line
      path.noFill()
      return path
    }
  }

  renderShapes() {
    let type = this.getCellValueType()
    let shape = this.getShape(type)
    this.children.forEach((element: any) => {
      element.remove()
    })
    if (shape) {
      this.children.push(shape)
    }
  }

  renderText(charset: Charset = DefaultCharset): string {
    if (this.text) {
      return this.text.value
    }
    let type = this.getCellValueType()
    return this.getText(type, charset)
  }
}
