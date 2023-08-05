import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas, { Mode, Region } from '../Canvas'
import Cursor from '../Cursor'

export default class RectTool {
  private canvas: Canvas

  private cursor: Cursor

  private isDrawing: boolean = false

  private box?: Region

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.cursor = canvas.cursor
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
  }

  onCursorDown = (e: CustomEvent) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }
    let { x, y } = e.detail
    this.cursor.show = false
    this.isDrawing = true
    this.box = this.canvas.createRegion(x, y, 1, 1)
    this.box.stroke = '#000'
    this.box.noFill()
    this.box.linewidth = 1
  }

  onCursorMove = (e: CustomEvent) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }

    if (this.isDrawing && this.box) {
      this.canvas.updateRegion(this.box, e.detail.x, e.detail.y)
    }
  }

  onCursorUp = (e: CustomEvent) => {
    if (this.canvas.mode != Mode.Box) {
      return
    }
    this.cursor.show = true
    this.isDrawing = false


    if(this.box) {

      this.box.translation

    }
  }
















}
