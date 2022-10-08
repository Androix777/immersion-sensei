import * as immersionsTableReadOnly from '../tables/immersions-table-read-only.js'

export async function create(data, worksDataDict, tagsDataDict)
{
    var rowChart = new dc.RowChart("#row-chart");
    var timelineChart = new dc.BarChart('#timeline-chart');
    var chart3 = new dc.BarChart('#chart3');
    var chart4 = new dc.BarChart('#chart4');

    var margins = {top: 10, bottom: 50, left: 75, right: 0};

    var ndx = crossfilter(data);
    var workDimension = ndx.dimension((d) => { return d.work_id; });
    var dateDimension = ndx.dimension((d) => { return Date.parse(d.date); });
    var countGroup = workDimension.group().reduceSum(function (d) {return d.characters;});
    var charactersSumGroup = dateDimension.group().reduceSum(function(d) {return d.characters;});
    var timeSumGroup = dateDimension.group().reduceSum(function (d) {return d.time});

    var timeSumGroupStacked = dateDimension.group().reduce(
        (p, v) =>
        {
            p[v.work_id] = (p[v.work_id] || 0) + v.time;
            return p;
        },
        (p, v) =>
        {
            p[v.work_id] = (p[v.work_id] || 0) - v.time;
            return p;
        },
        () => ({})
    );

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

    //dynamic date range
    var maxDate = Number.NEGATIVE_INFINITY
    var minDate = Number.POSITIVE_INFINITY
    dateDimension.group().top(Number.POSITIVE_INFINITY).forEach((item) =>
    {
        if(item.key > maxDate)
        {
            maxDate = item.key;
        }
        if(item.key < minDate)
        {
            minDate = item.key;
        }
    });
    //extend by 1 day
    minDate -= 1000 * 60 * 60 * 24 * 1;
    maxDate += 1000 * 60 * 60 * 24 * 1;

    //stack
    var worksIDList = [];
    workDimension.group().all().forEach((item) => 
    {
        worksIDList.push(item['key']);
    })

    function sel_stack(i)
    {
        return d => d.value[i];
    }
    
    rowChart
        .width(null)
        .height(480)
        .margins(margins)
        .elasticX(true)
        .dimension(workDimension)
        .group(countGroup)
        .label(p => worksDataDict[p.key]);
            
    chart3
        .width(null)
        .height(480)
        .margins(margins)
        .x(d3.scaleTime().domain([new Date(minDate), new Date(maxDate)]))
        .xUnits(d3.timeDays)
        .dimension(dateDimension)
        .group(timeSumGroupStacked, '' + worksIDList[0], sel_stack(worksIDList[0]));
    
    chart3.legend(dc.legend().x(90).legendText((item) => {return worksDataDict[item.name]}));
    for(let i = 1; i < worksIDList.length; ++i)
    {
        chart3.stack(timeSumGroupStacked, '' + worksIDList[i], sel_stack(worksIDList[i]));
    }

    chart3.yAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
    var timeTickValues = [60 * 60];
    while(Math.max.apply(Math, timeTickValues) < timeSumGroup.top(1)[0].value)
    {
        timeTickValues.push(Math.max.apply(Math, timeTickValues) + 60 * 60);
    }
    chart3.yAxis().tickValues(timeTickValues);
    
    chart4
        .width(null)
        .height(480)
        .margins(margins)
        .x(d3.scaleTime().domain([new Date(minDate), new Date(maxDate)]))
        .dimension(dateDimension)
        .xUnits(d3.timeDays)
        .group(charactersSumGroupStacked, '' + worksIDList[0], sel_stack(worksIDList[0]));

    chart4.legend(dc.legend().x(90).legendText((item) => {return worksDataDict[item.name]}));
    for(let i = 1; i < worksIDList.length; ++i)
    {
        chart4.stack(charactersSumGroupStacked, '' + worksIDList[i], sel_stack(worksIDList[i]));
    }

    //date units
    var dateUnits = {
        Days: d3.timeDay,
        Weeks: d3.timeWeek,
        Months: d3.timeMonth,
        Years: d3.timeYear
    };
    d3.select('#date-unit').selectAll('option')
        .data(Object.keys(dateUnits))
        .enter().append('option')
        .text(function(d) { return d; })
        .attr('selected', function(d) { return d === 'Days' ? '' : null; });
    
    //immersion units
    var immersionUnits = {
        Characters: 'characters',
        Time: 'time'
    };
    d3.select('#immersion-unit').selectAll('option')
        .data(Object.keys(immersionUnits))
        .enter().append('option')
        .text((d) => { return d; })
        .attr('selected', (d) => { return d === 'Characters' ? '' : null });
    
    //variable bar width chart
    function drawTimeline(dateUnit, immersionUnit)
    {
        var timelineGroup = dateDimension.group(dateUnit).reduce(
            (p, v) =>
            {
                p[v.work_id] = (p[v.work_id] || 0) + v[immersionUnit];
                return p;
            },
            (p, v) =>
            {
                p[v.work_id] = (p[v.work_id] || 0) - v[immersionUnit];
                return p;
            },
            () => ({})
        );
        
        var timeMargin = 1000 * 60 * 60 * 24 * (1 * +(dateUnit == d3.timeDay) + 7 * +(dateUnit == d3.timeWeek) + 30 * +(dateUnit == d3.timeMonth) + 365 * +(dateUnit == d3.timeYear));
        timelineChart
            .width(null)
            .height(480)
            .margins(margins)
            .x(d3.scaleTime().domain([new Date(minDate - timeMargin), new Date(maxDate + timeMargin)]))
            .elasticY(true)
            .dimension(dateDimension)
            .xUnits(dateUnit.range)
            .group(timelineGroup, '' + worksIDList[0], sel_stack(worksIDList[0]))
            .barPadding(0.1)
            .centerBar(true);
        
        timelineChart.legend(dc.legend().x(90).legendText((item) => {return worksDataDict[item.name]}));

        switch(immersionUnit)
        {
            case 'time':
                var timeSumGroup = dateDimension.group(dateUnit).reduceSum(function (d) {return d.time});
                timelineChart.yAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
                var maxTicksNum = 20;
                var timeStep = 60 * 60;
                while (timeStep < timeSumGroup.top(1)[0].value / maxTicksNum)
                {
                    timeStep += 60 * 60;
                }
                var timeTickValues = [timeStep];
                while(Math.max.apply(Math, timeTickValues) < timeSumGroup.top(1)[0].value - timeStep * 0.95)
                {
                    timeTickValues.push(Math.max.apply(Math, timeTickValues) + timeStep);
                }
                timelineChart.yAxis().tickValues(timeTickValues);
                break;
            case 'characters':
                timelineChart.yAxis().tickFormat((d, i) => { return d });
                timelineChart.yAxis().tickValues(null);
                break;
            default:
                console.log('Unknown immersion unit')
        }

        for(let i = 1; i < worksIDList.length; ++i)
        {
            timelineChart.stack(timelineGroup, '' + worksIDList[i], sel_stack(worksIDList[i]));
        }

        dc.renderAll();
    }
    
    d3.select('#date-unit').on('change', () => 
    {
        drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    });
    d3.select('#immersion-unit').on('change', () => 
    {
        drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    });

    drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);

    const charts = [chart3, chart4, timelineChart];
    let broadcasting = false; // don't repropogate (infinite loop)
    for(const chartA of charts)
    {
        chartA.on('filtered', function(chart, filter) {
            if(broadcasting) return;
            broadcasting = true;
            for(const chartB of charts.filter(chartB => chartB !== chartA))
            {
                chartB.replaceFilter(filter);
            } 
            broadcasting = false;
        })
    }

    

    var immersionsTable = immersionsTableReadOnly.create(data, worksDataDict, tagsDataDict, "#immersions-table-charts");
    ndx.onChange(eventType => 
    {
        console.log(eventType);
        immersionsTable.setFilter("id", "in", ndx.allFiltered().map(({id})=>id));
    });


    dc.renderAll();
};