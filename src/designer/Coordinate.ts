import { Rectangle } from 'two.js/src/shapes/rectangle'
import Canvas from './Canvas'
import Cursor from './shapes/Cursor'
import Two from 'two.js'
import { ZUI } from 'two.js/extras/jsm/zui'
import { Vector } from 'two.js/src/vector'
import { Group } from 'two.js/src/group'
import { CellPosition } from './types'
import { cursorTo } from 'readline'

export default class Coordinate {
  private canvas: Canvas

  private _cursor: Cursor

  private bg: string

  private zui: ZUI

  private grids: Group

  private mv: Vector = new Two.Vector()

  // surface measure
  private _cellInnerWidth: number

  // surface measure
  private _cellBorder: number = 0.5

  // surface measure
  private _cellInnerHeight: number

  constructor(canvas: Canvas, fill: string = '#aaa') {
    this.canvas = canvas

    this._cellInnerWidth = canvas.cellWidth
    this._cellInnerHeight = canvas.cellHeight

    this.grids = canvas.ctx.makeGroup()
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
    const cursorCell: CellPosition = this.getCellByPostion(0, 0)
    this._cursor = Coordinate.makeCursor(
      cursorCell,
      this._cellInnerWidth,
      this._cellInnerHeight,
      fill
    )
    this.canvas.ctx.scene.add(this._cursor)
    this.bg = fill
    this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
  }

  getCellPosition(row: number, col: number): CellPosition {
    return {
      row,
      col,
      scx: (row + 0.5) * this.cellWidth,
      scy: (col + 0.5) * this.cellHeight,
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
    return this._cellInnerWidth + this._cellBorder * 2
  }

  get cellHeight() {
    return this._cellInnerHeight + this._cellBorder * 2
  }

  // get cell position by client coordinate
  getCellByPostion(x: number, y: number): CellPosition {
    let { x: sx, y: sy } = this.zui.clientToSurface(x, y)

    let col = Math.floor(sx / this.cellWidth)
    let row = Math.floor(sy / this.cellHeight)

    let scy = this.cellHeight * row + this.cellHeight / 2
    let scx = this.cellWidth * col + this.cellWidth / 2
    return { col, row, scx, scy }
  }

  // generate girds to fit current viewport
  initGrids = () => {
    if (this.grids?.children) {
      this.grids.children.splice(0, this.grids.children?.length)
    }

    let { x: sfw, y: osy } = this.zui.clientToSurface(this.canvas.ctx.width, 0)
    let { x: osx, y: sfh } = this.zui.clientToSurface(0, this.canvas.ctx.height)

    let oc = this.getCellByPostion(0, 0) // origin cell

    for (let ri = 0, hp = oc.scy + this.cellHeight / 2; hp <= sfh; ri++) {
      if (ri == 0) {
        // draw top line
        let top = this.canvas.ctx.makeLine(
          osx,
          oc.scy + this.cellHeight / 2,
          sfw,
          oc.scy + this.cellHeight / 2
        )
        top.stroke = '#dedede'
        top.linewidth = this._cellBorder
        this.grids.children.push(top)
      }
      // merged horizontal line: cell border with * 2
      let mh = this.canvas.ctx.makeLine(
        osx,
        ri * this.cellHeight + oc.scy + this.cellHeight / 2,
        sfw,
        ri * this.cellHeight + oc.scy + this.cellHeight / 2
      )

      mh.stroke = '#dedede'
      mh.linewidth = this._cellBorder * 2
      this.grids.children.push(mh)

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
        left.stroke = '#dedede'
        left.linewidth = this._cellBorder
        this.grids.children.push(left)
      }
      // merged horizontal line: cell border with * 2
      let mv = this.canvas.ctx.makeLine(
        ci * this.cellWidth + oc.scx + this.cellWidth / 2,
        osy,
        ci * this.cellWidth + oc.scx + this.cellWidth / 2,
        sfh
      )

      mv.stroke = '#dedede'
      mv.linewidth = this._cellBorder * 2
      this.grids.children.push(mv)
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

    this._cursor.cell = cell

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

  public set show(display: boolean) {
    if (this._cursor) {
      this._cursor.fill = display ? this.bg : 'transparent'
    }
  }

  hide = () => {
    this._cursor.fill = this.bg
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
