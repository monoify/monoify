import Canvas, { Mode } from '../Canvas'
import Cursor from '../shapes/Cursor'
import Coordinate from '../Coordinate'
import { CursorDetail } from '../Coordinate'
import { CellPosition, KeyboardDetail } from '../types'
import Character from '../shapes/Character'

export default class TextTool {
  static Move: any = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  }

  private canvas: Canvas

  private inputCursor?: Cursor

  private isInputting: boolean = false

  private _blinkTimer?: ReturnType<typeof setInterval>

  private cursorBg: string[] = ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']

  // printable chars
  private chars =
    ' !"#$&\'()+,./0123456789:;<=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
    this.canvas.addEventListener('canvaskeydown', this.onKeyDown)
  }

  onKeyDown = (e: CustomEvent<KeyboardDetail>) => {
    if (this.canvas.mode == Mode.Text) {
      let { key } = e.detail
      if (this.chars.indexOf(key) >= 0) {
        this.addChar(key)
      } else if (key == 'Backspace') {
        this.removeChar(true)
      } else if (key == 'Delete') {
        this.removeChar(false)
      } else if (key.indexOf('Arrow') >= 0) {
        this.moveCursor(TextTool.Move[key])
      }
    }
  }

  moveCursor = (move: number[] = [0, 0]) => {
    if (this.inputCursor) {
      const { row, col } = this.inputCursor.cell
      this.inputCursor.cell = this.canvas.coordinate.getCellPosition(
        row + move[0],
        col + move[1]
      )
    }
  }

  removeChar = (prev: boolean) => {
    if (this.inputCursor) {
      const { row, col } = this.inputCursor.cell
      if (prev) {
        this.inputCursor.cell = this.canvas.coordinate.getCellPosition(
          row,
          col - 1
        )
      }
      this.removeAt(row, prev ? col - 1 : col)
    }
  }

  removeAt(row: number, col: number) {
    let char = this.canvas.chars.getById(`ch_${row}_${col}`)
    if (char) {
      this.canvas.cellMgr.remove(char as Character)
      char.remove()
    }
  }

  addChar = (value: string) => {
    if (this.inputCursor) {
      const { col, row } = this.inputCursor?.cell
      const { cellWidth, cellHeight } = this.canvas.coordinate
      let char: Character = this.canvas.chars.getById(
        Character.getId(row, col)
      ) as Character

      if (char) {
        char.value = value
      } else {
        let ch = new Character(
          this.inputCursor.cell,
          value,
          cellWidth,
          cellHeight
        )
        this.canvas.chars.add(ch)
        this.inputCursor.cell = this.canvas.coordinate.getCellPosition(
          row,
          col + 1
        )
        this.canvas.cellMgr.addCharacter(ch)
      }
    }
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Text) {
      return
    }

    const { col, row, x: scx, y: scy } = e.detail
    const cell: CellPosition = { col, row, scx, scy }

    if (!this.inputCursor) {
      this.inputCursor = Coordinate.makeCursor(
        cell,
        this.canvas.coordinate.cellInnerWidth,
        this.canvas.coordinate.cellInnerHeight,
        this.cursorBg[0]
      )
      this.inputCursor.noStroke()
      this.canvas.cursor.add(this.inputCursor)
      this._blinkTimer = setInterval(this.blink, 750)
    }
    this.inputCursor.fill = this.cursorBg[0]
    this.inputCursor.cell = cell
  }

  blink = () => {
    if (this.inputCursor) {
      this.inputCursor.fill =
        this.inputCursor.fill == this.cursorBg[0]
          ? this.cursorBg[1]
          : this.cursorBg[0]
    }
  }

  onModeChange = (curMode: Mode, changedMode: Mode) => {
    if (curMode == Mode.Text && changedMode != Mode.Text) {
      this.isInputting = false
      clearInterval(this._blinkTimer)
      this.inputCursor?.remove()
      this.inputCursor = undefined
    }
  }
}
