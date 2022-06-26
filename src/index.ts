import { BrowserWindow, app } from 'electron';

export default class Main 
{
    static mainWindow: Electron.BrowserWindow | null;
    static application: Electron.App;
    static BrowserWindow: any;
    private static onWindowAllClosed() 
    {
        if (process.platform !== 'darwin') 
        {
            Main.application.quit();
        }
    }


    private static onClose() 
    {
        // Dereference the window object. 
        Main.mainWindow = null;
    }


    private static onReady() 
    {
        Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 });
        Main.mainWindow!.loadURL('file://' + __dirname + '/index.html');
        Main.mainWindow!.on('closed', Main.onClose);
    }


    static main(app: Electron.App, browserWindow: typeof BrowserWindow) 
    {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}

Main.main(app, BrowserWindow);