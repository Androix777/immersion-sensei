export function tagStringEditor(cell, onRendered, success, cancel, editorParams)
{
    var tagsData = editorParams['tagsData'];
    var tagsDataReversed = Object.fromEntries(Object.entries(tagsData).map(([k, v]) => [v, k]));
    var cellValue = numsToTags(cell.getValue());
    var input = document.createElement("input");

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange()
    {
        if(input.value != cellValue)
        {
            success(tagsToNums(input.value));
        }
        else
        {
            cancel();
        }
    }

    function numsToTags(numList)
    {
        var tagString = '';

        numList.forEach(
            element =>
            {
                if(element in tagsData)
                {
                    tagString += tagsData[element] + ', ';
                }     
            }
        );

        if(tagString.slice(-2) == ', ')
        {
            tagString = tagString.slice(0, -2);
        }

        return tagString;
    }

    function tagsToNums(tagString)
    {
        var numList = [];
        var tagList = tagString.split(',').map(x => x.trim());
        tagList = Array.from(new Set(tagList));
        
        tagList.forEach(
            element =>
            {
                if(element in tagsDataReversed)
                {
                    numList.push(tagsDataReversed[element]);
                }
            }
        );

        return numList;
    }

    input.addEventListener("blur", onChange);

    input.addEventListener("keydown", (event) =>
    {
        if(event.key == 'Enter')
        {
            onChange();
        }

        if(event.key == 'Esc')
        {
            cancel();
        }
    });

    return input;
}

export function tagStringFormatter(cell, formatterParams, onRendered)
{
    var tagsData = formatterParams['tagsData'];
    var newValue = "";
    var cellValue = cell.getValue();

    cellValue.forEach(
        element => 
        {
            if(element in tagsData)
            {
                newValue += tagsData[element] + ", ";
            }                            
        }
    );
    
    if(newValue.slice(-2) == ', ')
    {
        newValue = newValue.slice(0, -2);
    }

    return newValue;
}