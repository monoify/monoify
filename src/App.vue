<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import Canvas, { Mode } from '@/designer/Canvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const gitInfo = {
  commit: __GIT_COMMIT_HASH__,
  lastMod: __GIT_COMMIT_DATE__,
  message: __GIT_COMMIT_MESG__,
  branch: __GIT_COMMIT_BRANCH__,
  link:
    'https://github.com/eatgrass/text-diagram/commit/' + __GIT_COMMIT_HASH__,
}

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

const dumpText = () => {
  console.log(canvas.cellMgr.dumpText())
  alert('open the DevTools and copy the text')
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
    <span class="toolbar-item" @click="dumpText">Export</span>
  </div>
  <div ref="canvasRef" class="cvs"></div>
  <div class="release">
    <span class="git-info-title">
      This tool is currently under development
    </span>
    <a :href="gitInfo.link" target="_blank"
      ><span class="git-info-text"
        >commit: {{ gitInfo.commit }} ({{ gitInfo.branch }})</span
      ></a
    >
    <span class="git-info-text">last modfied: {{ gitInfo.lastMod }}</span>
    <span class="git-info-text">{{ gitInfo.message }}</span>
  </div>
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
  width: 550px;
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

.release {
  position: absolute;
  top: 5px;
  right: 10px;
  display: flex;
  flex-direction: column;
  z-index: 101;
  padding: 15px;
  background: #fff;
}
.release .git-info-title {
  font-weight: 700;
  font-size: 16px;
  color: red;
  margin: 10px 0;
}

.release .git-info-text {
  font-size: 13px;
  margin: 3px 0;
}
</style>
