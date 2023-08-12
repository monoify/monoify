import Two from 'two.js'
import { Rectangle } from 'two.js/src/shapes/rectangle'
import Coordinate from './Coordinate'
import { RectTool, Selector, LineTool, TextTool, HandTool } from './tools'
import { KeyboardDetail } from './types'
import { Group } from 'two.js/src/group'
import StateManager from './StateManager'
import CellSpec from './CellSpec'

class Canvas {
  readonly ctx: Two

  cellHeight: number = 42

  cellWidth: number = 20

  readonly cellSpec: CellSpec = new CellSpec(21, 43, 0.5)

  readonly coordinate: Coordinate

  readonly selector: Selector

  readonly box: RectTool

  readonly line: LineTool

  readonly text: TextTool

  readonly addEventListener: Function

  readonly dispatchEvent: Function

  private _mode: Mode = Mode.None

  readonly el: HTMLElement

  readonly shapes: Group

  readonly grids: Group

  readonly cursor: Group

  readonly state: StateManager

  readonly hand: HandTool

  constructor(parent: HTMLElement) {
    this.el = parent

    this.ctx = new Two({
      type: Two.Types.canvas,
      fullscreen: false,
      autostart: true,
      fitted: true,
    }).appendTo(parent)

    // const { width, height } = this.el.getBoundingClientRect()
    // this.ctx.width = width
    // this.ctx.height = height
    window.addEventListener('resize', () => {
      const { width, height } = this.el.getBoundingClientRect()
      this.ctx.width = width
      this.ctx.height = height
    })

    this.grids = this.ctx.makeGroup()
    this.shapes = this.ctx.makeGroup()
    this.cursor = this.ctx.makeGroup()

    this.state = new StateManager(this, this.cellSpec)

    const { domElement: el } = this.ctx.renderer
    this.addEventListener = el.addEventListener.bind(el)
    this.dispatchEvent = el.dispatchEvent.bind(el)
    this.coordinate = new Coordinate(this, this.cellSpec)
    this.selector = new Selector(this)
    this.box = new RectTool(this)
    this.line = new LineTool(this)
    this.text = new TextTool(this)
    this.hand = new HandTool(this)

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      let event = new CustomEvent<KeyboardDetail>('canvaskeydown', {
        detail: { code: e.code, key: e.key },
      })

      el.dispatchEvent(event)
    })

  }

  get boudingClientRect() {
    return this.el.getBoundingClientRect()
  }
  set mode(mode: Mode) {
    if(this.mode != mode) {
      this.ctx.dispatchEvent('modechange', this.mode, mode)
      this._mode = mode
    }
  }

  get mode() {
    return this._mode
  }

  createRegion = (
    x: number,
    y: number,
    width: number,
    height: number
  ): Region => {
    let centerX = x + width / 2
    let centerY = y + height / 2
    let region = this.ctx.makeRectangle(
      centerX,
      centerY,
      width,
      height
    ) as Region
    region.topleft = { x, y }
    return region
  }

  // param bottom right position
  updateRegion = (region: Region, x: number, y: number) => {
    if (region) {
      const { position, topleft } = region
      const offsetX = x - topleft.x
      const offsetY = y - topleft.y
      position.x = topleft.x + offsetX / 2
      position.y = topleft.y + offsetY / 2
      region.width = offsetX
      region.height = offsetY
    }
  }
}

export enum Mode {
  None,
  Select,
  Line,
  Rect,
  Text,
  Hand,
}

export interface PointerEventHandler {
  onPointerMove(e: PointerEvent): void
  onPointerUp(e: PointerEvent): void
  onPointerDown(e: PointerEvent): void
}

export type Region = Rectangle & {
  topleft: { x: number; y: number }
}

export default Canvas
