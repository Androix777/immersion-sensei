
let form = document.querySelector("form")
let input = document.querySelector("input")
let responses = document.querySelector("#responses")

form?.addEventListener
(
    "submit", submit
)

function submit(event : SubmitEvent)
{
    event.preventDefault()
    let command = input?.value
    let responseText = window.api.getDatabase(command)
    input!.value = ""
    let response = document.createElement("div")
    response.textContent = responseText
    responses?.appendChild(response)
}