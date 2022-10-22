import * as notifyOptions from '../notiflix/notify-options.js'

var currentNotifyOptions = notifyOptions.defaultOptions;
var toCleanUp = []

var settingsTextarea = undefined;
var readButton = undefined;
var writeButton = undefined;

function getElements()
{
    settingsTextarea = document.getElementById('settings-textarea');
    readButton = document.getElementById('settings-read-button');
    writeButton = document.getElementById('settings-write-button');
}

export async function show()
{
    getElements();

    var settingsContent = await window.api.readSettings();
    settingsTextarea.value = settingsContent;

    readButton.onclick = async () =>
    {
        var settingsContent = await window.api.readSettings();
        settingsTextarea.value = settingsContent;
    }

    writeButton.onclick = async () =>
    {
        window.api.writeSettings(settingsTextarea.value);
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
