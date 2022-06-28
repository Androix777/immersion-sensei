const { BrowserWindow, app } = require('electron');

class Main 
{
    static mainWindow;
    static application;
    static BrowserWindow;

    static main(app, browserWindow) 
    {
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
    
    static onWindowAllClosed() 
    {
        if (process.platform !== 'darwin') 
        {
            Main.application.quit();
        }
    }


    static onReady() 
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
        Main.mainWindow.loadURL('file://' + __dirname + '/../front/index.html');
        Main.mainWindow.on('closed', Main.onClose);
    }

    static onClose() 
    {
        // Dereference the window object. 
        Main.mainWindow = null;
    }
}


Main.main(app, BrowserWindow);