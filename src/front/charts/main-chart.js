export function create(data, worksDataDict)
{
    var chart = new dc.RowChart("#chart");
    var chart2 = new dc.BarChart("#chart2");
    var chart3 = new dc.BarChart('#chart3');

    var margins = {top: 10, bottom: 50, left: 50, right: 0};

    var ndx = crossfilter(data);
    var workDimension = ndx.dimension((d) => { return d.work_id; });
    var dateDimension = ndx.dimension((d) => { return Date.parse(d.date); });
    var countGroup = workDimension.group().reduceSum(function (d) {return d.characters;});
    var charactersSumGroup = dateDimension.group().reduceSum(function(d) {return d.characters;});
    var timeSumGroup = dateDimension.group().reduceSum(function (d) {return d.time});

    
    chart
        .width(null)
        .height(480)
        .margins(margins)
        .elasticX(true)
        .dimension(workDimension)
        .group(countGroup)
        .label(p => worksDataDict[p.key]);

    chart2
        .width(null)
        .height(480)
        .margins(margins)
        .x(d3.scaleTime().domain([new Date(2021, 8, 1), new Date(2022, 9, 28)]))
        .dimension(dateDimension)
        .group(charactersSumGroup);
    
    chart3
        .width(null)
        .height(480)
        .margins(margins)
        .x(d3.scaleTime().domain([new Date(2021, 8, 1), new Date(2022, 9, 28)]))
        .dimension(dateDimension)
        .group(timeSumGroup);
    
    dc.renderAll();
};