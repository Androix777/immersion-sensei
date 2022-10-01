import { durationEditor, durationFormatter } from "./tabulator-custom/duration.js";
import { minMaxFilterEditor, minMaxFilterFunction } from "./tabulator-custom/minMaxFilter.js";
import { dateEditor } from "./tabulator-custom/date.js";

export function createImmersionsTable(immersionsData, worksData, tagsData, divID, onTryAddRow = undefined, onTryDeleteRow = undefined, onImmersionTextClick = undefined)
{
    var rowMenu = 
    [
        {
            label:"<i class='fas fa-trash'></i> Add Row",
            action:function(e, row)
            {
                if (onTryAddRow)
                {
                    onTryAddRow();
                }
            }
        },
        {
            label:"<i class='fas fa-trash'></i> Delete Row",
            action:function(e, row)
            {
                if (onTryDeleteRow)
                {
                    onTryDeleteRow(row);
                }
            }
        }
    ];

    var headerIDMenu = 
    [
        {
            label:"<i class='fas fa-trash'></i> Add Row",
            action:function(e, column)
            {
                if (onTryAddRow)
                {
                    onTryAddRow();
                }
            }
        },
    ];

    var table = new Tabulator(divID, 
    {
        layout:"fitColumns",
        data:immersionsData,
        height: 1000,
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
                field:"id",
                headerContextMenu: headerIDMenu,
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
                formatter: durationFormatter,
                editor: durationEditor, 
                bottomCalc:"sum",
                bottomCalcFormatter: durationFormatter, 
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
                headerFilterLiveFilter:false,
                bottomCalc:"sum",
            },
            {
                title:"Text", 
                field:"text_of_immersion", 
                formatter:"tickCross",
                width:100,
                mutator:function(value, data) 
                {
                    return data.text_of_immersion_id != null;
                },
                cellClick: onImmersionTextClick,
            },
            {
                title:"Work", 
                field:"work_id", 
                formatter: (cell, formatterParams, onRendered) => 
                {
                    return worksData[cell.getValue()];
                },
                editor:"list",
                editorParams:
                {
                    values: worksData,
                },
            },
            {
                title:"Tags", 
                field:"tags",
                editor: function(cell, onRendered, success, cancel)
                {
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
                },
                formatter:(cell, formatterParams, onRendered) =>
                {
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
            }
        ],
    });

    return table;
}

