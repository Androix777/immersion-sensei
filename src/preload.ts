let child_process = require("child_process")
let { contextBridge } = require("electron")

let { database } = require("./back/database")


function getDatabase (data : string)  
{
    return database.getData(data)
}

contextBridge.exposeInMainWorld
(
    "api", { getDatabase }
)