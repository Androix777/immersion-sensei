import * as mainChart from '../charts/main-chart.js'

export async function show()
{
    var immersionsData = await window.api.getImmersions();

    var worksData = await window.api.getWorks();
    var worksDataDict = {};
    var worksColors = {};
    var worksTypes = {};
    worksData.forEach(element => 
    {
        worksDataDict[element["id"]] = element["title"];
        worksColors[element["id"]] = element["color"];
        worksTypes[element["id"]] = element["type_id"] ? element["type_id"] : "-1";
    });

    var workTypesData = await window.api.getWorkTypes();
    var workTypesDataDict = {}
    workTypesData.forEach(element =>
    {
        workTypesDataDict[element["id"]] = element["name"];
    });
    workTypesDataDict["-1"] = "No type";
    
    var tagsData = await window.api.getTags();
    var tagsDataDict = {};
    tagsData.forEach(element => 
    {
        tagsDataDict[element["id"]] = element["name"];
    });

    console.log(immersionsData)

    mainChart.create(immersionsData, worksDataDict, tagsDataDict, worksColors, worksTypes, workTypesDataDict);
}