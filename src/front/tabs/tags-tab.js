import {createTagsTable} from '../tables/tags-table.js'
import * as notifyOptions from '../notiflix/notify-options.js'

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
            Notiflix.Notify.failure('Not changed', notifyOptions.currentOptions); 
            cell.restoreOldValue();
        }
        else 
        {
            Notiflix.Notify.success('Cell changed', notifyOptions.currentOptions);
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
                Notiflix.Notify.failure('Not added', notifyOptions.currentOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', notifyOptions.currentOptions);
                tagsTable.addData([response[0]], false);
            }
        }
        else
        {
            Notiflix.Notify.failure('Not added', notifyOptions.currentOptions); 
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
                    Notiflix.Notify.failure('Not deleted', notifyOptions.currentOptions); 
                }
                else 
                {
                    Notiflix.Notify.success('Row deleted', notifyOptions.currentOptions);
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