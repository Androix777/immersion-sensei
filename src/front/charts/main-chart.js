export function create(data, worksDataDict)
{
    var chart = new dc.RowChart("#chart");
    var chart2 = new dc.BarChart("#chart2");

    var ndx = crossfilter(data);
    var workDimension = ndx.dimension((d) => { return d.work_id; });
    var dateDimension = ndx.dimension((d) => { return Date.parse(d.date); });
    var countGroup = workDimension.group();
    var charactersSumGroup = dateDimension.group().reduceSum(function(d) {return d.characters;});

    
    chart
        .width(768)
        .height(480)
        .elasticX(true)
        .dimension(workDimension)
        .group(countGroup)
        .label(p => worksDataDict[p.key]);

    chart2
        .width(768)
        .height(480)
        .x(d3.scaleTime().domain([new Date(2021, 8, 1), new Date(2022, 9, 28)]))
        .dimension(dateDimension)
        .group(charactersSumGroup);
    
    dc.renderAll();
};