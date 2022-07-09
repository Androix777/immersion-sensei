import { Duration } from "../../../node_modules/luxon/build/es6/luxon.js";

export function createTable(tableData)
{
    var table = new Tabulator("#example-table", 
    {
        layout:"fitColumns",
        data:tableData,
        rowContextMenu: rowMenu,
        movableColumns:true,
        initialSort:
        [
            {column:"date", dir:"desc"},
        ],
        columns:
        [
            {
                title:"ID", 
                field:"id"
            },
            {
                title:"Date", 
                field:"date", 
                formatter:"datetime", 
                editor: dateEditor, 
                formatterParams:
                {
                    inputFormat:"yyyy-MM-dd",
                    outputFormat:"yyyy-MM-dd",
                    invalidPlaceholder:"(invalid date)",
                }
            },
            {
                title:"Time", 
                field:"time", 
                formatter:duration,
                editor: durationEditor, 
            },
            {
                title:"Characters", 
                field:"characters", 
                editor: "number", 
                editorParams:
                {
                    min:0
                },
                headerFilter:minMaxFilterEditor, 
                headerFilterFunc:minMaxFilterFunction, 
                headerFilterLiveFilter:false
            },
        ],
    })
    return table
}

let rowMenu = 
[
    {
        label:"<i class='fas fa-trash'></i> Delete Row",
        action:function(e, row){
            row.delete();
        }
    }
]

//Create Date Editor
var dateEditor = function(cell, onRendered, success, cancel){
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass thesuccessfully updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    var cellValue = cell.getValue();
    var input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            success(input.value);
        }else{
            cancel();
        }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            onChange();
        }

        if(e.keyCode == 27){
            cancel();
        }
    });

    return input;
};


var durationEditor = function(cell, onRendered, success, cancel)
{
    let cellValue = convertToDuration(cell.getValue());
    let input = document.createElement("input");

    let currentValueIndex = 0
    let isChanging = false

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;
    
    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    input.addEventListener("beforeinput", (event) =>
    {
        event.preventDefault();
        tryChangeValue(event.data, event.inputType)
        selectValueIndex(currentValueIndex)
    })

    input.addEventListener("focus", (event) =>
    {
        event.preventDefault();
        isChanging = false
        selectValueIndex(0)
    })

    input.addEventListener("mousedown", (event) =>
    {
        event.preventDefault();
        isChanging = false
        selectValueIndex(valueIndexByPosition(mousePositionInChars(event.layerX)))
    })

    input.addEventListener("blur", onChange);

    input.addEventListener("keydown", (event) =>
    {
        if(event.key == 'ArrowLeft')
        {
            event.preventDefault();
            isChanging = false
            selectValueIndex(currentValueIndex - 1)
        }

        if(event.key == 'ArrowRight')
        {
            event.preventDefault();
            isChanging = false
            selectValueIndex(currentValueIndex + 1)
        }

        if(event.key == 'Enter')
        {
            onChange();
        }

        if(event.key == 'Esc')
        {
            cancel();
        }
    });

    function onChange()
    {
        if(input.value != cellValue)
        {
            success(convertFromDuration(input.value));
        }
        else
        {
            cancel();
        }
    }

    function selectValueIndex(index)
    {
        let positions = getValuePositions()

        if(index < 0 || index > 2) return

        input.setSelectionRange(positions[index][0], positions[index][1])

        currentValueIndex = index
    }

    function getValuePositions()
    {
        var indexes = []
        var start = 0
        var end = 0
        var str = input.value

        var positions = []

        for(var i=0; i<str.length; i++) 
        {
            if (str[i] === ":") indexes.push(i);
        }
        
        if(indexes.length != 2)
        {
            return
        }

        for(var index = 0; index < 3; index++)
        {
            if(index == 0)
            {
                start = 0
            }
            else
            {
                start = indexes[index - 1] + 1
            }

            if(index == 2)
            {
                end = str.length
            }
            else
            {
                end = indexes[index]
            }
            positions.push([start, end])
        }
        
        return positions
    }

    function mousePositionInChars(layerX) 
    {
        var element_base_browser_styles = window.getComputedStyle(input);

        var add_char_pixal_lengths = 0

        var myStringArray = input.value.split("")
        var arrayLength = myStringArray.length;
        for (var i = 0; i <= arrayLength; i++) 
        {
            var get_char_value = getTextWidth(
                myStringArray[i],
                element_base_browser_styles.fontFamily +
                " " +
                element_base_browser_styles.fontSize
            );

            add_char_pixal_lengths =
            add_char_pixal_lengths + get_char_value + 1.311111111111;

            if (add_char_pixal_lengths > layerX) 
            {
                return i
            }
        }
        return 0

        function getTextWidth(text, font) 
        {
            // TODO: закэшировать канвас
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"))
            var context = canvas.getContext("2d")
            context.font = font
            var metrics = context.measureText(text)
            return metrics.width
        }
    }

    function valueIndexByPosition(position)
    {
        var valuesPositions = getValuePositions()
        for(let i = 0; i < 3; i++)
        {
            if(position <= valuesPositions[i][1]) return i
        }
        
    }

    function getCurrentValue()
    {
        let positions = getValuePositions()
        return parseInt(input.value.slice(positions[currentValueIndex][0], positions[currentValueIndex][1]))
    }


    function tryChangeValue(newValue, inputType)
    {
        var maxValues = [23, 59, 59]
        var newValue = parseInt(newValue)
        var currentValue = getCurrentValue()

        if(inputType != "insertText") return
        if(newValue == "undefined") return
        if(newValue < 0 || newValue > 9) return
        
        if(isChanging)
        {
            let addedValue = currentValue * 10 + newValue
            if(addedValue > maxValues[currentValueIndex])
            {
                isChanging = false
                selectValueIndex(currentValueIndex + 1)
                tryChangeValue(newValue, inputType)
            }
            else
            {
                setValue(currentValueIndex, addedValue)
                if (addedValue * 10 > maxValues[currentValueIndex])
                {
                    isChanging = false
                    selectValueIndex(currentValueIndex + 1)
                }
            }
        }
        else
        {
            // добавить проверку на меньше 9
            setValue(currentValueIndex, newValue)
            if (newValue * 10 > maxValues[currentValueIndex])
            {
                isChanging = false
                selectValueIndex(currentValueIndex + 1)
            }
            else
            {
                isChanging = true
            }
        }
    }

    function setValue(index, value)
    {
        let positions = getValuePositions()
        input.value = input.value.slice(0, positions[index][0]) + value + input.value.slice(positions[index][1])
    }

    return input
}

