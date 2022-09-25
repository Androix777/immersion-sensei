const { contextBridge } = require("electron");
const { database } = require("../back/database")


function tryConnect()
{
    database.tryConnect();
}

async function queryDatabase(input)
{
    let response = await database.query(input);
    return response;
}

async function getImmersions()
{
    let response = await database.getImmersions();
    return response;
}

async function getImmersion(id)
{
    let response = await database.getImmersion(id);
    return response;
}

async function addImmersion()
{
    let response = await database.addImmersion();
    return response;
}

async function changeImmersion(id, column, value)
{
    let response = await database.changeImmersion(id, column, value);
    return response;
}

async function deleteImmersion(id)
{
    let response = await database.deleteImmersion(id);
    return response;
}

async function importImmersions(data)
{
    let response = await database.importImmersions(data);
    return response;
}

async function getWorks()
{
    let response = await database.getWorks();
    return response;
}

async function getWork(id)
{
    let response = await database.getWork(id);
    return response;
}

async function addWork()
{
    let response = await database.addWork();
    return response;
}

async function changeWork(id, column, value)
{
    let response = await database.changeWork(id, column, value);
    return response;
}

async function deleteWork(id)
{
    let response = await database.deleteWork(id);
    return response;
}

async function importWorks(data)
{
    let response = await database.importWorks(data);
    return response;
}

contextBridge.exposeInMainWorld
(
    "api", { tryConnect, queryDatabase, getImmersions, getImmersion, deleteImmersion, changeImmersion, addImmersion, getWorks, getWork, addWork, changeWork, deleteWork, importImmersions, importWorks }
)