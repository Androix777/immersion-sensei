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

    mainChart.create(immersionsData, worksDataDict);
}