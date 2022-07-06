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
    let responseText = await window.api.getImmersions()
    let table = createTable(responseText)

    table.on("rowDeleted", (row) =>
    {
        console.log(row._row.data.id)
        window.api.deleteImmersion(row._row.data.id)
    });
}

async function submit(event)
{
    event.preventDefault()
    let command = input?.value
    let responseText = await window.api.queryDatabase(command)
    showText(responseText)
}

function showText(text)
{
    let responseText = JSON.stringify(text)
    input.value = ""
    let response = document.createElement("div")
    response.textContent = responseText
    responses?.appendChild(response)
}