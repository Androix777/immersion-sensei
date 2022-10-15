import {createWorksTable} from '../tables/works-table.js'
import * as notifyOptions from '../notiflix/notify-options.js'

var currentNotifyOptions = notifyOptions.defaultOptions;
var worksTable = undefined;

export async function show()
{
    var worksData = await window.api.getWorks()
    worksData.forEach(element => 
    {
        element["type_id"] = "" + element["type_id"];
    });

    var workTypesData = await window.api.getWorkTypes()
    var workTypesDataDict = {};
    workTypesData.forEach(element => 
    {
        workTypesDataDict[element["id"]] = element["name"]
    });
    workTypesDataDict[null] = "No type";

    worksTable = createWorksTable(worksData, workTypesDataDict, "#works-table", onTryAddRow, onTryDeleteRow, onTryAutoColor)

    worksTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        if(column == "type_id")
        {
            value = (value == "null" || value == "" ? null : value)
        }

        var response = await window.api.changeWork(id, column, value);

        if(response == 0) 
        {
            Notiflix.Notify.failure('Not changed', currentNotifyOptions); 
            cell.restoreOldValue();
        }
        else 
        {
            Notiflix.Notify.success('Cell changed', currentNotifyOptions);
        }
    });

    async function onTryAddRow()
    {
        var response = await window.api.addWork();
        if(response != 0)
        {
            response = await window.api.getWork(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', currentNotifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', currentNotifyOptions);
                worksTable.addData([response[0]], false);
            }
        }
        else
        {
            Notiflix.Notify.failure('Not added', currentNotifyOptions); 
        }
    }

    async function onTryDeleteRow(row)
    {
        Notiflix.Confirm.show(
            'Warning',
            'Delete row?',
            'Yes',
            'No',
            async () =>
            {
                var response = await window.api.deleteWork(row.getData().id)
                if(response == 0) 
                {
                    Notiflix.Notify.failure('Not deleted', currentNotifyOptions); 
                }
                else 
                {
                    Notiflix.Notify.success('Row deleted', currentNotifyOptions);
                    row.delete();
                }
            },
            () => {},
          );
    }

    async function onTryAutoColor(row)
    {
        var newColor = autoColorRGB(row.getData().title);
        var response = await window.api.changeWork(row.getData().id, 'color', newColor);
        if(response != 0)
        {
            Notiflix.Notify.success('Set auto color', currentNotifyOptions);
            var rowData = row.getData();
            rowData.color = newColor;
            worksTable.updateRow(row, rowData);
        }
        else
        {
            Notiflix.Notify.failure('Failed to set auto color', currentNotifyOptions); 
        }
    }

    function autoColorRGB(name)
    {
        var strHash = name.split('').reduce((acc, char) => {return char.charCodeAt(0) + ((acc << 5) - acc );}, 0);
        var color = (strHash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - color.length) + color;
    }

    function autoColorHSL(name)
    {
        var strHash = name.split('').reduce((acc, char) => {return char.charCodeAt(0) + ((acc << 5) - acc );}, 0);
        var color = Math.abs(strHash % 360);
        return 'hsl(' + color + ', 80%, 40%)';
    }
}

export function hide()
{
    worksTable.destroy();
}