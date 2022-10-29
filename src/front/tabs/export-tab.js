import * as notifyOptions from '../notiflix/notify-options.js'

var toCleanUp = []

var exportButton = undefined;

function getElements()
{
    exportButton = document.getElementById('export-button');
}

export async function show()
{   
    getElements();

    exportButton.onclick = async () =>
    {
        var data = await window.api.getImmersions();
        data = arrayToCSV(data, 'path');
        saveFile('export.csv', data, 'text/csv');
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

function saveFile(name, content, type)
{
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], {type: type}));
    link.download = name;
    link.click();
}

function arrayToCSV(data)
{
    const header = Object.keys(data[0]);
    const csv = [
        header.join(','),
        ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');
    return csv;
}