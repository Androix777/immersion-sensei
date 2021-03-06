import { durationEditor, durationFormatter } from "./tabulator-custom/duration.js";
import { minMaxFilterEditor, minMaxFilterFunction } from "./tabulator-custom/minMaxFilter.js";
import { dateEditor } from "./tabulator-custom/date.js";

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
                formatter: durationFormatter,
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
    });
    return table;
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