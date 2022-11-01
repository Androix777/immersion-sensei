export class Settings
{
    static currentSettings;

    static defaultSettings = {
        notifyOptions:
        {
            timeout: 1000, 
            position: "right-bottom",
        }
    };

    static async changeSettings(newSettings)
    {
        Settings.currentSettings = newSettings;
        await window.api.writeSettings(JSON.stringify(Settings.currentSettings));
    }

    static async reloadSettings()
    {
        Settings.currentSettings = JSON.parse(await window.api.readSettings());
    }

    static async setDefault()
    {
        await Settings.changeSettings(Settings.defaultSettings);
    }
}

try
{
    await Settings.reloadSettings();
}
catch (e)
{
    console.error('Failed to load settings: ' + e);
    console.log('Creating default settings...');
    Settings.setDefault();
}