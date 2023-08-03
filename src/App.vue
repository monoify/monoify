<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Canvas, { Mode } from '@/designer/Canvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let canvas: Canvas
let state = reactive<any>({
  mode: Mode.Selector,
})

onMounted(() => {
  canvas = new Canvas(document.body)
})

const switchMode = (mode: Mode) => {
  state.mode = mode
  canvas.mode = mode
}
</script>

<template>
  <div class="toolbar">
    <span
      class="toolbar-item"
      @click="switchMode(Mode.Selector)"
      :class="{ active: state.mode == Mode.Selector }"
      >Selector</span
    >
    <span
      class="toolbar-item"
      @click="switchMode(Mode.Box)"
      :class="{ active: state.mode == Mode.Box }"
      >Rectangle</span
    >
    <span
      class="toolbar-item"
      @click="switchMode(Mode.Line)"
      :class="{ active: state.mode == Mode.Line }"
      >Line</span
    >
    <span
      class="toolbar-item"
      @click="switchMode(Mode.Text)"
      :class="{ active: state.mode == Mode.Text }"
      >Text</span
    >
    <span class="toolbar-item">Clear</span>
  </div>
  <div ref="canvasRef" class="cvs"></div>
</template>

<style scoped>
.toolbar {
  position: absolute;
  top: 25px;
  left: 25px;
  display: flex;
  background-color: #fff;
  box-shadow: 2px 2px 9px 0px #212020d6;
  padding: 20px;
  width: 450px;
  z-index: 100;
}

.toolbar-item {
  border: solid 1px black;
  cursor: pointer;
  padding: 3px 10px;
  margin: 7px;
}

.active {
  background-color: green;
  font-weight: 700;
}
</style>
