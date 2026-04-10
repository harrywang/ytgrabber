import { app, BrowserWindow, shell, dialog, utilityProcess } from 'electron'
import { createServer } from 'net'
import { existsSync } from 'fs'
import path from 'path'
import http from 'http'

const isPacked = app.isPackaged

const SERVER_DIR = isPacked
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', 'server')
  : path.join(import.meta.dirname, 'server')

const PREFERRED_PORT = 13750

let serverProcess = null
let mainWindow = null
let activePort = PREFERRED_PORT

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = createServer()
    server.listen(startPort, '127.0.0.1', () => {
      server.close(() => resolve(startPort))
    })
    server.on('error', () => resolve(findAvailablePort(startPort + 1)))
  })
}

function log(msg) {
  try {
    console.log(`[YTGrabber] ${msg}`)
  } catch {
    // Ignore EPIPE — no terminal in packaged app
  }
}

// Prevent uncaught EPIPE from crashing the app
process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE') return
  throw err
})

async function startServer() {
  const serverJs = path.join(SERVER_DIR, 'server.js')

  if (!existsSync(serverJs)) {
    throw new Error(`Server not found at ${serverJs}. Run "npm run electron:prepare" first.`)
  }

  activePort = await findAvailablePort(PREFERRED_PORT)
  if (activePort !== PREFERRED_PORT) {
    log(`Port ${PREFERRED_PORT} is in use, using ${activePort} instead`)
  }

  log(`Starting server from ${serverJs}`)

  serverProcess = utilityProcess.fork(serverJs, [], {
    cwd: SERVER_DIR,
    stdio: 'pipe',
    serviceName: 'ytgrabber-server',
    env: {
      ...process.env,
      PORT: String(activePort),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    },
  })

  serverProcess.stdout?.on('data', (d) => log(d.toString().trim()))
  serverProcess.stderr?.on('data', (d) => log(d.toString().trim()))
  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      log(`Server exited with code ${code}`)
    }
  })

  // Poll until ready
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      attempts++
      http.get(`http://127.0.0.1:${activePort}`, () => resolve()).on('error', () => {
        if (attempts >= 60) reject(new Error('Server failed to start within 30s'))
        else setTimeout(check, 500)
      })
    }
    setTimeout(check, 1000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 900,
    minWidth: 600,
    minHeight: 700,
    title: 'YT Grabber',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(`http://127.0.0.1:${activePort}`)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showSplash() {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
  })

  splash.loadURL(`data:text/html,
    <html>
    <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui;background:rgba(0,0,0,0.85);color:white;border-radius:16px;-webkit-app-region:drag;">
      <div style="text-align:center">
        <h1 style="font-size:28px;margin-bottom:8px">YT Grabber</h1>
        <p style="opacity:0.7;font-size:14px">Starting server...</p>
      </div>
    </body>
    </html>
  `)

  return splash
}

app.whenReady().then(async () => {
  const splash = showSplash()

  try {
    await startServer()
    splash.close()
    createWindow()
  } catch (err) {
    splash.close()
    log(`Startup error: ${err.message}`)
    dialog.showErrorBox('YT Grabber Startup Error', `Failed to start: ${err.message}`)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  app.quit()
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
