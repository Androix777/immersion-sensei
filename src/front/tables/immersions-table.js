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
            }
        ],
    });

    return table;
}

