// Constants
var NOT_CREDITSCORE = 1000;

// Helper functions
function key_func(d){
    return d['key'];
}

function get_quarters(nested_q){
    var quarters = [],
        i = 0;

    for(; i < nested_q.length ; ++i){
        quarters.push(new Date(nested_q[i].key));
    }

    return quarters.sort(function(a,b){
        // I want this to be ascending
        return a-b;
    });
}

function round2quarters(date){
    return new Date(date['LoanOriginationDate'].getFullYear(),Math.floor(date['LoanOriginationDate'].getMonth()/3)*3);
}

// Function to print date in quarters
function date2Qstring(date){
    return "Q" + (Math.floor(date.getMonth()/3)+1) + " " + date.getFullYear();
}

// Credit score zero up to 299 while all other credit score brackets move 20 step intervals
function calculate_credit_score(score){
    if (score == 0){
      return "0-299"
    }
    else {
      return score + "-" + (score+19);
    }
}

function addExplanationText(titleText){
  var explanationText = d3.select(".explanationText")
                              .append("text")
                              .append("div")
                              .attr("class","legend")
                              .style("font-size", "24px")
                              .style("left","1000px")
                              .style("top","500px")                  
                              .text(titleText);
}

function draw_axis(svg,x_axis,y_axis,height,margin){
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(-18," + (height-6) + ")")
    .call(x_axis);

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin-12) + ",0)")
    .call(y_axis);

  svg.append("g")
     .attr("class", "y axis")
     .attr('transform', 'translate(' + 0 + ', ' + ((height/2)+margin) + ')')
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("dy", "1em")
     .style("text-anchor","start")
     .style("color","black")
     .text("Borrower's interest rate");
}

function draw_legend(colors,map){
  var top_point = 100,
      increment = 15;
  
  var trimmed_colors = colors.slice();
  // Removing the second color as it lands between 1-299 (zero covers all of it)
  trimmed_colors.splice(1,1); 
    
  var credit_scored = d3.selectAll("body.legend")
                        .data(trimmed_colors)
                        .enter()
                        .append("text")
                        .attr("id","score_text")
                        .attr("class","legend")
                        .attr("y",function(d,i) { return top_point + increment*i;})
                        .style("background", function(d) { return d;})
                        .style("font-size", "24px")
                        .style("color","black")
                        .style("padding","4px")
                        .style("opacity",0.6)
                        .text(function(d){
                            var inverted = map.invertExtent(d);
                            if (inverted[0] == 0){
                                return "  0-299";
                            } else if (inverted[0] < 300){
                                return "300-"+Math.floor(inverted[1]);
                            }
                            else {
                                return  Math.ceil(inverted[0]) + "-" + Math.floor(inverted[1]);
                            }
                        });   
                        
  var legend_title = d3.select("body")
                          .append("div")
                          .attr("class","legend")
                          .style("font-size", "24px")
                          .text("Credit score color coding:");
}

