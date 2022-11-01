import {createTagsTable} from '../tables/tags-table.js'
import { Settings } from '../global-settings.js';

var tagsTable = undefined;

export async function show()
{
    var response = await window.api.getTags()
    tagsTable = createTagsTable(response, "#tags-table", onTryAddRow, onTryDeleteRow)

    tagsTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        var response = await window.api.changeTag(id, column, value);

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
        var response = await window.api.addTag();
        if(response != 0)
        {
            response = await window.api.getTag(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', Settings.currentSettings.notifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', Settings.currentSettings.notifyOptions);
                tagsTable.addData([response[0]], false);
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
                var response = await window.api.deleteTag(row.getData().id)
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
    tagsTable.destroy();
}