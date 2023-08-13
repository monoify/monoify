import Canvas, { Mode } from '../Canvas'
import { Vector } from 'two.js/src/vector'
import { CursorDetail } from '../Coordinate'

export default class HandTool {
  private canvas: Canvas

  private move: Vector = new Vector()

  private isMoving: boolean = false

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.ctx.addEventListener('modechange', this.onModeChange)
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.isMoving = false
  }

  private onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode == Mode.Hand) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'grabbing'
      this.move.x = e.detail.clientX
      this.move.y = e.detail.clientY
      this.isMoving = true
    }
  }

  private onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode == Mode.Hand) {
      if (this.isMoving) {
        const dx = e.detail.clientX - this.move.x
        const dy = e.detail.clientY - this.move.y
        this.canvas.coordinate.move(dx, dy)
        this.move.set(e.detail.clientX, e.detail.clientY)
      }
    }
  }

  private onCursorUp = () => {
    if (this.canvas.mode == Mode.Hand) {
      this.isMoving = false
      this.canvas.ctx.renderer.domElement.style.cursor = 'grab'
    }
  }

  private onModeChange = (leave: Mode, enter: Mode) => {
    if (enter == Mode.Hand) {
      this.canvas.ctx.renderer.domElement.style.cursor = 'grab'
    }
  }
}
