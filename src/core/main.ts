import { BrowserWindow, app } from 'electron';

declare global
{
    interface Window 
    {
        api: any;
    }
}

export default class Main 
{
    static mainWindow: Electron.BrowserWindow | null;
    static application: Electron.App;
    static BrowserWindow: any;

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) 
    {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
    
    private static onWindowAllClosed() 
    {
        if (process.platform !== 'darwin') 
        {
            Main.application.quit();
        }
    }


    private static onReady() 
    {
        Main.mainWindow = new Main.BrowserWindow
        (
            { 
                webPreferences: 
                {
                    preload: `${__dirname}/preload.js`,
                }
            }
        );
        Main.mainWindow!.loadURL('file://' + __dirname + '/../front/index.html');
        Main.mainWindow!.on('closed', Main.onClose);
    }

    private static onClose() 
    {
        // Dereference the window object. 
        Main.mainWindow = null;
    }
}


Main.main(app, BrowserWindow);