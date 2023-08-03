import Canvas from "./Canvas";

export default class Box {

  private canvas: Canvas

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.canvas.addEventListener('cursordown', this.onCursorDown)
  }

  onCursorDown = (e: CustomEvent) => {
    console.log('from box')
  }


}
