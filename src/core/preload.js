const { contextBridge } = require("electron");
const { database } = require("../back/database")


function tryConnect()
{
    database.tryConnect();
}

function queryDatabase(input)  
{
    var promise = database.query(input);
    console.log(promise);
    return promise;
}

contextBridge.exposeInMainWorld
(
    "api", { tryConnect, queryDatabase }
)