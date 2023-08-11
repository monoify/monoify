export default class CellSpec {
  readonly width

  readonly height

  readonly border: number

  readonly innerWidth: number

  readonly innerHeight: number

  constructor(width: number, height: number, border: number) {
    this.border = border
    this.width = width
    this.height = height
    this.innerWidth = width / 2 - border
    this.innerHeight = height / 2 - border
  }
}
