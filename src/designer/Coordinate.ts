import Canvas from './Canvas'
import Cursor from './shapes/Cursor'
import Two from 'two.js'
import { ZUI } from 'two.js/extras/jsm/zui'
import { Vector } from 'two.js/src/vector'
import CellSpec from './CellSpec'

export default class Coordinate {
  private canvas: Canvas

  private _pointer: Cursor

  private zui: ZUI

  readonly pointerBg = 'rgba(0,0,0,0.1)'

  readonly gridColor = '#dedede'

  private mv: Vector = new Two.Vector()

  private cellSpec: CellSpec

  constructor(canvas: Canvas, cellSpec: CellSpec) {
    this.canvas = canvas
    this.cellSpec = cellSpec

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
      this.cellSpec.width,
      this.cellSpec.height,
      this.pointerBg
    )
    this.canvas.grids.add(this._pointer)
    this.canvas.ctx.renderer.domElement.style.cursor = 'crosshair'
  }

  getCellPosition(row: number, col: number): CellPosition {
    return new CellPosition(row, col, this.cellSpec)
  }

  static Measure(
    end: CellPosition,
    start: CellPosition
  ): CellVector | undefined {
    let [x1, y1] = end.center
    let [x2, y2] = start.center

    if (x1 != x2 && y1 != y2) {
      return undefined
    }
    if (x1 == x2) {
      return {
        axis: Axis.Vertical,
        length: end.row - start.row,
      }
    }

    if (y1 == y2) {
      return {
        axis: Axis.Horizontal,
        length: end.col - start.col,
      }
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

  // get cell position by client coordinate
  getCellByClientPostion(x: number, y: number): CellPosition {
    let { x: sx, y: sy } = this.zui.clientToSurface(x, y)
    let col = Math.floor(sx / this.cellSpec.width)
    let row = Math.floor(sy / this.cellSpec.height)
    return new CellPosition(row, col, this.cellSpec)
  }

  // generate girds to fit current viewport
  initGrids = () => {
    if (this.canvas.grids.children) {
      this.canvas.grids.children.splice(0, this.canvas.grids.children?.length)
    }

    let { x: sfw, y: osy } = this.zui.clientToSurface(this.canvas.ctx.width, 0)
    let { x: osx, y: sfh } = this.zui.clientToSurface(0, this.canvas.ctx.height)

    let oc = this.getCellByClientPostion(0, 0) // origin cell

    for (
      let ri = 0, hp = oc.center[1] + this.cellSpec.height / 2;
      hp <= sfh;
      ri++
    ) {
      if (ri == 0) {
        // draw top line
        let top = this.canvas.ctx.makeLine(
          osx,
          oc.center[1] + this.cellSpec.height / 2,
          sfw,
          oc.center[1] + this.cellSpec.height / 2
        )
        top.stroke = this.gridColor
        top.linewidth = this.cellSpec.border
        this.canvas.grids.children.push(top)
      }
      // merged horizontal line: cell border with * 2
      let mh = this.canvas.ctx.makeLine(
        osx,
        ri * this.cellSpec.height + oc.center[1] + this.cellSpec.height / 2,
        sfw,
        ri * this.cellSpec.height + oc.center[1] + this.cellSpec.height / 2
      )

      mh.stroke = this.gridColor
      mh.linewidth = this.cellSpec.border * 2
      this.canvas.grids.children.push(mh)

      hp += this.cellSpec.height
    }

    for (
      let ci = 0, vp = oc.center[0] + this.cellSpec.width / 2;
      vp <= sfw;
      ci++
    ) {
      if (ci == 0) {
        // draw top line
        let left = this.canvas.ctx.makeLine(
          oc.center[0] + this.cellSpec.width / 2,
          osy,
          oc.center[0] + this.cellSpec.width / 2,
          sfh
        )
        left.stroke = this.gridColor
        left.linewidth = this.cellSpec.border
        this.canvas.grids.children.push(left)
      }
      // merged horizontal line: cell border with * 2
      let mv = this.canvas.ctx.makeLine(
        ci * this.cellSpec.width + oc.center[0] + this.cellSpec.width / 2,
        osy,
        ci * this.cellSpec.width + oc.center[0] + this.cellSpec.width / 2,
        sfh
      )

      mv.stroke = this.gridColor
      mv.linewidth = this.cellSpec.border * 2
      this.canvas.grids.children.push(mv)
      vp += this.cellSpec.width
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
    let col = Math.floor(cx / this.cellSpec.width)
    let row = Math.floor(cy / this.cellSpec.height)

    let cell: CellPosition = this.getCellPosition(row, col)
    this._pointer.cell = cell

    this.canvas.dispatchEvent(
      new CustomEvent<CursorDetail>(type, {
        detail: {
          type: pointer,
          button,
          clientX: x,
          clientY: y,
          ...cell,
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
  clientX: number
  clientY: number
} & CellPosition

export class CellPosition {
  readonly row: number
  readonly col: number
  readonly center: number[]
  readonly top: number[]
  readonly bottom: number[]
  readonly left: number[]
  readonly right: number[]

  constructor(row: number, col: number, spec: CellSpec) {
    this.row = row
    this.col = col

    const centerX = (col + 0.5) * spec.width
    const centerY = (row + 0.5) * spec.height
    this.center = [centerX, centerY]
    this.top = [centerX, centerY - spec.height / 2]
    this.bottom = [centerX, centerY + spec.height / 2]
    this.left = [centerX - spec.width / 2, centerY]
    this.right = [centerX + spec.width / 2, centerY]
  }
}

export type CellVector = {
  axis: Axis
  length: number
}

export enum Axis {
  Horizontal = 1,
  Vertical = 2,
}
