import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "node:path";
import { execSync } from 'node:child_process';


const commitDate = execSync('git log -1 --format=%cI').toString().trimEnd();
const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trimEnd();
const commitHash = execSync('git rev-parse --short HEAD').toString().trimEnd();
const commitMesg = execSync('git show -s --format=%s').toString().trimEnd();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
    __GIT_COMMIT_DATE__: JSON.stringify(commitDate),
    __GIT_COMMIT_MESG__: JSON.stringify(commitMesg),
    __GIT_COMMIT_BRANCH__: JSON.stringify(branchName)
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