//custom max min header filter
var minMaxFilterEditor = function(cell, onRendered, success, cancel, editorParams){

    var end;

    var container = document.createElement("span");

    //create and style inputs
    var start = document.createElement("input");
    start.setAttribute("type", "number");
    start.setAttribute("placeholder", "Min");
    start.setAttribute("min", 0);
    start.setAttribute("max", 100);
    start.style.padding = "4px";
    start.style.width = "50%";
    start.style.boxSizing = "border-box";

    start.value = cell.getValue();

    function buildValues(){
        success({
            start:start.value,
            end:end.value,
        });
    }

    function keypress(e){
        if(e.keyCode == 13){
            buildValues();
        }

        if(e.keyCode == 27){
            cancel();
        }
    }

    end = start.cloneNode();
    end.setAttribute("placeholder", "Max");

    start.addEventListener("change", buildValues);
    start.addEventListener("blur", buildValues);
    start.addEventListener("keydown", keypress);

    end.addEventListener("change", buildValues);
    end.addEventListener("blur", buildValues);
    end.addEventListener("keydown", keypress);


    container.appendChild(start);
    container.appendChild(end);

    return container;
 }

//custom max min filter function
function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams){
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

        if(rowValue){
            if(headerValue.start != ""){
                if(headerValue.end != ""){
                    return rowValue >= headerValue.start && rowValue <= headerValue.end;
                }else{
                    return rowValue >= headerValue.start;
                }
            }else{
                if(headerValue.end != ""){
                    return rowValue <= headerValue.end;
                }
            }
        }

    return true; //must return a boolean, true if it passes the filter.
}

function duration(cell, formatterParams, onRendered)
{
    //cell - the cell component
    //formatterParams - parameters set for the column
    //onRendered - function to call when the formatter has been rendered
    
    return convertToDuration(cell.getValue()); //return the contents of the cell;
}

function convertToDuration(value)
{
    return Duration.fromObject({seconds:value}).toFormat('hh:mm:ss');
}

function convertFromDuration(value)
{
    var duration = value.match(/(\d+):(\d+):(\d+)/);
    return (Duration.fromObject({hours:duration[1], minutes:duration[2], seconds:duration[3]}).toMillis() / 1000)
}