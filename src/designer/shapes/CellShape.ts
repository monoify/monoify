import { CoordinateRange } from "../types"

export default interface CellShape {

  get selected(): boolean

  set selected(selected: boolean)

  getShapeCenter() : {x:number, y:number}

  inRange(range: CoordinateRange): boolean 

}
