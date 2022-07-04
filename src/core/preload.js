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

async function getImmersions(count)  
{
    let response = await database.getImmersions(count);
    return response;
}

contextBridge.exposeInMainWorld
(
    "api", { tryConnect, queryDatabase, getImmersions }
)