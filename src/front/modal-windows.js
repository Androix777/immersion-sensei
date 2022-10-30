export class ModalWindow
{
    constructor()
    {
        return new Promise(function (resolve, reject) 
        {
            this.modalBackground = document.createElement('div');
            this.modalBackground.classList.add('modal-background');
            
            this.modalContent = document.createElement('div');
            this.modalContent.classList.add('modal-content');

            this.modalBackground.appendChild(this.modalContent);        
            document.body.appendChild(this.modalBackground);

            this.on('modalBackgroundMouseDown', () => { this.destroy(); });
            this.on('modalContentMouseDown', (event) => { event.stopPropagation(); });

            resolve(this);
        }.bind(this));
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
        var parent = super();
        return new Promise(async function (resolve, reject) 
        {
            var properties = await parent;
            
            await loadInnerHTML('./immersion-text.html', properties.modalContent);

            properties.immersionTextarea = document.getElementById('immersion-textarea');
            properties.immersionTextarea.placeholder = 'Immersion text here...';
            properties.acceptButton = document.getElementById('accept-button');
            properties.deleteButton = document.getElementById('delete-button');
            properties.cancelButton = document.getElementById('cancel-button');

            properties.acceptButton.disabled = true;
            properties.deleteButton.disabled = true;
            properties.cancelButton.disabled = true;

            resolve(this);
        }.bind(parent));
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

    set immersionText(immersionText)
    {
        this.immersionTextarea.value = immersionText;
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