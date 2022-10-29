export var defaultOptions = 
{
    timeout: 1000, 
    position: "right-bottom",
}

export var currentOptions;
try
{
    await reloadNotifyOptions();
}
catch (e)
{
    console.error('Notify options not found: ' + e);
    currentOptions = defaultOptions;
}

export async function reloadNotifyOptions()
{
    currentOptions = JSON.parse(await window.api.readSettings())['notifyOptions'];
}