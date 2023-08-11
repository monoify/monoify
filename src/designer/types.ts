import { CellValueType } from "./StateManager"

export type KeyboardDetail = {
  key: string
  code: string
}

export type Charset = { [key in CellValueType]: string }
