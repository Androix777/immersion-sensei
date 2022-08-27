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
    var table = createTable(response, onAddRow)

    table.on("rowDeleted", (row) =>
    {
        window.api.deleteImmersion(row._row.data.id)
    });

    table.on("cellEdited", (event) =>
    {
        var id = event._cell.row.data.id;
        var column = event._cell.column.field;
        var value = event._cell.value;

        var response = window.api.changeImmersion(id, column, value);

    });

    table.on("tableBuilt", (event) =>
    {
        console.log("tableBuilt");
        Notiflix.Loading.remove(1000);
    });

    async function onAddRow()
    {
        var response = await window.api.addImmersion();
        if(response)
        {
            response = await window.api.getImmersion(response[0]);
            table.addData([response[0]], false);
        }
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