// Main operating function
function draw(data) {
  "use strict";
  var margin = 75,
      width = 1300 - margin,
      height = 800 - margin;

  var svg = d3.select("body")
    .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
    .append('g')
        .attr('class','chart');

  // Access functions for used data attributes
  var time_extent = d3.extent(data, function(d) {
    return d['LoanOriginationDate'];
  });
  
  var interest_extent = d3.extent(data, function(d) {
    return d['BorrowerRate'];
  });

  var creditscore_extent = d3.extent(data, function(d){
    return d['CreditScoreRangeLower'];
  });
    
  // Create x-axis scale mapping dates -> pixels
  var time_scale = d3.time.scale()
    .range([margin, width])
    .domain(time_extent);

  // Create y-axis scale mapping attendance -> pixels
  var interest_scale = d3.scale.linear()
    .range([height, margin])
    .domain(interest_extent);

  // Create color scale. The scale is somewhat non-linear as the first hop is from
  // 0-299 but after that it goes in intervals of 20. That's why "orange"
  // will never get visible in the graphs
  var colors = ["#d73027","orange","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"];
  var heatmapColor = d3.scale.quantize()
    .domain(creditscore_extent)
    .range(colors);
    
  var time_axis = d3.svg.axis()
    .scale(time_scale)
    .ticks(d3.time.months, 6)
    .tickFormat(d3.time.format("%b'%y"));

  var interest_axis = d3.svg.axis()
    .scale(interest_scale)
    .tickFormat(d3.format("%"))
    .orient("left");

  // Draws both axis and the legend.
  draw_axis(svg,time_axis,interest_axis,height,margin);
  draw_legend(colors,heatmapColor);

  /* This makes two layered structure where outer ring is dates in quarters
    so that the date matches the first date of the quarter.
    The inner-ring is then the lowered credit-score with the average loan rate.
    
    This is pretty heavy duty way of doing things but will do for now as I've
    three sets of rolled up data
  */
  var nested = d3.nest()
                .key(round2quarters)
                .key(function(d) {
                  return d['CreditScoreRangeLower'];
                })
                .rollup(function(d){
                  return d3.mean(d,function(d){
                    return d['BorrowerRate'];
                  });
                })
                .entries(data);

  var nested_cscore = d3.nest()
                .key(function(d) {
                    return d['CreditScoreRangeLower'];                
                })
                .key(round2quarters)
                .rollup(function(d){
                  return d3.mean(d,function(d){
                    return d['BorrowerRate'];
                  });
                })
                .entries(data);

  var nested_mean = d3.nest()
                .key(round2quarters)
                .rollup(function(d){
                  return d3.mean(d,function(d){
                    return d['BorrowerRate'];
                  });
                })
                .entries(data);

  // Making quarters out of date data
  var quarters = get_quarters(nested);

  // Main plotting function
  function update(q,nested_data,title_text,id, creditscore = NOT_CREDITSCORE){
    var filtered = nested_data.filter(function(d) {
        return (new Date(d['key']) <= q);
    })
    .sort(function(a,b){
        return (new Date(a['key'])) - (new Date(b['key']));
    });

    // Access function for digging x coordinate for line-plotting
    function x_coord(d){
        return time_scale(new Date(d.key));
    }
    // Access function for digging y coordinate for line-plotting
    function y_coord(d){
        return interest_scale(d.values);
    }

    d3.select("h2")
        .text(title_text);
        
    var line = d3.svg.line()
                .x(x_coord)
                .y(y_coord),
        line_stroke = heatmapColor(creditscore),
        stroke_width = 3;

    // starting the drawing of the lines between data points
    var lines = svg.append("g")
                   .append("path");
        
    // Credit score is used signal that we are drawing average (it's the first invalid value)
    if (creditscore == NOT_CREDITSCORE){
        var circles = svg.selectAll('circles')
                         .data(filtered,key_func);
                         
        circles.exit().remove();

        circles.enter()
          .append("circle")
          .transition()
          .duration(500)
          .attr("cx", x_coord)
          .attr("cy", y_coord)
          .attr("id",id)
          .style("fill-opacity",1.0);

        // We don't want to use any color for the average
        line_stroke = "black";
        stroke_width = 3;
    }
    else {
        // We only add creditscore tooltip to the actual creditscore lines

        // Creates tooltips but make them hidden until mouse event arrives
        // This is placed to the top corner but they should stay invisible
        var tooltip = d3.select("body").append("div")
            .attr("class","tooltip")
            .style("opacity",1)
            .style("visibility", "hidden")
            .style("left","0px")
            .style("top","0px")
            .text(calculate_credit_score(creditscore));
        
        // helper function to bring the tooltip text-up (in case we use it in multiple places)
        function bring_text_up(){
            lines.style("stroke","black")
                 .style("opacity",.9)
                 .style("stroke-width",3);
            return tooltip.style("visibility", "visible")
                          .style("left",(d3.event.pageX - 60) + "px")
                          .style("top",(d3.event.pageY - 20) + "px");
        }            
        lines.on("mouseover", function(){
                    bring_text_up();
              })
              .on("mouseout", function(){
                  lines.style("stroke",heatmapColor(creditscore))
                       .style("opacity",0)
                       .style("stroke-width",stroke_width);
                  return tooltip.transition().duration(500).style("visibility", "hidden");})
    }

    lines.transition()
      .duration(500)
      .attr("class","line")
      .attr("class","point-clips")
      .attr("class","point-paths")
      .attr("d",line(filtered))
      .attr("id",id)
      .style("stroke-width",stroke_width)
      .style("stroke",line_stroke)
      .style("fill", "none");

    return lines;
  }

  function update_credit_scores(idx,creditscore_data,title_text,id){
    for (var key in creditscore_data){
        update(idx,creditscore_data[key].values,title_text,id,+creditscore_data[key].key);
    }
  }
  
  function interval_plotting(timeout){
    var quarter_idx = 0,
        function_idx = 0;

    // Making list of dictionary objects was the cleanest way of plotting quarterly increments
    // with different kind of data plotting functions without making too deep nesting
    var dict = [{ f : update,
                  d : nested_mean,
                  id : "avg",
                  t : "Average borrower's rate up to quarter starting at ",
                  expl : "2008 credit crises caused the interest rates climb until mid-2011"},
                {f : update_credit_scores,
                 d : nested_cscore,
                 id : "score",
                 t : "Average borrower's quarterly rate per credit score at ",
                 expl : "Increase was greater at lower credit scores as investor looked for safer loans"}  ];

    addExplanationText(dict[function_idx]['expl']);
                 
    // Timer for plotting first in time and then in through credit scores
    var interval = setInterval(function(){
      if(quarter_idx < quarters.length){
          dict[function_idx]['f'](quarters[quarter_idx],
                                  dict[function_idx]['d'],
                                  dict[function_idx]['t'] + date2Qstring(quarters[quarter_idx]),
                                  dict[function_idx]['id']);
          quarter_idx++;
      }
      else {
        function_idx++;
        if (function_idx < dict.length){
            addExplanationText(dict[function_idx]['expl']);
            quarter_idx = 1;
        }
        else {
            clearInterval(interval);
            d3.selectAll("#avg").transition().duration(6000).remove();
            addExplanationText("Credit scores are only part of the story as their impact to loan rates gets smaller after 750+");
        }
      }
    },timeout);
  }
  
  interval_plotting(400);
};

var format = d3.time.format("%m/%d/%Y %H:%M")

debugger;

d3.csv("data/prosperLoanData.csv", function(d) {
  d['BorrowerRate'] = +d['BorrowerRate'];
  d['CreditScoreRangeLower'] = +d['CreditScoreRangeLower'];
  d['LoanOriginationDate'] = format.parse(d['LoanOriginationDate']);
  return d;      
}, draw);
