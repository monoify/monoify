import Canvas, { Mode } from '../Canvas'
import Cursor from '../shapes/Cursor'
import Coordinate, { CellPosition, CursorDetail } from '../Coordinate'
import { KeyboardDetail } from '../types'

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
        this.setText(key)
      } else if (key == 'Backspace') {
        this.deleteText(true)
      } else if (key == 'Delete') {
        this.deleteText(false)
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

  deleteText = (prev: boolean) => {
    if(this.inputCursor) {
      if(prev) {
        this.moveCursor([0,-1])
      }
      this.removeAt(this.inputCursor.cell)
    }
  }

  removeAt(position: CellPosition) {
    this.canvas.state.deleteText(position)
  }

  setText = (value: string) => {
    if (this.inputCursor) {
      this.canvas.state.setText(this.inputCursor.cell, value)
      this.moveCursor([0, 1])
    }
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Text) {
      return
    }

    if (!this.inputCursor) {
      this.inputCursor = Coordinate.makeCursor(
        e.detail,
        this.canvas.cellSpec.width,
        this.canvas.cellSpec.height,
        this.cursorBg[0]
      )
      this.inputCursor.noStroke()
      this.canvas.cursor.add(this.inputCursor)
      this._blinkTimer = setInterval(this.blink, 750)
    }
    this.inputCursor.fill = this.cursorBg[0]
    this.inputCursor.cell = e.detail
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
    if(changedMode == Mode.Text) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'text'
    }
  }

}
