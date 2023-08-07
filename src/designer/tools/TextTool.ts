import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas, { Mode } from '../Canvas'

class TextTool {
  private canvas: Canvas

  private inputCursor: Rectangle

  private isInputting: boolean = false

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
  }

  onCursorDown = () => {
    if (this.canvas.mode != Mode.Text) {
      return
    }
  }

  onModeChange = () => {
    this.isInputting = false

    if(this.inputCursor == )
  }
}
