<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Canvas, { Mode } from './designer/Canvas'
const gitInfo = {
  commit: __GIT_COMMIT_HASH__,
  lastMod: __GIT_COMMIT_DATE__,
  message: __GIT_COMMIT_MESG__,
  branch: __GIT_COMMIT_BRANCH__,
  link: 'https://github.com/monoify/monoify/commit/' + __GIT_COMMIT_HASH__,
}

let editor = ref<HTMLElement | null>(null)
let canvas: Canvas
const show = ref<boolean>(false)
const mode = ref<Mode>(Mode.Line)
const text = reactive<any>({
  content: '',
  row: 24,
  col: 80,
})

onMounted(() => {
  if (editor.value) {
    canvas = new Canvas(editor.value)
  }
})

const setMode = (_mode: Mode) => {
  mode.value = _mode
  canvas.mode = _mode
}

const exportText = () => {
  let dump = canvas.state.renderText()
  text.row = Math.max(dump.row, 30)
  text.col = Math.max(dump.col, 80)
  text.content = dump.text
  show.value = true
}
</script>
<template>
  <header class="m-nav">
    <div class="m-brand">
      <span class="m-brand-name">Monoify</span>
    </div>
    <div class="m-menu-bar"></div>
  </header>
  <div class="m-workspace">
    <div class="m-toolbox">
      <div class="m-toolbox-section">
        <div
          class="m-tool-item"
          @click="setMode(Mode.Text)"
          :class="{ active: mode == Mode.Text }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-1.8l18-48H303.8l18 48H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H390.2L254 52.8zM279.8 304H168.2L224 155.1 279.8 304z" />
          </svg>
        </div>
        <div
          class="m-tool-item"
          @click="setMode(Mode.Line)"
          :class="{ active: mode == Mode.Line }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 640 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M5.1 9.2C13.3-1.2 28.4-3.1 38.8 5.1l592 464c10.4 8.2 12.3 23.3 4.1 33.7s-23.3 12.3-33.7 4.1L9.2 42.9C-1.2 34.7-3.1 19.6 5.1 9.2z" />
          </svg>
        </div>
        <div
          class="m-tool-item"
          @click="setMode(Mode.Rect)"
          :class="{ active: mode == Mode.Rect }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M464 48V464H48V48H464zM48 0H0V48 464v48H48 464h48V464 48 0H464 48z" />
          </svg>
        </div>

        <div class="m-tool-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128h95.1l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H347.1L325.8 320H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H315.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7H155.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l21.3-128H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320h95.1l21.3-128H187.1z" />
          </svg>
        </div>
        <div
          class="m-tool-item"
          @click="setMode(Mode.Hand)"
          :class="{ active: mode == Mode.Hand }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M256 0c-25.3 0-47.2 14.7-57.6 36c-7-2.6-14.5-4-22.4-4c-35.3 0-64 28.7-64 64V261.5l-2.7-2.7c-25-25-65.5-25-90.5 0s-25 65.5 0 90.5L106.5 437c48 48 113.1 75 181 75H296h8c1.5 0 3-.1 4.5-.4c91.7-6.2 165-79.4 171.1-171.1c.3-1.5 .4-3 .4-4.5V160c0-35.3-28.7-64-64-64c-5.5 0-10.9 .7-16 2V96c0-35.3-28.7-64-64-64c-7.9 0-15.4 1.4-22.4 4C303.2 14.7 281.3 0 256 0zM240 96.1c0 0 0-.1 0-.1V64c0-8.8 7.2-16 16-16s16 7.2 16 16V95.9c0 0 0 .1 0 .1V232c0 13.3 10.7 24 24 24s24-10.7 24-24V96c0 0 0 0 0-.1c0-8.8 7.2-16 16-16s16 7.2 16 16v55.9c0 0 0 .1 0 .1v80c0 13.3 10.7 24 24 24s24-10.7 24-24V160.1c0 0 0-.1 0-.1c0-8.8 7.2-16 16-16s16 7.2 16 16V332.9c-.1 .6-.1 1.3-.2 1.9c-3.4 69.7-59.3 125.6-129 129c-.6 0-1.3 .1-1.9 .2H296h-8.5c-55.2 0-108.1-21.9-147.1-60.9L52.7 315.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L119 336.4c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2V96c0-8.8 7.2-16 16-16c8.8 0 16 7.1 16 15.9V232c0 13.3 10.7 24 24 24s24-10.7 24-24V96.1z" />
          </svg>
        </div>
        <div
          class="m-tool-item"
          @click="setMode(Mode.Select)"
          :class="{ active: mode == Mode.Select }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M368 80h32v32H368V80zM352 32c-17.7 0-32 14.3-32 32H128c0-17.7-14.3-32-32-32H32C14.3 32 0 46.3 0 64v64c0 17.7 14.3 32 32 32V352c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32H320c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V384c0-17.7-14.3-32-32-32V160c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H352zM96 160c17.7 0 32-14.3 32-32H320c0 17.7 14.3 32 32 32V352c-17.7 0-32 14.3-32 32H128c0-17.7-14.3-32-32-32V160zM48 400H80v32H48V400zm320 32V400h32v32H368zM48 112V80H80v32H48z" />
          </svg>
        </div>

        <hr />
        <div class="m-tool-item" @click="exportText">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 576 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M400 255.4V240 208c0-8.8-7.2-16-16-16H352 336 289.5c-50.9 0-93.9 33.5-108.3 79.6c-3.3-9.4-5.2-19.8-5.2-31.6c0-61.9 50.1-112 112-112h48 16 32c8.8 0 16-7.2 16-16V80 64.6L506 160 400 255.4zM336 240h16v48c0 17.7 14.3 32 32 32h3.7c7.9 0 15.5-2.9 21.4-8.2l139-125.1c7.6-6.8 11.9-16.5 11.9-26.7s-4.3-19.9-11.9-26.7L409.9 8.9C403.5 3.2 395.3 0 386.7 0C367.5 0 352 15.5 352 34.7V80H336 304 288c-88.4 0-160 71.6-160 160c0 60.4 34.6 99.1 63.9 120.9c5.9 4.4 11.5 8.1 16.7 11.2c4.4 2.7 8.5 4.9 11.9 6.6c3.4 1.7 6.2 3 8.2 3.9c2.2 1 4.6 1.4 7.1 1.4h2.5c9.8 0 17.8-8 17.8-17.8c0-7.8-5.3-14.7-11.6-19.5l0 0c-.4-.3-.7-.5-1.1-.8c-1.7-1.1-3.4-2.5-5-4.1c-.8-.8-1.7-1.6-2.5-2.6s-1.6-1.9-2.4-2.9c-1.8-2.5-3.5-5.3-5-8.5c-2.6-6-4.3-13.3-4.3-22.4c0-36.1 29.3-65.5 65.5-65.5H304h32zM72 32C32.2 32 0 64.2 0 104V440c0 39.8 32.2 72 72 72H408c39.8 0 72-32.2 72-72V376c0-13.3-10.7-24-24-24s-24 10.7-24 24v64c0 13.3-10.7 24-24 24H72c-13.3 0-24-10.7-24-24V104c0-13.3 10.7-24 24-24h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H72z" />
          </svg>
        </div>
      </div>
      <div class="m-toobox-section">
        <hr />
        <div class="m-tool-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
          </svg>
        </div>
      </div>
    </div>
    <div class="m-editro-wrapper">
      <div class="m-editor" ref="editor"></div>
    </div>
  </div>
  <div class="release">
    <span class="git-info-title"> Monoify is under development</span>
    <a :href="gitInfo.link" target="_blank"
      ><span class="git-info-text"
        >commit: {{ gitInfo.commit }} ({{ gitInfo.branch }})</span
      ></a
    >
    <span class="git-info-text">last modfied: {{ gitInfo.lastMod }}</span>
    <span class="git-info-text">{{ gitInfo.message }}</span>
  </div>
  <div class="text-dialog" v-if="show">
    <span
      @click="show = false"
      style="
        position: absolute;
        right: 10px;
        top: 7px;
        font-size: 20px;
        cursor: pointer;
      "
      >×</span
    >
    <div style="padding-top: 30px; padding-left: 10px; padding-right: 10px">
      <pre><code>{{ text.content }}</code></pre>
    </div>
  </div>
