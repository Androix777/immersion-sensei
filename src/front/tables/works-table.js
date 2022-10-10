export function createWorksTable(tableData, divID, onTryAddRow = undefined, onTryDeleteRow = undefined, onTryAutoColor = undefined)
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
                editor:"input"
            }
        ],
    });

    return table;
}
