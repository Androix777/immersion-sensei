var searchInput;
var searchButton;
var searchResponse;

export async function show()
{
    searchInput = document.getElementById('texts-search-input');
    searchButton = document.getElementById('texts-search-button');
    searchResponse = document.getElementById('texts-search-response');

    searchInput.value = '競う';

    searchButton.onclick = search;
}

export function hide()
{
    
}

async function search()
{
    searchResponse.textContent = '';
    var searchText = searchInput.value;
    var searchResults = await window.api.searchImmersionTexts(searchText);

    var range = 15;
    var subArray = searchResults.slice(0,10);

    var searchResultsTexts = [];
    for(let element in subArray)
    {
        let text = (await window.api.getImmersionText(subArray[element].id))[0].text;
        let textLength = text.length;
        let index = text.indexOf(searchText);
        let startIndex;
        let endIndex;

        if(index > range)
        {
            startIndex = index - range;
        }
        else
        {
            startIndex = 0;
        }

        if(textLength - index > range)
        {
            endIndex = index + range;
        }
        else
        {
            endIndex = textLength - 1;
        }

        var textPart = text.substring(startIndex, endIndex)

        searchResultsTexts.push(
        {
            text : textPart,
            searchTextStart : index - startIndex,
            searchTextEnd : index + searchText.length - startIndex
        });

        searchResponse.innerHTML += textPart.substring(0, index - startIndex) + '<span class = "search-result">' + textPart.substring(index - startIndex, index + searchText.length - startIndex) + '</span>' + textPart.substring(index + searchText.length - startIndex) + '<br>';
        console.log(index);
        console.log(startIndex);
        console.log(endIndex);
        console.log(searchResultsTexts);
    };
}