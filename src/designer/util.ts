import { KeyboardDetail } from './types'

export const onKey = (
  keymap: { [key: string]: Function },
  fallback?: Function
): Function => {
  return (e: CustomEvent<KeyboardDetail>) => {
    const fn = keymap[e.detail.code] || fallback
    fn && fn(e)
  }
}
