import * as notifyOptions from '../notiflix/notify-options.js'

var currentNotifyOptions = notifyOptions.defaultOptions;
var toCleanUp = []

export async function show()
{
    var dataDict = undefined;
    var data = undefined;
    var importableColumns = ['date', 'characters', 'time', 'work', 'tags'];
    var dataKey = {};

    var importTab = document.getElementById('import');

    var inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.onchange = () =>
    {
        parseButton.disabled = false;
    }
    importTab.appendChild(inputFile);

    var previewDiv = document.createElement('div');
    importTab.appendChild(previewDiv);

    var parseButton = document.createElement('button');
    parseButton.textContent = 'Parse';
    parseButton.disabled = true;
    parseButton.onclick = async () =>
    {
        try
        {
            data = await loadCSV(inputFile.files[0].path);
        }
        catch(exception)
        {
            console.error(exception);
            Notiflix.Notify.failure('Failed to open file', currentNotifyOptions);
            return;
        }
        
        if(data.columns.length < 2)
        {
            Notiflix.Notify.failure('Not enough columns in CSV', currentNotifyOptions);
            return;
        }

        createColumnSelects(importableColumns, data.columns)

        loadButton.disabled = false;
        parseButton.disabled = true;
    }
    importTab.appendChild(parseButton);

    var loadButton = document.createElement('button');
    loadButton.textContent = 'Load';
    loadButton.disabled = true;
    loadButton.onclick = async () =>
    {
        Array.from(document.getElementsByClassName('keySelect')).forEach((keySelect) =>
        {
            dataKey[keySelect.id] = keySelect.value;
        })
        dataKey = Object.fromEntries(Object.entries(dataKey).map(([k, v]) => [v, k]));

        try
        {
            dataDict = preprocessImportData(data, dataKey);
        }
        catch(exception)
        {
            console.error(exception);
            Notiflix.Notify.failure('Failed to load data', currentNotifyOptions);
            return;
        }

        previewDiv.innerHTML = JSON.stringify(dataDict['immersions'].slice(0, 5)).replaceAll('},{', '<br>').replaceAll('[{', '').replaceAll('}]', '');

        importButton.disabled = false;
        loadButton.disabled = true;
    }
    importTab.appendChild(loadButton);

    var importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.disabled = true;
    importButton.onclick = async () =>
    {
        await importData(dataDict);
        Notiflix.Notify.success('Import complete', currentNotifyOptions);

        importButton.disabled = true;
        loadButton.disabled = true;
        parseButton.disabled = true;
        
    }
    importTab.appendChild(importButton);

    function createColumnSelects(importableColumns, csvColumns)
    {
        importableColumns.forEach((iColumn) =>
        {
            let keyDiv = document.createElement('div');
            keyDiv.textContent = iColumn;

            let keySelect = document.createElement('select');
            keySelect.id = iColumn;
            keySelect.classList.add('keySelect');

            let ignoreOption = document.createElement('option');
            ignoreOption.value = 'ignore';
            ignoreOption.textContent = 'ignore';
            keySelect.appendChild(ignoreOption);

            csvColumns.forEach((csvColumn) =>
            {
                let csvOption = document.createElement('option');
                csvOption.value = csvColumn;
                csvOption.textContent = csvColumn;
                keySelect.appendChild(csvOption);
            })
            
            keyDiv.appendChild(keySelect);
            importTab.appendChild(keyDiv);
            toCleanUp.push(keyDiv);
        })
    }
   
    toCleanUp.push(inputFile);
    toCleanUp.push(previewDiv);
    toCleanUp.push(parseButton);
    toCleanUp.push(loadButton);
    toCleanUp.push(importButton);
}

export function hide()
{
    toCleanUp.forEach((element) =>
    {
        element.remove();
    })
}

function preprocessImportData(data, dataKey)
{
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
    })

    var works = (Array.from(new Set(data.map(immersion => immersion['work'])))).map(x => ({'title': x, 'color': autoColorRGB(x)}));

    var tags = []
    data.map(immersion =>
    {
        if(!immersion['tags']) 
        {
            return;
        }
        let curTags = immersion['tags'].split(' ');
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
        data[i]['characters'] = data[i]['characters'].replaceAll(' ','');
    }
    return {'works': works, 'tags': tags, 'immersions': data}
}

async function importData(dataDict)
{
    if(dataDict['tags'].length)
    {
        await window.api.importTags(dataDict['tags']);
    }
    if(dataDict['works'].length)
    {
        await window.api.importWorks(dataDict['works']);
    }

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
        let tags = [];
        if(dataDict['works'].length)
        {
            dataDict['immersions'][i]['work_id'] = worksDataDict[dataDict['immersions'][i]['work']];
            delete dataDict['immersions'][i]['work'];
        }
        if(dataDict['tags'].length)
        {
            tags = dataDict['immersions'][i]['tags'].split(' ').filter((tag) => tag ? true : false);
            delete dataDict['immersions'][i]['tags']
        }
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

async function loadCSV(path)
{
    return await d3.csv(path);
}