import * as notifyOptions from '../notiflix/notify-options.js'

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

    var settingsJSON = await loadSettings();

    if(Object.keys(settingsJSON).length)
    {
        settingsTextarea.value = JSON.stringify(settingsJSON);
    }
    else
    {
        settingsTextarea.value = JSON.stringify({'notifyOptions' : notifyOptions.defaultOptions});
        settingsJSON = JSON.parse(settingsTextarea.value);
        await window.api.writeSettings(JSON.stringify(settingsJSON));
        Notiflix.Notify.success("Loaded default settings", notifyOptions.currentOptions);
    }

    setSettingsSelectors(settingsJSON);
    
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
        setSettingsSelectors(settingsJSON);
    }

    settingsSaveButton.onclick = async () =>
    {
        settingsJSON['notifyOptions']['timeout'] = +notificationTimeoutInput.value;
        settingsJSON['notifyOptions']['position'] = notificationPositionSelect.value;
        await window.api.writeSettings(JSON.stringify(settingsJSON));
        await notifyOptions.reloadNotifyOptions();
        Notiflix.Notify.success('Settings saved', notifyOptions.currentOptions);
    }

}

function setSettingsSelectors(settingsJSON)
{
    notificationTimeoutInput.value = settingsJSON['notifyOptions']['timeout'];
    notificationPositionSelect.value = settingsJSON['notifyOptions']['position'];
}

async function loadSettings()
{
    var settingsText = await window.api.readSettings();
    try
    {
        return JSON.parse(settingsText);
    }
    catch (e)
    {
        console.error('Failed to parse settings: ' + e);
        return {};
    }
}

export function hide()
{
    getElements();
    
    toCleanUp.forEach((element) =>
    {
        element.remove();
    })
}
