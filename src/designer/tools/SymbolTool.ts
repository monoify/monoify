import Canvas, { Mode } from '../Canvas'
import { CursorDetail } from '../Coordinate'

const SYMBOLS = {
  Box: ['─', '│', '┌', '└', '┐', '┘', '┼', '┬', '┴', '├', '┤', '╌', '╎'],
  Circle: ['●', '◯', ''],
  Arrow: ['▲', '▼', '►', '◄', '↑', '→', '←', '↓', '◊', '◇', '◆'],
  Shadow: ['░', '▒', '▓'],
}

export default class SymbolTool {
  private canvas: Canvas

  private _symbol?: string = undefined

  private isDrawing: boolean = false

  private updated?: { row: number; col: number }

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
  }

  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Symbol) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    if (!this.symbol) {
      return
    }

    this.isDrawing = true
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    const { row, col } = e.detail
    if (this.updated && this.updated.col == col && this.updated.row == row) {
      return
    }
    if (this.isDrawing && this.symbol) {
      this.canvas.state.setText(e.detail, this.symbol)
      this.updated = { row, col }
    }
  }

  onCursorUp = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Symbol) {
      return
    }

    this.isDrawing = false
  }

  set symbol(symbol: string) {
    this._symbol = symbol
  }

  get symbol(): string | undefined {
    return this._symbol
  }

  getSymbols() {
    return SYMBOLS
  }

  private onModeChange = (leave: Mode, enter: Mode) => {
    if (enter == Mode.Symbol) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'cell'
    }

    if (leave == Mode.Symbol) {
    }
  }
}
