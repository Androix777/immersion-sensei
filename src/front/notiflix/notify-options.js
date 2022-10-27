export var defaultOptions = 
{
    timeout: 1000, 
    position: "right-bottom",
}

export async function loadNotifyOptions()
{
    return JSON.parse(await window.api.readSettings())['notifyOptions'];
}