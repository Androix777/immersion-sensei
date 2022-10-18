import * as notifyOptions from '../notiflix/notify-options.js'
import { importCSV } from '../import.js';

var currentNotifyOptions = notifyOptions.defaultOptions;
var toCleanUp = []

export async function show()
{
    var dataDict = undefined;
    var importTab = document.getElementById('import');

    var inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.onchange = () =>
    {
        readButton.disabled = false;
    }
    importTab.appendChild(inputFile);

    var previewDiv = document.createElement('div');
    importTab.appendChild(previewDiv);
    
    var readButton = document.createElement('button');
    readButton.textContent = 'Read';
    readButton.disabled = true;
    readButton.onclick = async () =>
    {
        importButton.disabled = true;
        var data = await importCSV(inputFile.files[0].path);
        dataDict = preprocessImportData(data);
        previewDiv.innerHTML = JSON.stringify(dataDict['immersions'].slice(0, 5)).replaceAll('},{', '<br>').replaceAll('[{', '').replaceAll('}]', '');
        importButton.disabled = false;
    }
    importTab.appendChild(readButton);

    var importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.disabled = true;
    importButton.onclick = async () =>
    {
        await importData(dataDict);
        importButton.disabled = true;
        alert('Import complete');
    }
    importTab.appendChild(importButton);
   
    toCleanUp.push(inputFile);
    toCleanUp.push(previewDiv);
    toCleanUp.push(readButton);
    toCleanUp.push(importButton);
}

export function hide()
{
    toCleanUp.forEach((element) =>
    {
        element.remove();
    })
}

function preprocessImportData(data)
{
    var works = (Array.from(new Set(data.map(immersion => immersion.work)))).map(x => ({'title': x, 'color': autoColorRGB(x)}));
    var tags = []
    data.map(immersion =>
    {
        if(!immersion.tags) 
        {
            return;
        }
        let curTags = immersion.tags.split(' ');
        curTags.forEach((tag) =>
        {
            if(!(tags.includes(tag)))
            {
                tags.push(tag);
            }
        });
    });
    tags = tags.map(x => ({'name': x}));
    
    for (let i = 0; i < data.length; i++)
    {
        data[i]['date'] = luxon.DateTime.fromFormat(data[i]['date'], 'yyyy/MM/dd').toFormat('yyyy-MM-dd');
        let time = data[i]['time'].match(/(\d+):(\d+):(\d+)/);
        data[i]['time'] = luxon.Duration.fromObject({hours:time[1], minutes:time[2], seconds:time[3]}).toMillis() / 1000;
        data[i]["characters"] = data[i]["characters"].replaceAll(' ','');
    }
    return {'works': works, 'tags': tags, 'immersions': data}
}

async function importData(dataDict)
{
    await window.api.importTags(dataDict['tags']);
    await window.api.importWorks(dataDict['works']);

    var worksData = await window.api.getWorks();
    var worksDataDict = {};
    worksData.forEach(element => 
    {
        worksDataDict[element["title"]] = element["id"];
    });

    var tagsData = await window.api.getTags();
    var tagsDataDict = {};
    tagsData.forEach(element =>
    {
        tagsDataDict[element['name']] = element['id'];
    })

    for (let i = 0; i < dataDict['immersions'].length; i++)
    {
        dataDict['immersions'][i]['work_id'] = worksDataDict[dataDict['immersions'][i]['work']];
        delete dataDict['immersions'][i]['work'];
        let tags = dataDict['immersions'][i]['tags'].split(' ').filter((tag) => tag ? true : false);
        delete dataDict['immersions'][i]['tags']
        let lastInserted = await window.api.importImmersions(dataDict['immersions'][i]);
        if(tags.length && lastInserted[0])
        {
            window.api.addImmersionTagLinks(lastInserted[0], tags.map((tag) => tagsDataDict[tag]))
        }
    }
}

function autoColorRGB(name)
{
    var strHash = name.split('').reduce((acc, char) => {return char.charCodeAt(0) + ((acc << 5) - acc );}, 0);
    var color = (strHash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - color.length) + color;
}