import {test, testChart} from './test.js'

let form = document.querySelector("form")
let input = document.querySelector("input")
let responses = document.querySelector("#responses")

testChart();
window.api.tryConnect();

form.addEventListener
(
    "submit", submit
)

async function submit(event)
{
    event.preventDefault()
    let command = input?.value
    let responseText = await window.api.queryDatabase(command)
    responseText = JSON.stringify(responseText)
    input.value = ""
    let response = document.createElement("div")
    responseText = test(responseText)
    response.textContent = responseText
    responses?.appendChild(response)
}

