export function createWorksTable(tableData, workTypesData, divID, onTryAddRow = undefined, onTryDeleteRow = undefined, onTryAutoColor = undefined)
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
        },
        {
            label:"Auto Color",
            action:function(e, row)
            {
                if(onTryAutoColor)
                {
                    onTryAutoColor(row);
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
        data:tableData,
        height: 1000,
        rowContextMenu: rowMenu,
        movableColumns:true,
        initialSort:
        [
            {column:"id", dir:"desc"},
        ],
        columns:
        [
            {
                title:"ID", 
                field:"id",
                headerContextMenu: headerIDMenu
            },
            {
                title:"Title", 
                field:"title", 
                editor:"input"
            },
            {
                title:"Color",
                field:"color",
                formatter:'color',
                editor:function(cell, onRendered, success, cancel)
                {
                    var cellValue = cell.getValue();
                    var input = document.createElement("input");
                
                    input.setAttribute("type", "color");
                    input.setAttribute("value", cellValue);

                    input.style.height = "100%";
                    input.style.width = "100%";

                    onRendered(() =>
                    {
                        input.focus();
                    });

                    function onChange()
                    {
                        if(input.value != cellValue)
                        {
                            success(input.value);
                        }
                        else
                        {
                            cancel();
                        }
                    }
                    input.addEventListener("blur", onChange);
                    input.addEventListener("keydown", (e) =>
                    {
                        if(e.keyCode == 13){
                            onChange();
                        }
                
                        if(e.keyCode == 27){
                            cancel();
                        }
                    });
                    return input;
                }
            },
            {
                title:"Type",
                field:"type_id",
                formatter: (cell, formatterParams, onRendered) => 
                {
                    return workTypesData[cell.getValue()];
                },
                editor:"list",
                editorParams:
                {
                    values: workTypesData,
                },
            }
        ],
    });

    return table;
}
