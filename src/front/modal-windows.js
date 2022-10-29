export class ModalWindow
{
    constructor()
    {
        this.modalBackground = document.createElement('div');
        this.modalBackground.classList.add('modal-background');
        
        this.modalContent = document.createElement('div');
        this.modalContent.classList.add('modal-content');

        this.modalBackground.appendChild(this.modalContent);        
        document.body.appendChild(this.modalBackground);

        this.on('modalBackgroundMouseDown', () => { this.destroy(); });
        this.on('modalContentMouseDown', (event) => { event.stopPropagation(); });
    }

    async init(HTMLPath)
    {
        await loadInnerHTML(HTMLPath, this.modalContent);
        return this;
    }

    show()
    {
        this.modalBackground.style.display = 'block';
    }

    hide()
    {
        this.modalBackground.style.display = 'none';
    }

    destroy()
    {
        this.hide();
        this.modalBackground.remove();
    }

    on(eventName, callback)
    {
        switch (eventName)
        {
            case 'modalBackgroundMouseDown':
                this.modalBackground.onmousedown = callback;
                break;
            case 'modalContentMouseDown':
                this.modalContent.onmousedown = callback;
                break;
            default:
                break;
        }
    }
}

export class ImmersionTextWindow extends ModalWindow
{
    constructor()
    {
        super();
    }

    async init(immersionText)
    {
        await loadInnerHTML('./immersion-text.html', this.modalContent);

        this.immersionTextarea = document.getElementById('immersion-textarea');
        this.acceptButton = document.getElementById('accept-button');
        this.deleteButton = document.getElementById('delete-button');
        this.cancelButton = document.getElementById('cancel-button');

        this.acceptButton.disabled = true;
        this.deleteButton.disabled = true;
        this.cancelButton.disabled = true;

        this.immersionTextarea.value = immersionText;

        return this;
    }

    on(eventName, callback)
    {
        super.on(eventName, callback);
        switch (eventName)
        {
            case 'acceptButtonClick':
                this.acceptButton.onclick = callback;
                this.acceptButton.disabled = false;
                break;
            case 'deleteButtonClick':
                this.deleteButton.onclick = callback;
                this.deleteButton.disabled = false;
                break;
            case 'cancelButtonClick':
                this.cancelButton.onclick = callback;
                this.cancelButton.disabled = false;
                break;
            default:
                break;
        }
    }

    get immersionText()
    {
        return this.immersionTextarea.value;
    }
}

async function loadInnerHTML(HTMLPath, targetElement)
{
    targetElement.innerHTML = await loadFile(HTMLPath);
}

function loadFile(HTMLPath)
{
    return new Promise(function (resolve, reject) 
    {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', HTMLPath);
        xhr.onload = function () 
        {
            if (this.status >= 200 && this.status < 300) 
            {
                resolve(xhr.response);
            } 
            else 
            {
                reject(
                    {
                    status: this.status,
                    statusText: xhr.statusText
                    }
                );
            }
        };
        xhr.onerror = function () 
        {
            reject(
                {
                    status: this.status,
                    statusText: xhr.statusText
                }
            );
        };
        xhr.send();
    });
}