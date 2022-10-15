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

    async function onImmersionTextClick(e, cell)
    {
        var modalBackground = document.getElementById('modal-background');
        modalBackground.style.display = 'block';
        
        var textField = document.createElement('textarea');
        textField.style.height = '95%';
        textField.style.width = '100%';
        var cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';

        var modalContent = document.getElementById('modal-content');
        modalContent.style.height = '75%';
        modalContent.appendChild(textField);
        modalContent.appendChild(cancelButton);
        if(cell.getValue() == false)
        {
            textField.textContent = 'No immersion text for immersion ' + cell.getData().id;
        }
        else
        {
            var immersionText = await window.api.getImmersionText(cell.getData().text_of_immersion_id);
            textField.textContent = immersionText[0]['text'];
        }

        window.onclick = (event) =>
        {
            if (event.target == modalBackground)
            {
                closeTextViewer();
            }
        };
        cancelButton.onclick = () =>
        {
            closeTextViewer();
        };
        
        function closeTextViewer()
        {
            modalBackground.style.display = 'none';
            textField.remove();
            cancelButton.remove();
        }
    }
}

export function hide()
{
    immersionsTable.destroy();
}