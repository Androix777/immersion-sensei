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

//Create Date Editor
var durationEditor = function(cell, onRendered, success, cancel){
    var cellValue = convertToDuration(cell.getValue());
    var input = document.createElement("input");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;
    Inputmask({
        "mask": "9{1,2}:9{1,2}:9{1,2}",
        placeholder: " ",
        onBeforeWrite: function (event, buffer, caretPos, opts) 
        {
                if(["checkval", "_checkval"].includes(event.type)) 
            {
                return
            }
            //console.log(event, buffer, caretPos, opts);
            console.log(event.type);
            console.log(buffer);
            console.log(caretPos);
            console.log(buffer.join('').match(/(\d*):(\d*):(\d*)/));
        }
      }).mask(input);
    /*
    var durationMask = IMask(input, {
        mask: 'HH:MM:SS',
        lazy: false,  // make placeholder always visible
      
        blocks: 
        {
            HH: 
            {
                mask: IMask.MaskedRange,
                from: 0,
                to: 23,
                maxLength: 1,

            },
      
            MM: 
            {
                mask: IMask.MaskedRange,
                from: 0,
                to: 59,
                maxLength: 1,
            },
      
            SS: 
            {
                mask: IMask.MaskedRange,
                from: 0,
                to: 59,
                maxLength: 1,
            }
        }
      });
      */
    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            console.log(input.value);
            success(convertFromDuration(input.value));
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