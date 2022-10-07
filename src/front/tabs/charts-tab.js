import * as mainChart from '../charts/main-chart.js'

export async function show()
{
    var immersionsData = await window.api.getImmersions();

    var worksData = await window.api.getWorks();
    var worksDataDict = {};
    worksData.forEach(element => 
    {
        worksDataDict[element["id"]] = element["title"]
    });

    var tagsData = await window.api.getTags();
    var tagsDataDict = {};
    tagsData.forEach(element => 
    {
        tagsDataDict[element["id"]] = element["name"]
    });

    mainChart.create(immersionsData, worksDataDict, tagsDataDict);
}