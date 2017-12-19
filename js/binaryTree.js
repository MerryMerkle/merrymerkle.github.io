let example = d3.select("#example")

let w = 600, h = 600;

var canvas = example
.append('svg')
.attr('width', w)
.attr('height', h)
.on('click', function() { updateTree(initData)})

// Define the div for the tooltip
var div = d3.select("#example").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

function appendLeaf(node, x, y, i) {
    if(i == 0) {
        node
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 20)
        .style("fill", "yellow")
        .on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html(i)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
    } else {
        node
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 7)
        .style("fill", Math.floor(Math.random() * 2) % 2 == 0 ? "red" : "green")
        .on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html(i)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });        
    }
}

function appendBranch(node, x1, y1, x2, y2) {
    node
    .append("line")
    .style("stroke", "green")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
}

indices = [[0], [1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]];

leaves = [];
branches = [];

function generateCoordinates(x, y) {
    xspace = 150;
    yspace = 100;
    let n = 0;
    for(i = 0; i < indices.length; i++) {
        for(j = 0; j < indices[i].length; j++) {
            if(i == 0) {
                leaves.push({x: x, y: y, i: n})
            }else{
                if(n % 2 == 0) {
                    //go right
                    let k = indices[i-1].indexOf((n/2)-1);
                    let parentIndex = indices[i-1][k];
                    let parent = leaves[parentIndex];
                    let leaf = {x:parent.x+(xspace/(i*i)), y:y+(i*yspace), i: n}
                    leaves.push(leaf)
                    branches.push({x1: parent.x, y1: parent.y, x2: leaf.x, y2: leaf.y})
                } else {
                    //go left
                    let k = indices[i-1].indexOf(Math.floor(n/2))
                    let parentIndex = indices[i-1][k];
                    let parent = leaves[parentIndex];
                    let leaf = {x:parent.x-(xspace/(i*i)), y:y+(i*yspace), i: n}
                    leaves.push(leaf)
                    branches.push({x1: parent.x, y1: parent.y, x2: leaf.x, y2: leaf.y})
                }
            }
            n++;
        }
    }
}

function updateTree(data) {
    canvas.selectAll('circle').remove();
    for(i = 0; i < leaves.length; i++) {
        appendLeaf(canvas, leaves[i].x, leaves[i].y, data[i].i)
    }
}

function initTree(data) {
    //draw branches
    for(i = 0; i < branches.length; i++) {
        appendBranch(canvas, branches[i].x1, branches[i].y1, branches[i].x2, branches[i].y2);
    }
    //draw leafs
    for(i = 0; i < leaves.length; i++) {
        appendLeaf(canvas, leaves[i].x, leaves[i].y, data[i].i)
    }
}

initData = [];
for(i = 0; i < 31; i++) {
    initData.push({i: i})
}

generateCoordinates(w/2, 30);
initTree(initData);