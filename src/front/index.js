import {testChart} from './test.js'

let form = document.querySelector("form")
let input = document.querySelector("input")
let responses = document.querySelector("#responses")

testChart();
window.api.tryConnect();
showImmersions(2)


form.addEventListener
(
    "submit", submit
)


async function showImmersions(count)
{
    let responseText = await window.api.getImmersions(count)
    showText(responseText)
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