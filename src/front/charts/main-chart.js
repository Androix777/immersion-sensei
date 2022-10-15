import * as immersionsTableReadOnly from '../tables/immersions-table-read-only.js'

export async function create(data, worksDataDict, tagsDataDict, worksColors, worksTypes, workTypesDataDict)
{
    var timelineChart = new dc.BarChart('#timeline-chart');
    var worksChart = new dc.RowChart("#works-chart");
    var daysOfWeekChart = new dc.RowChart("#days-of-week-chart");
    var workTypesChart = new dc.RowChart('#work-types-chart');
    var tagsChart = dc.rowChart('#tags-chart');

    var margins = {top: 10, bottom: 50, left: 75, right: 0};

    var cf = crossfilter(data);
    var dateDimension = cf.dimension((d) => { return Date.parse(d.date); });
    var workDimension = cf.dimension((d) => { return d.work_id; });
    var dayOfWeekDimension = cf.dimension((d) => { return (new Date(d.date)).getDay()});
    var dayOfWeek = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'};
    var workTypeDimension = cf.dimension((d) => { return worksTypes[d.work_id]; });
    var tagDimension = cf.dimension((d) => { return d.tags.length && d.tags[0] ? d.tags : false}, true);

    //dynamic date range
    var maxDate = Number.NEGATIVE_INFINITY;
    var minDate = Number.POSITIVE_INFINITY;
    dateDimension.group().all().forEach((item) =>
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

    //stack
    var worksIDList = [];
    var colorMap = { };

    workDimension.group().all().forEach((item) => 
    {
        worksIDList.push(item['key']);
        colorMap[item['key']] = worksColors[item['key']];
    })
    function sel_stack(i)
    {
        return d => d.value[i];
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
    
    //timeline chart
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
        
        var timeMargin = 2 * 1000 * 60 * 60 * 24 * (1 * +(dateUnit == d3.timeDay) + 7 * +(dateUnit == d3.timeWeek) + 30 * +(dateUnit == d3.timeMonth) + 365 * +(dateUnit == d3.timeYear));
        timelineChart
            .width(null)
            .height(null)
            .margins(margins)
            .x(d3.scaleTime().domain([new Date(minDate - timeMargin), new Date(maxDate + timeMargin)]))
            .elasticY(true)
            .dimension(dateDimension)
            .xUnits(dateUnit.range)
            .group(timelineGroup, '' + worksIDList[0], sel_stack(worksIDList[0]))
            .barPadding(0.1)
            .centerBar(true)
            .on('pretransition', function (chart) 
            {
                chart.selectAll("g rect").style("fill", function (d) 
                {
                    return colorMap[d.layer];
                });
                chart.selectAll('g.dc-legend-item rect').style('fill', function (d) 
                {
                    return colorMap[d.name];
                });
            });

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
    }

    //works chart
    function drawWorksChart(immersionUnit)
    {
        var workGroup = workDimension.group().reduceSum(function (d) {return d[immersionUnit];});
        worksChart
            .width(null)
            .height(null)
            .margins(margins)
            .elasticX(true)
            .dimension(workDimension)
            .group(workGroup)
            .colorCalculator(
                function (d) 
                { 
                    return colorMap[d.key];
                }
            )
            .on('pretransition', (chart) =>
            {
                var bars = timelineChart.selectAll('rect.bar')
                worksChart.selectAll('g.row')
                .on('mouseover', d => 
                {
                    var index = d.path[0].__data__.key
                    bars
                    .classed('fadeout', (x) => 
                    {
                        return index != x.layer
                    })
                })
                .on('mouseout', d => 
                {
                    bars
                    .classed('fadeout', false)
                })
            })
            .label(p => worksDataDict[p.key]);
        
        switch(immersionUnit)
        {
            case 'time':
                worksChart.xAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
                var maxTicksNum = 10;
                var timeStep = 60 * 60;
                while (timeStep < workGroup.top(1)[0].value / maxTicksNum)
                {
                    timeStep += 60 * 60;
                }
                var timeTickValues = [timeStep];
                while(Math.max.apply(Math, timeTickValues) < workGroup.top(1)[0].value - timeStep * 0.95)
                {
                    timeTickValues.push(Math.max.apply(Math, timeTickValues) + timeStep);
                }
                worksChart.xAxis().tickValues(timeTickValues);
                break;
            case 'characters':
                worksChart.xAxis().tickFormat((d, i) => { return d });
                worksChart.xAxis().tickValues(null);
                break;
            default:
                console.log('Unknown immersion unit')
        }
    }

    //days of week chart
    function drawDaysOfWeekChart(immersionUnit)
    {
        var dayOfWeekGroup = dayOfWeekDimension.group().reduceSum(function (d) {return d[immersionUnit];});
        daysOfWeekChart
            .width(null)
            .height(null)
            .margins(margins)
            .elasticX(true)
            .dimension(dayOfWeekDimension)
            .group(dayOfWeekGroup)
            .colorCalculator((d) => { return (d.key == 0 || d.key == 6) ? '#DD2222' : '#2222DD';})
            .label((d) => dayOfWeek[d.key])
            .ordering(function(d){ return (d.key == 0) ? 7 : d.key });
        
        switch(immersionUnit)
        {
            case 'time':
                daysOfWeekChart.xAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
                var maxTicksNum = 10;
                var timeStep = 60 * 60;
                while (timeStep < dayOfWeekGroup.top(1)[0].value / maxTicksNum)
                {
                    timeStep += 60 * 60;
                }
                var timeTickValues = [timeStep];
                while(Math.max.apply(Math, timeTickValues) < dayOfWeekGroup.top(1)[0].value - timeStep * 0.95)
                {
                    timeTickValues.push(Math.max.apply(Math, timeTickValues) + timeStep);
                }
                daysOfWeekChart.xAxis().tickValues(timeTickValues);
                break;
            case 'characters':
                daysOfWeekChart.xAxis().tickFormat((d, i) => { return d });
                daysOfWeekChart.xAxis().tickValues(null);
                break;
            default:
                console.log('Unknown immersion unit')
        }
    }

    //work types chart
    function drawWorkTypesChart(immersionUnit)
    {
        var workTypeGroup = workTypeDimension.group().reduceSum(function (d) {return d[immersionUnit];});
        workTypesChart
            .width(null)
            .height(null)
            .margins(margins)
            .elasticX(true)
            .dimension(workTypeDimension)
            .group(workTypeGroup)
            .label(p => workTypesDataDict[p.key]);
        
        switch(immersionUnit)
        {
            case 'time':
                workTypesChart.xAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
                var maxTicksNum = 10;
                var timeStep = 60 * 60;
                while (timeStep < workTypeGroup.top(1)[0].value / maxTicksNum)
                {
                    timeStep += 60 * 60;
                }
                var timeTickValues = [timeStep];
                while(Math.max.apply(Math, timeTickValues) < workTypeGroup.top(1)[0].value - timeStep * 0.95)
                {
                    timeTickValues.push(Math.max.apply(Math, timeTickValues) + timeStep);
                }
                workTypesChart.xAxis().tickValues(timeTickValues);
                break;
            case 'characters':
                workTypesChart.xAxis().tickFormat((d, i) => { return d });
                workTypesChart.xAxis().tickValues(null);
                break;
            default:
                console.log('Unknown immersion unit')
        }
    }

    //tags chart
    function drawTagsChart(immersionUnit)
    {
        var tagGroup = tagDimension.group().reduceSum((d) => {return d[immersionUnit];})
        tagsChart
            .height(null)
            .width(null)
            .margins(margins)
            .elasticX(true)
            .dimension(tagDimension)
            .group(tagGroup)
            .label((d) => tagsDataDict[d.key]);
        
        switch(immersionUnit)
        {
            case 'time':
                tagsChart.xAxis().tickFormat((d, i) => {return luxon.Duration.fromObject({seconds:d}).toFormat('h:mm:ss');});
                var maxTicksNum = 10;
                var timeStep = 60 * 60;
                while (timeStep < tagGroup.top(1)[0].value / maxTicksNum)
                {
                    timeStep += 60 * 60;
                }
                var timeTickValues = [timeStep];
                while(Math.max.apply(Math, timeTickValues) < tagGroup.top(1)[0].value - timeStep * 0.95)
                {
                    timeTickValues.push(Math.max.apply(Math, timeTickValues) + timeStep);
                }
                tagsChart.xAxis().tickValues(timeTickValues);
                break;
            case 'characters':
                tagsChart.xAxis().tickFormat((d, i) => { return d });
                tagsChart.xAxis().tickValues(null);
                break;
            default:
                console.log('Unknown immersion unit')
        }
    }
    
    d3.select('#date-unit').on('change', () => 
    {
        drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        dc.renderAll();
    });
    d3.select('#immersion-unit').on('change', () => 
    {
        drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        drawWorksChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        drawDaysOfWeekChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        drawWorkTypesChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        drawTagsChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
        dc.renderAll();
    });

    drawTimeline(dateUnits[d3.select('#date-unit').nodes()[0].value], immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    drawWorksChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    drawDaysOfWeekChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    drawWorkTypesChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);
    drawTagsChart(immersionUnits[d3.select('#immersion-unit').nodes()[0].value]);

    var immersionsTable = immersionsTableReadOnly.create(data, worksDataDict, tagsDataDict, "#immersions-table-charts");
    cf.onChange(eventType => 
    {
        immersionsTable.setFilter("id", "in", cf.allFiltered().map(({id})=>id));
    });

    dc.renderAll();
};