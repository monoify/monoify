export type KeyboardDetail = {
  key: string
  code: string
}

export type CellPosition = {
  row: number
  col: number
  scx: number
  scy: number
}

export enum CellBorder {
  Empty, // ' ',
  Horizontal, // '─',
  Vertical, // '│',
  DownRight, // '┌',
  DownLeft, // '┐',
  UpRight, // '└',
  UpLeft, // '┘',
  VerticalRight, // '├',
  VerticalLeft, // '┤',
  HorizontalDown, // '┬',
  HorizontalUp, // '┴',
  VerticalHorizontal, //'┼',
}

export type Charset = { [key in CellBorder]: string }