</template>

<style>
.m-nav {
  width: 100%;
  height: 60px;
  display: flex;
  border-bottom: 1px solid #dedede;
}

.m-menu-bar {
  width: 100%;
  height: 20px;
  align-self: flex-end;
}

.m-brand {
  padding-left: 1.5rem;
  display: flex;
  align-items: center;
}

.m-workspace {
  display: flex;
  flex: 1;
}

.m-toolbox {
  min-width: 60px;
  max-width: 60px;
  border-right: 1px solid #dedede;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.m-tool-item {
  padding: 10px;
  cursor: pointer;
  text-align: center;
}

.m-brand-name {
  font-size: 2.7rem;
}
.m-editro-wrapper {
  flex: 1;
}
.m-editor {
  width: 100%;
  height: 100%;
}

.m-tool-item svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  fill: #36454f;
}

.m-toolbox hr {
  margin: 0;
  border-top: 0.1rem solid #dddddd;
}

.m-tool-item:hover {
  background-color: #e9e9e9;
}

.m-tool-item.active {
  background-color: #dae9f5;
}

.release {
  position: absolute;
  top: 5px;
  right: 10px;
  display: flex;
  flex-direction: column;
  z-index: 101;
  padding: 8px;
  background: #fff;
  box-shadow: 1px 1px 3px 0px rgb(161, 159, 157);
}
.release .git-info-title {
  font-weight: 700;
  font-size: 16px;
  color: #ee3280;
  margin: 10px 0;
}

.release .git-info-text {
  font-size: 13px;
  margin: 3px 0;
}

.text-dialog {
  position: absolute;
  z-index: 105;
  background: #fff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'monospace';
  box-shadow: 6px -3px 11px 2px #dedede;
}

.text-dialog pre {
  border-left: none;
  font-family: 'FiraMono';
  margin-bottom: 10px;
  overflow: auto;
  width: auto;
  padding: 5px;
  background-color: #eee;
}

.text-dialog pre code {
  font-family: 'FiraMono';
  line-height: 1;
  background: none;
  min-width: 260px;
  min-height: 120px;
}
</style>
