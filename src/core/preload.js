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

async function deleteImmersion(id)  
{
    let response = await database.deleteImmersion(id);
    return response;
}

contextBridge.exposeInMainWorld
(
    "api", { tryConnect, queryDatabase, getImmersions, deleteImmersion }
)