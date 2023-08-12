import { CellValueType } from "./StateManager"

export type KeyboardDetail = {
  key: string
  code: string
}

export type Charset = { [key in CellValueType]: string }

export type CellRange = {
  row: [number, number],
  col: [number, number]
}

export type CoordinateRange = {
  x: [number, number],
  y: [number ,number],
}
