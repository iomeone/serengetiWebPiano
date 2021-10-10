const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(__dirname, "favicon.ico")
  })
  win.loadURL('http://localhost:3000')
})
app.on('window-all-closed', () => {
    app.quit()
})