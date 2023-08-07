import Canvas, { Mode } from '../Canvas'
import Cursor from '../shapes/Cursor'
import Coordinate from '../Coordinate'
import { CursorDetail } from '../Coordinate'
import { CellPosition, KeyboardDetail } from '../types'
import Character from '../shapes/Character'

export default class TextTool {
  private canvas: Canvas

  private inputCursor?: Cursor

  private isInputting: boolean = false

  private _blinkTimer?: ReturnType<typeof setInterval>

  // printable chars
  private chars =
    '!"#$&\'()+,./0123456789:;<=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
    this.canvas.addEventListener('canvaskeydown', this.onKeyDown)
  }

  onKeyDown = (e: CustomEvent<KeyboardDetail>) => {
    let { key } = e.detail
    if (this.chars.indexOf(key) >= 0) {
      this.addChar(key)
    }
  }

  addChar = (char: string) => {
    if (this.inputCursor) {
      const { col, row } = this.inputCursor?.cell
      let ch = new Character(this.inputCursor.cell, char)
      this.canvas.chars.add(ch)
      this.inputCursor.cell = this.canvas.coordinate.getCellPosition(row, col + 1)
      this.canvas.cellMgr.addCharacter(ch)
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
        '#aaa'
      )
      this.inputCursor.noStroke()

      this.canvas.grids.add(this.inputCursor)
      this._blinkTimer = setInterval(this.blink, 750)
    }
    this.inputCursor.fill = '#aaa'
    this.inputCursor.cell = cell
  }

  blink = () => {
    if (this.inputCursor) {
      this.inputCursor.fill =
        this.inputCursor.fill == '#EFECEC' ? '#aaa' : '#EFECEC'
    }
  }

  onModeChange = (_: Mode, changedMode: Mode) => {
    if (changedMode != Mode.Text) {
      this.isInputting = false
      this.canvas.ctx.off('update', this.blink)
      clearInterval(this._blinkTimer)
      this.inputCursor?.remove()
      this.inputCursor == undefined
    }
  }
}
