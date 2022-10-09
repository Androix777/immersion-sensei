import {createImmersionsTable} from '../tables/immersions-table.js'
import * as notifyOptions from '../notiflix/notify-options.js'

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

    function onImmersionTextClick(e, cell)
    {
        if(cell.getValue() == false)
        {
            Notiflix.Notify.warning(`NOT IMPLEMENTED FOR No text in ${cell.getData().id}`, currentNotifyOptions);
        }
        else
        {
            Notiflix.Notify.warning(`NOT IMPLEMENTED FOR Text in ${cell.getData().id}`, currentNotifyOptions);
        }
    }
}

export function hide()
{
    immersionsTable.destroy();
}