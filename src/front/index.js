import {test, testChart} from './test.js'

let form = document.querySelector("form")
let input = document.querySelector("input")
let responses = document.querySelector("#responses")

testChart();
window.api.connect();

form.addEventListener
(
    "submit", submit
)

function submit(event)
{
    event.preventDefault()
    let command = input?.value
    let responseText = window.api.queryDatabase(command)
    input.value = ""
    let response = document.createElement("div")
    responseText = test(responseText);
    response.textContent = responseText
    responses?.appendChild(response)
}

