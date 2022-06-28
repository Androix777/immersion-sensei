import { contextBridge } from "electron"
import { database } from "../back/database"


function getDatabase (data : string)  
{
    return database.getData(data)
}

contextBridge.exposeInMainWorld
(
    "api", { getDatabase }
)