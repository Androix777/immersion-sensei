import * as immersionsTab from './tabs/immersions-tab.js'
import * as worksTab from './tabs/works-tab.js'
import * as tagsTab from './tabs/tags-tab.js'
import * as chartTab from './tabs/charts-tab.js'
import {importCSV} from './import.js'

var form = document.querySelector("form")
var input = document.querySelector("input")
var responses = document.querySelector("#responses")
var tabContents = document.getElementsByClassName("tabcontent");

window.api.tryConnect();
createTabLinks();
document.getElementById('import').addEventListener("click", () =>
{
    importCSVtoSQL();
});


form.addEventListener
(
    "submit", submit
)

function createTabLinks()
{
    for (let i = 0; i < tabContents.length; i++)
    {
        const tabLink = document.createElement("a");
        let id = tabContents[i].getAttribute("id");
        tabLink.setAttribute("class", "tablink");
        tabLink.textContent = id;
        tabLink.addEventListener("click", () =>
        {
            selectTab(id);
        });
        const linkWrapper = document.createElement("div");
        linkWrapper.appendChild(tabLink);
        document.getElementsByClassName("sidenav")[0].appendChild(linkWrapper);
    }
    selectTab(tabContents[0].getAttribute("id"));
}

function selectTab(id)
{
    if(document.getElementById(id).style.display == "block")
    {
        return;
    }

    var tabDict = 
    {
        "immersions" : immersionsTab,
        "works" : worksTab,
        "tags" : tagsTab,
        "charts" : chartTab
    };

    for (let i = 0; i < tabContents.length; i++)
    {
        if(tabContents[i].style.display == "block")
        {
            tabContents[i].style.display = "";
            if(tabContents[i].getAttribute("id") in tabDict && typeof tabDict[tabContents[i].getAttribute("id")].hide === "function")
            {
                tabDict[tabContents[i].getAttribute("id")].hide();
            }
        }
    }
    document.getElementById(id).style.display = "block";
    if(id in tabDict && typeof tabDict[id].show === "function")
    {
        tabDict[id].show();
    }
}

// Debug functions

async function importCSVtoSQL()
{
    var data = await importCSV("../../user_data/importPlus.csv");
    var works = (Array.from(new Set(data.map(immersion => immersion.work)))).map(x => ({'title': x}));
    var response = await window.api.importWorks(works);

    var worksData = await window.api.getWorks();
    var worksDataDict = {};
    worksData.forEach(element => 
    {
        worksDataDict[element["title"]] = element["id"];
    });

    for (let i = 0; i < data.length; i++)
    {
        data[i]['date'] = luxon.DateTime.fromFormat(data[i]['date'], 'yyyy/MM/dd').toFormat('yyyy-MM-dd');
        let time = data[i]['time'].match(/(\d+):(\d+):(\d+)/);
        data[i]['time'] = luxon.Duration.fromObject({hours:time[1], minutes:time[2], seconds:time[3]}).toMillis() / 1000;
        data[i]['work_id'] = worksDataDict[data[i]['work']];
        delete data[i]['work'];
        data[i]["characters"] = data[i]["characters"].replaceAll(' ','');
    }

    var response = await window.api.importImmersions(data);
    console.log(response);
}

async function submit(event)
{
    event.preventDefault();
    var command = input?.value;
    var response = await window.api.queryDatabase(command);
    showText(response);
}

function showText(text)
{
    var responseText = JSON.stringify(text);
    input.value = "";
    var response = document.createElement("div");
    response.textContent = responseText;
    responses?.appendChild(response);
}