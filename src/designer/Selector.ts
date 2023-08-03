import type Two from 'two.js'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import Cursor, { CursorDetail } from './Cursor'
import Canvas, { Mode } from './Canvas'

class Selector {
  private canvas: Canvas

  private isSelecting: boolean = false

  private cursor: Cursor

  private selectedRegion: Region | null = null

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

    if (this.isSelecting) {
      this.updateSelectedRegion(e.detail.x, e.detail.y)
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
  onCursorDown = (e: CustomEvent) => {
    if (this.canvas.mode != Mode.Selector) {
      return
    }

    this.cursor.show = false
    this.isSelecting = true
    this.createSelectedRegion(e.detail.x, e.detail.y)
  }

  // param bottom right position
  private updateSelectedRegion = (x: number, y: number) => {
    if (this.selectedRegion) {
      const { position, topleft } = this.selectedRegion
      const offsetX = x - topleft.x
      const offsetY = y - topleft.y
      position.x = topleft.x + offsetX / 2
      position.y = topleft.y + offsetY / 2
      this.selectedRegion.width = offsetX
      this.selectedRegion.height = offsetY
    }
  }

  private clearSelectedRegion = () => {
    if (this.selectedRegion) {
      this.canvas.ctx.remove(this.selectedRegion)
    }
    this.selectedRegion = null
  }

  private createSelectedRegion = (x: number, y: number) => {
    this.clearSelectedRegion()

    // then create and draw region box
    this.selectedRegion = this.createRegion(x, y, 1, 1)

    // style selected region
    this.selectedRegion.stroke = '#999'
    this.selectedRegion.dashes = [5, 2]
    this.selectedRegion.noFill()
    this.selectedRegion.linewidth = 1
    // this.ctx.update()
  }

  private createRegion = (
    x: number,
    y: number,
    width: number,
    height: number
  ): Region => {
    let centerX = x + width / 2
    let centerY = y + height / 2
    let region = this.canvas.ctx.makeRectangle(
      centerX,
      centerY,
      width,
      height
    ) as Region
    region.topleft = { x, y }
    return region
  }
}

export type Region = Rectangle & {
  topleft: { x: number; y: number }
}

export default Selector
