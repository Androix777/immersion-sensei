export function create(data, worksDataDict)
{
    var chart = new dc.RowChart("#chart");
    var chart2 = new dc.BarChart("#chart2");
    var chart3 = new dc.BarChart('#chart3');
    var chart4 = new dc.BarChart('#chart4');

    var margins = {top: 10, bottom: 50, left: 75, right: 0};

    var ndx = crossfilter(data);
    var workDimension = ndx.dimension((d) => { return d.work_id; });
    var dateDimension = ndx.dimension((d) => { return Date.parse(d.date); });
    var countGroup = workDimension.group().reduceSum(function (d) {return d.characters;});
    var charactersSumGroup = dateDimension.group().reduceSum(function(d) {return d.characters;});
    var timeSumGroup = dateDimension.group().reduceSum(function (d) {return d.time});

    var charactersSumGroupStacked = dateDimension.group().reduce(
        (p, v) =>
        {
            p[v.work_id] = (p[v.work_id] || 0) + v.characters;
            return p;
        },
        (p, v) =>
        {
            p[v.work_id] = (p[v.work_id] || 0) - v.characters;
            return p;
        },
        () => ({})
    );
    
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
    
    chart3.yAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
    var timeTickValues = [60 * 60];
    while(Math.max.apply(Math, timeTickValues) < timeSumGroup.top(1)[0].value)
    {
        timeTickValues.push(Math.max.apply(Math, timeTickValues) + 60 * 60);
    }
    chart3.yAxis().tickValues(timeTickValues);

    var worksIDList = [];
    workDimension.group().all().forEach((item) => 
    {
        worksIDList.push(item['key']);
    })

    function sel_stack(i)
    {
        return d => d.value[i];
    }

    chart4
        .width(null)
        .height(480)
        .margins(margins)
        .x(d3.scaleTime().domain([new Date(2021, 8, 1), new Date(2022, 9, 28)]))
        .dimension(dateDimension)
        .group(charactersSumGroupStacked, '' + worksIDList[0], sel_stack(worksIDList[0]));

    chart4.legend(dc.legend().x(90).legendText((item) => {return worksDataDict[item.name]}));

    for(let i = 1; i < worksIDList.length; ++i)
    {
        chart4.stack(charactersSumGroupStacked, '' + worksIDList[i], sel_stack(worksIDList[i]));
    }

    dc.renderAll();
};