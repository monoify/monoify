import Cursor, { CursorDetail } from '../Cursor'
import Canvas, { Mode, Region } from '../Canvas'

class Selector {
  private canvas: Canvas

  private isSelecting: boolean = false

  private cursor: Cursor

  private selectedRegion?: Region

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.cursor = canvas.cursor
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
  }

  onCursorMove = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    if (this.isSelecting && this.selectedRegion) {
      this.canvas.updateRegion(
        this.selectedRegion,
        e.detail.clientX,
        e.detail.clientY
      )
    }
  }
  onCursorUp = () => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    this.cursor.show = true
    this.isSelecting = false
    this.clearSelectedRegion()
  }
  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    this.cursor.show = false
    this.isSelecting = true
    this.createSelectedRegion(e.detail.clientX, e.detail.clientY)
  }

  private clearSelectedRegion = () => {
    if (this.selectedRegion) {
      this.canvas.ctx.remove(this.selectedRegion)
    }
    this.selectedRegion = undefined
  }

  private createSelectedRegion = (x: number, y: number) => {
    this.clearSelectedRegion()

    // then create and draw region box
    this.selectedRegion = this.canvas.createRegion(x, y, 1, 1)

    // style selected region
    this.selectedRegion.stroke = '#999'
    this.selectedRegion.dashes = [5, 2]
    this.selectedRegion.noFill()
    this.selectedRegion.linewidth = 1
  }
}

export default Selector
