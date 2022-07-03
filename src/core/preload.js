const { contextBridge } = require("electron");
const { database } = require("../back/database")


function tryConnect()
{
    database.tryConnect();
}

async function queryDatabase(input)  
{
    let response = await database.query(input);
    console.log(response);
    return response;
}

contextBridge.exposeInMainWorld
(
    "api", { tryConnect, queryDatabase }
)