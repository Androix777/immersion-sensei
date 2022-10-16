import { durationEditor, durationFormatter } from "./tabulator-custom/duration.js";
import { tagStringEditor, tagStringFormatter } from "./tabulator-custom/tag-string.js";
import { minMaxFilterEditor, minMaxFilterFunction } from "./tabulator-custom/min-max-filter.js";
import { tickCrossCustomFormatter } from "./tabulator-custom/tick-cross-custom.js";
import { dateEditor } from "./tabulator-custom/date.js";

export function createImmersionsTable(immersionsData, worksData, tagsData, divID, onTryAddRow = undefined, onTryDeleteRow = undefined, onImmersionTextClick = undefined)
{
    var rowMenu = 
    [
        {
            label:"Add Row",
            action:function(e, row)
            {
                if (onTryAddRow)
                {
                    onTryAddRow();
                }
            }
        },
        {
            label:"Delete Row",
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
            label:"Add Row",
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
                title:"Speed", 
                field:"speed", 
                mutator:function(value, data) 
                {
                    return (data.characters / (data.time/3600)).toFixed(0);
                },
            },
            {
                title:"Text", 
                field:"text_of_immersion_id",
                formatter: tickCrossCustomFormatter,
                formatterParams: 
                {
                    func: (value) => { return value != null; }
                },
                width: 100,
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
                editor: tagStringEditor,
                editorParams:
                {
                    tagsData: tagsData
                },
                formatter: tagStringFormatter,
                formatterParams:
                {
                    tagsData: tagsData
                }

            }
        ],
    });

    return table;
}