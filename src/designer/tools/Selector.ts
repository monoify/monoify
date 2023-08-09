import Coordinate, { CursorDetail } from '../Coordinate'
import Canvas, { Mode, Region } from '../Canvas'
import { Shape } from 'two.js/src/shape'
import { onKey } from '../util'

class Selector {
  private canvas: Canvas

  private isSelecting: boolean = false

  private coordinate: Coordinate

  private selectedRegion?: Region

  private selected?: Shape

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.coordinate = canvas.coordinate
    this.canvas.addEventListener('cursorup', this.onCursorUp)
    this.canvas.addEventListener('cursordown', this.onCursorDown)
    this.canvas.addEventListener('cursormove', this.onCursorMove)
    this.canvas.addEventListener(
      'canvaskeydown',
      onKey({
        Backsapce: this.removeSelected,
        Delete: this.removeSelected,
      })
    )
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

  onCursorUp = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    this.coordinate.showPointer = true
    this.isSelecting = false
    this.clearSelectedRegion()

    let { row, col } = e.detail

    this.selected = this.canvas.cellMgr.getShape(row, col)
  }
  onCursorDown = (e: CustomEvent<CursorDetail>) => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    if (e.detail.type == 'mouse' && e.detail.button != 0) {
      return
    }

    this.coordinate.showPointer = false
    this.isSelecting = true
    this.createSelectedRegion(e.detail.clientX, e.detail.clientY)
  }

  removeSelected = () => {
    // FIXME cellmgr remove

    this.selected?.remove()
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
