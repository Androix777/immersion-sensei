import { Settings } from '../global-settings.js';

var toCleanUp = []

var settingsTextarea = undefined;
var readButton = undefined;
var writeButton = undefined;
var notificationPositionSelect = undefined;
var notificationTimeoutInput = undefined;
var settingsCancelButton = undefined;
var settingsDefaultButton = undefined;
var settingsSaveButton = undefined;

function getElements()
{
    settingsTextarea = document.getElementById('settings-textarea');
    readButton = document.getElementById('settings-read-button');
    writeButton = document.getElementById('settings-write-button');
    notificationTimeoutInput = document.getElementById('notification-timeout');
    notificationPositionSelect = document.getElementById('notification-position');
    settingsCancelButton = document.getElementById('settings-cancel-button');
    settingsDefaultButton = document.getElementById('settings-default-button');
    settingsSaveButton = document.getElementById('settings-save-button');
}

export async function show()
{
    getElements();
    
    
    settingsTextarea.value = JSON.stringify(Settings.currentSettings);
    setSettingsSelectors(Settings.currentSettings);
    
    readButton.onclick = async () =>
    {
        var settingsContent = await window.api.readSettings();
        settingsTextarea.value = settingsContent;
    }

    writeButton.onclick = async () =>
    {
        window.api.writeSettings(settingsTextarea.value);
    }

    settingsCancelButton.onclick = () =>
    {
        setSettingsSelectors(Settings.currentSettings);
    }

    settingsSaveButton.onclick = async () =>
    {
        var newSettings = Settings.currentSettings;
        newSettings['notifyOptions']['timeout'] = +notificationTimeoutInput.value;
        newSettings['notifyOptions']['position'] = notificationPositionSelect.value;
        await Settings.changeSettings(newSettings);
        Notiflix.Notify.success('Settings saved', Settings.currentSettings.notifyOptions);
    }

}

function setSettingsSelectors(settingsJSON)
{
    notificationTimeoutInput.value = settingsJSON['notifyOptions']['timeout'];
    notificationPositionSelect.value = settingsJSON['notifyOptions']['position'];
}

export function hide()
{
    getElements();
    
    toCleanUp.forEach((element) =>
    {
        element.remove();
    });
}
