import {testChart} from './test.js'
import {createImmersionsTable} from './tables/immersions-table.js'
import {createWorksTable} from './tables/works-table.js'
import {importCSV} from './import.js'
import {DateTime, Duration} from "../../node_modules/luxon/build/es6/luxon.js"

var form = document.querySelector("form")
var input = document.querySelector("input")
var responses = document.querySelector("#responses")
var tabContents = document.getElementsByClassName("tabcontent");
var immersionsTable = undefined;
var worksTable = undefined;

var notifyOptions = 
{
    timeout: 1000, 
    position: "right-bottom",
}

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

async function importCSVtoSQL()
{
    var data = await importCSV("../../user_data/import.csv");

    for (let i = 0; i < data.length; i++)
    {
        data[i]['date'] = DateTime.fromFormat(data[i]['date'], 'yyyy/MM/dd').toFormat('yyyy-MM-dd');
        let time = data[i]['time'].match(/(\d+):(\d+):(\d+)/);
        data[i]['time'] = Duration.fromObject({hours:time[1], minutes:time[2], seconds:time[3]}).toMillis() / 1000
    }

    var response = await window.api.importImmersions(data);
    console.log(response);

}

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
        document.getElementsByClassName("sidenav")[0].appendChild(tabLink);
    }
    selectTab(tabContents[0].getAttribute("id"));
}

function selectTab(id)
{
    if(document.getElementById(id).style.display == "block")
    {
        return;
    }
    
    var openTabFunDict = 
    {
        "immersions" : onImmersionsOpen,
        "works" : onWorksOpen
    };
    var closeTabFunDict = 
    {
        "immersions" : onImmersionsClose,
        "works" : onWorksClose
    };

    for (let i = 0; i < tabContents.length; i++)
    {
        if(tabContents[i].style.display == "block")
        {
            tabContents[i].style.display = "";
            if(tabContents[i].getAttribute("id") in closeTabFunDict)
            {
                closeTabFunDict[tabContents[i].getAttribute("id")]();
            }
        }
    }
    document.getElementById(id).style.display = "block";
    if(id in openTabFunDict)
    {
        openTabFunDict[id]();
    }

    function onImmersionsOpen()
    {
        showImmersions();
    }
    function onImmersionsClose()
    {
        immersionsTable.destroy();
    }
    function onWorksOpen()
    {
        showWorks();
    }
    function onWorksClose()
    {
        worksTable.destroy();
    }
}

async function showImmersions()
{
    var immersionsData = await window.api.getImmersions();
    immersionsData.forEach(element => 
        {
            element["work_id"] = "" + element["work_id"]
        })


    var worksData = await window.api.getWorks();
    var worksDataDict = {};

    worksData.forEach(element => 
    {
        worksDataDict[element["id"]] = element["title"]
    });

    immersionsTable = createImmersionsTable(immersionsData, worksDataDict, "#immersions-table", onTryAddRow, onTryDeleteRow, onImmersionTextClick);

    immersionsTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        var response = await window.api.changeImmersion(id, column, value);

        if(response == 0) 
        {
            Notiflix.Notify.failure('Not changed', notifyOptions); 
            cell.restoreOldValue();
        }
        else 
        {
            Notiflix.Notify.success('Cell changed', notifyOptions);
        }
    });

    async function onTryAddRow()
    {
        var response = await window.api.addImmersion();
        if(response != 0)
        {
            response = await window.api.getImmersion(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', notifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', notifyOptions);
                immersionsTable.addData([response[0]], false);
            }
        }
        else
        {
            Notiflix.Notify.failure('Not added', notifyOptions); 
        }
    }

    async function onTryDeleteRow(row)
    {
        Notiflix.Confirm.show(
            'Warning',
            'Delete row?',
            'Yes',
            'No',
            async () =>
            {
                var response = await window.api.deleteImmersion(row._row.data.id)
                if(response == 0) 
                {
                    Notiflix.Notify.failure('Not deleted', notifyOptions); 
                }
                else 
                {
                    Notiflix.Notify.success('Row deleted', notifyOptions);
                    row.delete();
                }
            },
            () => {},
          );
    }

    function onImmersionTextClick(e, cell)
    {
        if(cell.getValue() == false)
        {
            Notiflix.Notify.warning(`NOT IMPLEMENTED FOR No text in ${cell.getData().id}`, notifyOptions);
        }
        else
        {
            Notiflix.Notify.warning(`NOT IMPLEMENTED FOR Text in ${cell.getData().id}`, notifyOptions);
        }
    }
}

async function showWorks()
{

    var response = await window.api.getWorks()
    worksTable = createWorksTable(response, "#works-table", onTryAddRow, onTryDeleteRow)

    worksTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        var response = await window.api.changeWork(id, column, value);

        if(response == 0) 
        {
            Notiflix.Notify.failure('Not changed', notifyOptions); 
            cell.restoreOldValue();
        }
        else 
        {
            Notiflix.Notify.success('Cell changed', notifyOptions);
        }
    });

    async function onTryAddRow()
    {
        var response = await window.api.addWork();
        if(response != 0)
        {
            response = await window.api.getWork(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', notifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', notifyOptions);
                worksTable.addData([response[0]], false);
            }
        }
        else
        {
            Notiflix.Notify.failure('Not added', notifyOptions); 
        }
    }

    async function onTryDeleteRow(row)
    {
        Notiflix.Confirm.show(
            'Warning',
            'Delete row?',
            'Yes',
            'No',
            async () =>
            {
                var response = await window.api.deleteWork(row.getData().id)
                if(response == 0) 
                {
                    Notiflix.Notify.failure('Not deleted', notifyOptions); 
                }
                else 
                {
                    Notiflix.Notify.success('Row deleted', notifyOptions);
                    row.delete();
                }
            },
            () => {},
          );
    }
}

async function submit(event)
{
    event.preventDefault()
    var command = input?.value
    var response = await window.api.queryDatabase(command)
    showText(response)
}

function showText(text)
{
    var responseText = JSON.stringify(text)
    input.value = ""
    var response = document.createElement("div")
    response.textContent = responseText
    responses?.appendChild(response)
}