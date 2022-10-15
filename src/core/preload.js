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

async function getWorkTypes()
{
    let response = await database.getWorkTypes();
    return response;
}

async function getWorkType(id)
{
    let response = await database.getWorkType(id);
    return response;
}

async function addWorkType()
{
    let response = await database.addWorkType();
    return response;
}

async function changeWorkType(id, column, value)
{
    let response = await database.changeWorkType(id, column, value);
    return response;
}

async function deleteWorkType(id)
{
    let response = await database.deleteWorkType(id);
    return response;
}

async function getTags()
{
    let response = await database.getTags();
    return response;
}

async function getTag(id)
{
    let response = await database.getTag(id);
    return response;
}

async function addTag()
{
    let response = await database.addTag();
    return response;
}

async function changeTag(id, column, value)
{
    let response = await database.changeTag(id, column, value);
    return response;
}

async function deleteTag(id)
{
    let response = await database.deleteTag(id);
    return response;
}

async function importTags(data)
{
    let response = await database.importTags(data);
    return response;
}

async function addImmersionTagLinks(immersionID, tagIDList)
{
    let response = await database.addImmersionTagLinks(immersionID, tagIDList);
    return response;
}

async function deleteImmersionTagLinks(id)
{
    let response = await database.deleteImmersionTagLinks(id);
    return response;
}

async function getImmersionText(id)
{
    let response = await database.getImmersionText(id);
    return response;
}

async function addImmersionText(text)
{
    let response = await database.addImmersionText(text);
    return response;
}

async function changeImmersionText(id, text)
{
    let response = await database.changeImmersionText(id, text);
    return response;
}

async function deleteImmersionText(id)
{
    let response = await database.deleteImmersionText(id);
    return response;
}

contextBridge.exposeInMainWorld
(
    "api", 
    { 
        tryConnect,
        queryDatabase,
        getImmersions,
        getImmersion,
        deleteImmersion,
        changeImmersion,
        addImmersion,
        importImmersions,
        getWorks,
        getWork,
        addWork,
        changeWork,
        deleteWork,
        importWorks,
        getWorkTypes,
        getWorkType,
        addWorkType,
        changeWorkType,
        deleteWorkType,
        getTags,
        getTag,
        addTag,
        changeTag,
        deleteTag,
        importTags,
        addImmersionTagLinks,
        deleteImmersionTagLinks,
        getImmersionText,
        addImmersionText,
        changeImmersionText,
        deleteImmersionText
    }
)