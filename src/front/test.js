export function test(input)
{
    return input + "(frontend)";
}

export function testChart()
{
    var data = [150, 230, 180, 90];

    var svg = d3.select("body")
        .append("svg")
        .attr("width", 300)
        .attr("height", 200);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", function(d) {return d;})
        .attr("height", "40")
        .attr("y", function(d, i) {return i*50 + 10;})
        .attr("x", "10");
}