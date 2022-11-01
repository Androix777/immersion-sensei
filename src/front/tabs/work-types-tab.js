import {createWorkTypesTable} from '../tables/work-types-table.js'
import { Settings } from '../global-settings.js';

var workTypesTable = undefined;

export async function show()
{
    var response = await window.api.getWorkTypes()
    workTypesTable = createWorkTypesTable(response, "#work-types-table", onTryAddRow, onTryDeleteRow)

    workTypesTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        var response = await window.api.changeWorkType(id, column, value);

        if(response == 0) 
        {
            Notiflix.Notify.failure('Not changed', Settings.currentSettings.notifyOptions); 
            cell.restoreOldValue();
        }
        else 
        {
            Notiflix.Notify.success('Cell changed', Settings.currentSettings.notifyOptions);
        }
    });

    async function onTryAddRow()
    {
        var response = await window.api.addWorkType();
        if(response != 0)
        {
            response = await window.api.getWorkType(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', Settings.currentSettings.notifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', Settings.currentSettings.notifyOptions);
                workTypesTable.addData([response[0]], false);
            }
        }
        else
        {
            Notiflix.Notify.failure('Not added', Settings.currentSettings.notifyOptions); 
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
                var response = await window.api.deleteWorkType(row.getData().id)
                if(response == 0) 
                {
                    Notiflix.Notify.failure('Not deleted', Settings.currentSettings.notifyOptions); 
                }
                else 
                {
                    Notiflix.Notify.success('Row deleted', Settings.currentSettings.notifyOptions);
                    row.delete();
                }
            },
            () => {},
          );
    }
}

export function hide()
{
    workTypesTable.destroy();
}