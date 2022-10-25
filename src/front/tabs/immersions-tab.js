import {createImmersionsTable} from '../tables/immersions-table.js'
import * as notifyOptions from '../notiflix/notify-options.js'
import { ImmersionTextWindow } from '../modal-windows.js';

var currentNotifyOptions = notifyOptions.defaultOptions;
var immersionsTable = undefined;

export async function show()
{
    var immersionsData = await window.api.getImmersions();

    immersionsData.forEach(element => 
    {
        element["work_id"] = "" + element["work_id"];
    });

    var worksData = await window.api.getWorks();
    var worksDataDict = {};
    worksData.forEach(element => 
    {
        worksDataDict[element["id"]] = element["title"]
    });

    var tagsData = await window.api.getTags();
    var tagsDataDict = {};
    tagsData.forEach(element => 
    {
        tagsDataDict[element["id"]] = element["name"]
    });

    immersionsTable = createImmersionsTable(immersionsData, worksDataDict, tagsDataDict, "#immersions-table", onTryAddRow, onTryDeleteRow, onImmersionTextClick);

    immersionsTable.on("cellEdited", async (cell) =>
    {
        var id = cell.getData().id;
        var column = cell.getColumn().getField();
        var value = cell.getValue();

        if(column == 'tags')
        {
            var response = await window.api.deleteImmersionTagLinks(id);
            if (value.length > 0)
            {
                var response = await window.api.addImmersionTagLinks(id, value);
            }
        }
        else if(column == 'text_of_immersion_id')
        {
            return;
        }
        else
        {
            var response = await window.api.changeImmersion(id, column, value);
        }

        // response == 0 might mean "deleted 0 records" or "inserted 0 records"
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
        var response = await window.api.addImmersion();
        if(response != 0)
        {
            response = await window.api.getImmersion(response[0]);
            if(response == 0) 
            {
                Notiflix.Notify.failure('Not added', currentNotifyOptions); 
            }
            else 
            {
                Notiflix.Notify.success('Row added', currentNotifyOptions);
                immersionsTable.addData([response[0]], false);
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
                var response = await window.api.deleteImmersion(row._row.data.id)
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

    async function onImmersionTextClick(e, cell)
    {
        var immersionTextWindow = new ImmersionTextWindow()

        if(!cell.getValue())
        {
            (await immersionTextWindow.init('No immersion text for immersion ' + cell.getData().id)).show();
            immersionTextWindow.on('acceptButtonClick', async () =>
            {
                var newID = await window.api.addImmersionText(immersionTextWindow.immersionText);
                if(newID)
                {
                    var response = await window.api.changeImmersion(cell.getData().id, 'text_of_immersion_id', newID[0]);
                    if(response)
                    {
                        Notiflix.Notify.success('Immersion text added', currentNotifyOptions);
                        cell.setValue(newID);
                    }
                }
                immersionTextWindow.destroy();
            });
            immersionTextWindow.deleteButton.disabled = true;
        }
        else
        {
            (await immersionTextWindow.init((await window.api.getImmersionText(cell.getData().text_of_immersion_id))[0]['text'])).show();
            immersionTextWindow.on('acceptButtonClick', async () =>
            {
                var response = await window.api.changeImmersionText(cell.getData().text_of_immersion_id, immersionTextWindow.immersionText);
                if(response)
                {
                    Notiflix.Notify.success('Immersion text changed', currentNotifyOptions);
                }
                immersionTextWindow.destroy();
            });

            immersionTextWindow.on('deleteButtonClick', async() =>
            {
                var response = await window.api.deleteImmersionText(cell.getValue());
                if(response)
                {
                    Notiflix.Notify.success('Immersion text deleted', currentNotifyOptions);
                    cell.setValue(null);
                }
                immersionTextWindow.destroy();
            });
        }

        immersionTextWindow.on('cancelButtonClick', () =>
        {
            immersionTextWindow.destroy();
        });
    }
}

export function hide()
{
    immersionsTable.destroy();
}