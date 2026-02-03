import { ipcRenderer, contextBridge } from 'electron'
// import { resolve } from 'path'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const envData = process.env
  const dataRootDir = envData.LMD_DATA_ROOT
  const lmdLogsDir = envData.LMD_LOGS_DIR
  const lmdAppStoryDir = envData.LMD_APP_STORY_DIR
  const className = `loaders-css__square-spin`
  const styleContent = `

.${className} .logo{
width: 100px;height: 100px;border: 0px;
background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjU2cHgiIGhlaWdodD0iMjU2cHgiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPmxtZC1sb2dvQDJ4PC90aXRsZT4KICAgIDxnIGlkPSJsbWQtbG9nbyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbCIgZmlsbD0iI0ZCNkMwMCIgY3g9IjEyOCIgY3k9IjEyOCIgcj0iMTI4Ij48L2NpcmNsZT4KICAgICAgICA8cGF0aCBkPSJNMTcyLjExMjk5NSw0My44Njk4NDgyIEwxNzguNjA4NDY5LDY0LjY0Nzg0ODIgTDE4OS44MjI0NjksMTAwLjUxMTg0OCBMMTg5LjkxNzU3LDEwMC41MTE5MzEgTDE4OS45MTc0NjksMTAwLjgxNjg0OCBMMTk1LjY3MDQ2OSwxMTkuMjE3MzkxIEwyMzAuNDU1NTMxLDExOS4yMTgzNDYgTDEyOCwyMTkuMzQ5MjQxIEwyNS41NDQ0Njg1LDExOS4yMTgzNDYgTDYwLjMxOTQ2ODUsMTE5LjIxNzM5MSBMNzguMDA2OTE0NSw2Mi42NDQzOTA5IEw3OC4wODY0Njg1LDYyLjc5NDg0ODIgTDg0LjAwNDMxMTQsNDMuODY5ODQ4MiBMMTE0LjA4OTQ2OSwxMDAuNTExODQ4IEwxNDIuMDI2NDY5LDEwMC41MTE4NDggTDE3Mi4xMTI5OTUsNDMuODY5ODQ4MiBaIE0xNTcuNzA5MzI4LDEzOS45MzkyNjIgTDk4Ljg0NTk4NywxMzkuOTM5MjYyIEwxMjguMjc3NjU3LDE3MS41OTIxOTEgTDE1Ny43MDkzMjgsMTM5LjkzOTI2MiBaIiBpZD0iQ29tYmluZWQtU2hhcGUiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+');
background-position: center center;background-size:contain;
}
.app-loading-wrap {
display: flex;
flex-direction: column;
position: fixed;
left: 0;
top: 0;
z-index: 9;
width: 100vw;
height: 100vh;
justify-content:center;
background-color:#FFF;
app-region: drag;
}
.app-loading-wrap .logo-and-name {
display: flex;
align-items: center;
justify-content: center;
font-family: Helvetica, Inter, system-ui, Avenir, Arial, sans-serif;
line-height: 1.5;
font-weight: 400;
color: rgba(255, 255, 255, 0.87);
app-region: none;
}
.lmd-title{font-size:30px;color: #333; margin: 0}
.progress-container{
width: 220px;height: 12px;
background-color: #e0e0e0;
border-radius: 6px;
overflow: hidden;
margin: 4px auto;
}
.progress-bar{height: 100%;width: 0;background-color: #FA6400;border-radius: 6px;transition: width 0.3s ease-in-out;}
.dir-link{font-size:12px;color: #AAA; text-decoration: underline; cursor: pointer;}
#progress-value{font-size:12px;color: #AAA; flex:1;}
#error-container{border: #FA6400 1px solid; border-radius: 8px; width: 510px; padding:5px; margin: 20px auto 0 auto; app-region: none;}
#error-title{padding: 4px; font-weight: bold; font-size: 14px; }
#error-content{padding: 4px; color: #777; font-size: 12px; overflow: auto; margin: 0; min-height: 100px; max-height: 300px; }
#clear-restart-btn{color: #00ba3e; cursor:pointer; font-size: 12px; text-decoration: underline;}
#copy-btn{color: #FA6400; cursor:pointer; font-size: 12px; text-decoration: underline;}
`
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'

  return {
    changeProgress(val) {
      const progressBar = document.getElementById('progressBar');
      console.log('changeProgress', val)
      if(progressBar){
        progressBar.style.width = val+'%';
        const progressValueEl = document.getElementById('progress-value')
        if(progressValueEl) {
          progressValueEl.innerText = val+'%';
        }
      }
    },
    appendErrorInfo(errorInfo: string) {
      const errorContainer = document.getElementById('error-container')
      if(errorContainer?.style) {
        errorContainer.style.display = 'block'
      }
      const errorContent = document.getElementById('error-content')
      errorContent?.appendChild(document.createTextNode(errorInfo+"\n"))

    },
    appendLoading(showProgress) {
      const progressStr = !showProgress ? '' :
`<div class="progress-container">
<div id="progressBar" class="progress-bar"></div>
</div>`

      oDiv.innerHTML =
`<div class="logo-and-name">
  <div class="${className}"><div class="logo"></div></div>
  <div id="lmd-name-container" style="padding-left: 20px">
    <h2 class="lmd-title">LM Downloader</h2>
    ${progressStr}
    <div style="display: flex; padding:0 4px; gap: 4px">
      <div id="progress-value">0%</div>
      <div class="dir-link" onclick="ipcRenderer.invoke('open-path', '${dataRootDir}')">Data &gt;</div>&nbsp;&nbsp;
      <div class="dir-link" onclick="ipcRenderer.invoke('open-path', '${lmdLogsDir}')">Logs &gt;</div>
    </div>
  </div>
</div>
<div id="error-container" style="display:none;">
<div id="error-title">
<span>错误 Error</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<span id="copy-btn" onclick="const text = document.getElementById('error-content').innerText;const textarea = document.createElement('textarea'); textarea.value = text;textarea.style.position = 'fixed';document.body.appendChild(textarea);textarea.select();document.execCommand('copy');document.body.removeChild(textarea);">复制 Copy</span>&nbsp;&nbsp;
<span id="clear-restart-btn" onclick="ipcRenderer.invoke('clear-restart-app', '${lmdAppStoryDir}')">修复并重启 Fix & Restart</span>
</div>
<pre id="error-content"></pre>
</div>
`
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading, changeProgress, appendErrorInfo } = useLoading()
domReady().then(()=>{
    ipcRenderer.invoke('get-lmd-preload-progress').then(value => {
      appendLoading(true)
      changeProgress(value)
      ipcRenderer.on('preload-progress', (event, progress) => {
        changeProgress(progress)
      })
      ipcRenderer.on('preload-error-info', (event, errorInfo) => {
        appendErrorInfo(errorInfo)
      })
    }).catch(()=>{
      appendLoading(false)
    })
})

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}
