const { app, BrowserWindow, Menu, webContents  } = require('electron')
const path = require('path')
const env ='development'; 

if (require('electron-squirrel-startup')) app.quit();

if (env === 'development') { 
  try { 
    require('electron-reloader')(module, { 
      debug: true, 
      watchRenderer: true
    }); 
  } catch (_) { console.log('Error'); }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 550,
    icon: path.join(__dirname, '/assets/img/icons/win/icon.ico'),
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '/js/preload.js')
    }
  })

  const isMac = process.platform === 'darwin'

  const template = [
    
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)


  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  // app.allowRendererProcessReuse = false
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


