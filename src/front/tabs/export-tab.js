import * as notifyOptions from '../notiflix/notify-options.js'
import { Duration } from "../../../node_modules/luxon/build/es6/luxon.js";

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
        var data = await collectExportData();
        data = arrayToCSV(data, 'path');
        saveFile('export.csv', data, 'text/csv');
        Notiflix.Notify.success('Export complete', notifyOptions.currentOptions);
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

async function collectExportData()
{
    var data = await window.api.getImmersions();
    var worksData = await window.api.getWorks();
    var tagsData = await window.api.getTags();
    
    var worksDataDict = {};
    worksData.forEach(element =>
    {
        worksDataDict[element['id']] = element['title'];   
    });

    var tagsDataDict = {};
    tagsData.forEach(element =>
    {
        tagsDataDict[element['id']] = element['name'];   
    });

    var dataKey = {'id' : 'id', 
        'time' : 'time', 
        'characters' : 'characters', 
        'date' : 'date', 
        'work_id' : 'work', 
        'text_of_immersion_id' : 'text_of_immersion',
        'tags' : 'tags'
    };

    data.forEach((immersion) =>
    {
        Object.keys(immersion).forEach((key) =>
        {
            if(dataKey[key] != key)
            {
                delete Object.assign(immersion, {[dataKey[key]]: immersion[key] })[key];
            }
        });
        delete immersion[undefined];
        immersion['work'] = worksDataDict[immersion['work']];
        delete immersion['text_of_immersion'];
        immersion['tags'] = immersion['tags'].map((tagID) => tagsDataDict[tagID]).join(' ');
        immersion['time'] = Duration.fromObject({seconds:immersion['time']}).toFormat('hh:mm:ss');
    });

    return data;
}

function saveFile(name, content, type)
{
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], {type: type}));
    link.download = name;
    link.click();
    link.remove();
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