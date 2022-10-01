export function createWorksTable(tableData, divID, onTryAddRow = undefined, onTryDeleteRow = undefined)
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
                editor: "input"
            },
        ],
    });

    return table;
}
