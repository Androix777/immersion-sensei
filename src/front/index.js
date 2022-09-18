import {testChart} from './test.js'
import {createImmersionsTable} from './tables/immersions-table.js'
import {createWorksTable} from './tables/works-table.js'

var form = document.querySelector("form")
var input = document.querySelector("input")
var responses = document.querySelector("#responses")
var tabContents = document.getElementsByClassName("tabcontent");

var notifyOptions = 
{
    timeout: 1000, 
    position: "right-bottom",
}

//testChart();
window.api.tryConnect();
showImmersions();
showWorks();
createTabLinks();


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
        document.getElementsByClassName("sidenav")[0].appendChild(tabLink);
    }
    tabContents[0].style.display = "block";
}

function selectTab(id)
{
    if(document.getElementById(id).style.display == "block")
    {
        return;
    }
    
    var openTabFunDict = 
    {
        "immersions" : onImmersionsOpen
    };
    var closeTabFunDict = 
    {
        "immersions" : onImmersionsClose
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
        console.log("onimmersionsopen");
    }
    function onImmersionsClose()
    {
        console.log("onimmersionsclose");
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

    console.log(worksDataDict)

    var table = createImmersionsTable(immersionsData, worksDataDict, "#immersions-table", onTryAddRow, onTryDeleteRow, onImmersionTextClick);

    table.on("cellEdited", async (cell) =>
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
                table.addData([response[0]], false);
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
    var table = createWorksTable(response, "#works-table", onTryAddRow, onTryDeleteRow)

    table.on("cellEdited", async (cell) =>
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
                table.addData([response[0]], false);
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