import {testChart} from './test.js'
import {createTable} from './tables/test-table.js'

let form = document.querySelector("form")
let input = document.querySelector("input")
let responses = document.querySelector("#responses")

testChart();
window.api.tryConnect();
showImmersions()


form.addEventListener
(
    "submit", submit
)


async function showImmersions()
{
    Notiflix.Loading.dots();

    var response = await window.api.getImmersions()
    var table = createTable(response, onTryAddRow, onTryDeleteRow)

    table.on("rowDeleted", async (row) =>
    {
        var response = await window.api.deleteImmersion(row._row.data.id)
        if(response == 0) 
        {
            Notiflix.Notify.failure('Not deleted', notifyOptions); 
        }
        else 
        {
            Notiflix.Notify.success('Row deleted', notifyOptions);
        }
    });

    table.on("cellEdited", async (cell) =>
    {
        var id = cell._cell.row.data.id;
        var column = cell._cell.column.field;
        var value = cell._cell.value;

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
            () =>
            {
                row.delete();
            },
            () => {},
          );
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