const { contextBridge } = require("electron");
const { database } = require("../back/database")


function getDatabase (data)  
{
    console.log(database);
    return database.getData(data)
}

contextBridge.exposeInMainWorld
(
    "api", { getDatabase }
)