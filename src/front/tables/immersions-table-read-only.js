import { minMaxFilterEditor, minMaxFilterFunction } from "./tabulator-custom/min-max-filter.js";
import { durationEditor, durationFormatter } from "./tabulator-custom/duration.js";
import { tagStringEditor, tagStringFormatter } from "./tabulator-custom/tag-string.js";

export function create(immersionsData, worksData, tagsData, divID)
{
    var table = new Tabulator(divID, 
    {
        layout:"fitColumns",
        data:immersionsData,
        height: 500,
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
            },
            {
                title:"Date", 
                field:"date", 
                formatter:"datetime",
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
                bottomCalc:"sum",
                bottomCalcFormatter: durationFormatter, 
            },
            {
                title:"Characters", 
                field:"characters",
                headerFilter:minMaxFilterEditor, 
                headerFilterFunc:minMaxFilterFunction, 
                headerFilterLiveFilter:false,
                bottomCalc:"sum",
            },
            {
                title:"Work", 
                field:"work_id", 
                formatter: (cell, formatterParams, onRendered) => 
                {
                    return worksData[cell.getValue()];
                },
            },
            {
                title:"Tags", 
                field:"tags",
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