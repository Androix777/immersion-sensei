import * as immersionsTab from './tabs/immersions-tab.js'
import * as worksTab from './tabs/works-tab.js'
import * as tagsTab from './tabs/tags-tab.js'
import * as chartTab from './tabs/charts-tab.js'
import * as workTypesTab from './tabs/work-types-tab.js'
import * as importTab from './tabs/import-tab.js'
import * as settingsTab from './tabs/settings-tab.js'
import * as textsSearchTab from './tabs/texts-search.js'

var tabContents = document.getElementsByClassName("tabcontent");

window.api.tryConnect();
createTabLinks();

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
        const linkWrapper = document.createElement("div");
        linkWrapper.appendChild(tabLink);
        document.getElementsByClassName("sidenav")[0].appendChild(linkWrapper);
    }
    selectTab(tabContents[0].getAttribute("id"));
}

function selectTab(id)
{
    if(document.getElementById(id).style.display == "block")
    {
        return;
    }

    var tabDict = 
    {
        "immersions" : immersionsTab,
        "works" : worksTab,
        "work-types" : workTypesTab,
        "tags" : tagsTab,
        "charts" : chartTab,
        "import" : importTab,
        "settings" : settingsTab,
        "texts-search" : textsSearchTab,
    };

    for (let i = 0; i < tabContents.length; i++)
    {
        if(tabContents[i].style.display == "block")
        {
            tabContents[i].style.display = "";
            if(tabContents[i].getAttribute("id") in tabDict && typeof tabDict[tabContents[i].getAttribute("id")].hide === "function")
            {
                tabDict[tabContents[i].getAttribute("id")].hide();
            }
        }
    }
    document.getElementById(id).style.display = "block";
    if(id in tabDict && typeof tabDict[id].show === "function")
    {
        tabDict[id].show();
    }
}

// Debug

var form = document.querySelector("form")
var input = document.querySelector("input")
var responses = document.querySelector("#responses")

form.addEventListener
(
    "submit", submit
)

async function submit(event)
{
    event.preventDefault();
    var command = input?.value;
    var response = await window.api.queryDatabase(command);
    showText(response);
}

function showText(text)
{
    var responseText = JSON.stringify(text);
    input.value = "";
    var response = document.createElement("div");
    response.textContent = responseText;
    responses?.appendChild(response);
}