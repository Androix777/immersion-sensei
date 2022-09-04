import {testChart} from './test.js'
import {createTable} from './tables/test-table.js'

var form = document.querySelector("form")
var input = document.querySelector("input")
var responses = document.querySelector("#responses")
var tabContents = document.getElementsByClassName("tabcontent");

//testChart();
window.api.tryConnect();
showImmersions()
createTabLinks()


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
    for (let i = 0; i < tabContents.length; i++)
    {
        tabContents[i].style.display = "none";
    }
    document.getElementById(id).style.display = "block";
}

async function showImmersions()
{
    Notiflix.Loading.dots();

    var response = await window.api.getImmersions()
    var table = createTable(response, onTryAddRow, onTryDeleteRow, onImmersionTextClick)

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

    table.on("tableBuilt", (event) =>
    {
        Notiflix.Loading.remove(1000);
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

    var notifyOptions = 
    {
        timeout: 1000, 
        position: "right-bottom",
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