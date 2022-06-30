const { contextBridge } = require("electron");
const { database } = require("../back/database")


function connect()  
{
    database.connect();
}

function queryDatabase(input)  
{
    return database.query(input);
}

contextBridge.exposeInMainWorld
(
    "api", { connect, queryDatabase }
)