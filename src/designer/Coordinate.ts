import Canvas from './Canvas'
import Cursor from './shapes/Cursor'
import Two from 'two.js'
import { ZUI } from 'two.js/extras/jsm/zui'
import { Vector } from 'two.js/src/vector'
import { CellPosition } from './types'

export default class Coordinate {
  private canvas: Canvas

  private _pointer: Cursor

  private zui: ZUI

  readonly pointerBg = 'rgba(0,0,0,0.1)'

  readonly gridColor = '#dedede'

  private mv: Vector = new Two.Vector()

  // surface measure
  cellInnerWidth: number

  // surface measure
  cellBorder: number = 0.5

  // surface measure
  cellInnerHeight: number

  constructor(canvas: Canvas) {
    this.canvas = canvas

    this.cellInnerWidth = canvas.cellWidth
    this.cellInnerHeight = canvas.cellHeight

    this.zui = new ZUI(this.canvas.ctx.scene, this.canvas.el)
    this.zui.addLimits(0.3, 4)

    this.initGrids()

    this.canvas.addEventListener('wheel', this.zoom)
    this.canvas.addEventListener('pointerup', (e: PointerEvent) =>
      this.updateCursor('cursorup', e)
    )
    this.canvas.addEventListener('pointermove', (e: PointerEvent) =>
      this.updateCursor('cursormove', e)
    )
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) =>
      this.updateCursor('cursordown', e)
    )

    this.canvas.ctx.bind('resize', this.initGrids)

    // style cursor
    const cursorCell: CellPosition = this.getCellByClientPostion(0, 0)
    this._pointer = Coordinate.makeCursor(
      cursorCell,
      this.cellInnerWidth,
      this.cellInnerHeight,
      this.pointerBg
    )
    this.canvas.grids.add(this._pointer)
    this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
  }

  getCellPosition(row: number, col: number): CellPosition {
    return {
      row,
      col,
      scx: (col + 0.5) * this.cellWidth,
      scy: (row + 0.5) * this.cellHeight,
    }
  }

  static makeCursor(
    cell: CellPosition,
    width: number,
    height: number,
    fill: string
  ): Cursor {
    return new Cursor(cell, width, height, fill)
  }

  get cellWidth() {
    return this.cellInnerWidth + this.cellBorder * 2
  }

  get cellHeight() {
    return this.cellInnerHeight + this.cellBorder * 2
  }

  // get cell position by client coordinate
  getCellByClientPostion(x: number, y: number): CellPosition {
    let { x: sx, y: sy } = this.zui.clientToSurface(x, y)

    let col = Math.floor(sx / this.cellWidth)
    let row = Math.floor(sy / this.cellHeight)

    let scy = this.cellHeight * row + this.cellHeight / 2
    let scx = this.cellWidth * col + this.cellWidth / 2
    return { col, row, scx, scy }
  }

  // generate girds to fit current viewport
  initGrids = () => {
    if (this.canvas.grids.children) {
      this.canvas.grids.children.splice(0, this.canvas.grids.children?.length)
    }

    let { x: sfw, y: osy } = this.zui.clientToSurface(this.canvas.ctx.width, 0)
    let { x: osx, y: sfh } = this.zui.clientToSurface(0, this.canvas.ctx.height)

    let oc = this.getCellByClientPostion(0, 0) // origin cell

    for (let ri = 0, hp = oc.scy + this.cellHeight / 2; hp <= sfh; ri++) {
      if (ri == 0) {
        // draw top line
        let top = this.canvas.ctx.makeLine(
          osx,
          oc.scy + this.cellHeight / 2,
          sfw,
          oc.scy + this.cellHeight / 2
        )
        top.stroke = this.gridColor
        top.linewidth = this.cellBorder
        this.canvas.grids.children.push(top)
      }
      // merged horizontal line: cell border with * 2
      let mh = this.canvas.ctx.makeLine(
        osx,
        ri * this.cellHeight + oc.scy + this.cellHeight / 2,
        sfw,
        ri * this.cellHeight + oc.scy + this.cellHeight / 2
      )

      mh.stroke = this.gridColor
      mh.linewidth = this.cellBorder * 2
      this.canvas.grids.children.push(mh)

      hp += this.cellHeight
    }

    for (let ci = 0, vp = oc.scx + this.cellWidth / 2; vp <= sfw; ci++) {
      if (ci == 0) {
        // draw top line
        let left = this.canvas.ctx.makeLine(
          oc.scx + this.cellWidth / 2,
          osy,
          oc.scx + this.cellWidth / 2,
          sfh
        )
        left.stroke = this.gridColor
        left.linewidth = this.cellBorder
        this.canvas.grids.children.push(left)
      }
      // merged horizontal line: cell border with * 2
      let mv = this.canvas.ctx.makeLine(
        ci * this.cellWidth + oc.scx + this.cellWidth / 2,
        osy,
        ci * this.cellWidth + oc.scx + this.cellWidth / 2,
        sfh
      )

      mv.stroke = this.gridColor
      mv.linewidth = this.cellBorder * 2
      this.canvas.grids.children.push(mv)
      vp += this.cellWidth
    }
  }

  zoom = (e: WheelEvent) => {
    let dy = (e.deltaY || -e.deltaY) / 1000
    this.zui.zoomBy(dy, e.clientX, e.clientY)
    this.initGrids()
  }

  updateCursor = (type: string, e: PointerEvent) => {
    let { x, y, button, pointerType: pointer } = e

    let { x: cx, y: cy } = this.zui.clientToSurface(x, y)

    let col = Math.floor(cx / this.cellWidth)
    let row = Math.floor(cy / this.cellHeight)
    let scx = (col + 0.5) * this.cellWidth
    let scy = (row + 0.5) * this.cellHeight

    let cell: CellPosition = { col, row, scx, scy }

    this._pointer.cell = cell

    this.canvas.dispatchEvent(
      new CustomEvent<CursorDetail>(type, {
        detail: {
          type: pointer,
          button,
          col,
          row,
          // FIXME x , y, scx, scy, ccx, ccy
          x: scx,
          y: scy,
          clientX: cx,
          clientY: cy,
        },
      })
    )
  }

  set showPointer(display: boolean) {
    if (this._pointer) {
      this._pointer.fill = display ? this.pointerBg : 'transparent'
    }
  }
}

// FIXME use CellPosition
export type CursorDetail = {
  type: string
  button: number
  row: number
  col: number
  x: number
  y: number
  clientX: number
  clientY: number
}
