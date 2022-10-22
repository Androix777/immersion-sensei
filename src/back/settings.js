class settings
{
    static fs = require('fs');
    static async readSettings()
    {
        return new Promise(function (resolve, reject) 
        {
            settings.fs.readFile('./user_data/settings.json', 'utf-8', (error, data) =>
            {
                if(error)
                {
                    reject(error);
                }
                else
                {
                    resolve(data);
                }
            });
        });
        
    }
    static writeSettings(settingsContent)
    {
        settings.fs.writeFile('./user_data/settings.json', settingsContent, (error) =>
        {
            if(error)
            {
                console.log(error);
            }
        });
    }
}

exports.settings = settings