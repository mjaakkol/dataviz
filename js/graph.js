
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

function draw_axis(x_axis,y_axis,height,margin){
  d3.select("svg")
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(-18," + (height-6) + ")")
    .call(x_axis);

  d3.select("svg")
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin-12) + ",0)")
    .call(y_axis);    
}

function draw(data) {
  "use strict";
  var margin = 75,
      width = 1600 - margin,
      height = 1000 - margin;

  d3.select("body")
    .append("h2")
    .text("Borrower's rate over time ");

  var svg = d3.select("body")
    .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
    .append('g')
        .attr('class','chart');
    
  d3.select("svg")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")

  var time_extent = d3.extent(data, function(d) {
    return d['LoanOriginationDate'];
  });
  
  var interest_extent = d3.extent(data, function(d) {
    return d['BorrowerRate'];
  });

  // Scaling the outliers out of the graph helping with the readability
  // Still want to keep those values in dataset for the calculations
  //interest_extent[1] = 0.38;
  
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

  // Create color scale
  var colors = ["red","brown","yellow","green","turquoise ","blue","purple"];
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

    draw_axis(time_axis,interest_axis,height,margin);

  /* This makes two layered structure where outer ring is dates in quarters
    so that the date matches the first date of the quarter.
    The inner-ring is then the lowered credit-score with the average loan rate
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

  var quarters = get_quarters(nested);
  
  // Ending plotting scales and making converters
  // from here we start plotting dots and making graphs

  function update(q,nested_data,title_text,id,highlighted = true, creditscore = 1000){
    var filtered = nested_data.filter(function(d) {
        return (new Date(d['key']) <= q);
    })
    .sort(function(a,b){
        return (new Date(a['key'])) - (new Date(b['key']));
    });

    function x_coord(d){
        return time_scale(new Date(d.key));
    }
    
    function y_coord(d){
        return interest_scale(d.values);
    }

    d3.select("h2")
        .text(title_text);

    var line = d3.svg.line()
                .x(x_coord)
                .y(y_coord);
        
    svg.selectAll("path")
      .data(filtered,key_func)
      .exit()
      .remove();
      
    var line_stroke = "black",
        stroke_width = 3;
        
    if (creditscore != 1000){
        line_stroke = heatmapColor(creditscore);
    }
        
    var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",1)
        .style("visibility", "hidden")
        .text(calculate_credit_score(creditscore));

    if (highlighted == true){
        var circles = svg.selectAll('circles')
                         .data(filtered,key_func);
                         
//        circles.exit().remove();

        circles.enter()
          .append("circle")
          .on("mouseover", function(){
              debugger;
              return tooltip.style("visibility", "visible");})
          .transition()
          .duration(500)
          .attr("cx", x_coord)
          .attr("cy", y_coord)
          .attr("id",id)
          .style("fill-opacity",1.0);

        line_stroke = "black";
        stroke_width = 3;
    }

    var lines = d3.select("svg")
      .append("g")
      .append("path");
      
    function bring_text_up(){
        lines.style("stroke","black")
             .style("opacity",.9)
             .style("stroke-width",3);
        return tooltip.style("visibility", "visible")
                      .style("left",(d3.event.pageX - 60) + "px")
                      .style("top",(d3.event.pageY - 20) + "px");
    }    
     
    lines
      .on("mouseover", function(){
        bring_text_up();
      })
      .on("mouseout", function(){
          lines.style("stroke",heatmapColor(creditscore))
               .style("opacity",.0)
               .style("stroke-width",stroke_width);
          return tooltip.transition().duration(500).style("visibility", "hidden");})
      .transition()
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

  function scatter_plot(data){
    d3.selectAll("circle")
      .attr("cx", function(d) {
          return time_scale(d["LoanOriginationDate"]);
      })
      .attr("cy", function(d) {
          return interest_scale(d["BorrowerRate"]);
      })
      .attr("r", 1.5)
      .attr("id","scatter")
      .transition()
      .duration(100)
      .style("fill-opacity",0.7)
      .style("fill", function(d){
        return heatmapColor(d['CreditScoreRangeLower']);
      });
      
      var clear_timeout = setTimeout(function() {
          var scatter_next_button = d3.select("body")
                                      .append("div")
                                      .attr("class","next_button")
                                      .text("Press to see how average rates change in a relation to credit scores");
                                      
          scatter_next_button.on("click", function(d){
            d3.selectAll("circle").remove();
            scatter_next_button.remove();
            interval_plotting(300);
          });
      }, 5000);
  }
  
  function calculate_credit_score(score){
    if (score == 0){
      return "0-299"
    }
    else {
      return score + "-" + (score+19);
    }
  }
  
  function update_credit_scores(idx,creditscore_data,title_text,id){
    for (var key in creditscore_data){
        update(idx,creditscore_data[key].values,title_text,id,false,+creditscore_data[key].key);
    }
  }
  
  function interval_plotting(timeout){
    var quarter_idx = 0,
        function_idx = 0;

    var dict = [{ f : update,
                  d : nested_mean,
                  id : "avg",
                  t : "Average Borrower's rate up to quarter starting at "},
                {f : update_credit_scores,
                 d : nested_cscore,
                 id : "score",
                 t : "Average's Borrower's quarterly rate per credit score at "}  ];

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
            quarter_idx = 1;
        }
        else {
            clearInterval(interval);
//            d3.selectAll("circle").remove();
            
            d3.selectAll("#avg").remove();
            // this is where we start context sensitivy and interactivity
        }
      }
    },timeout);
  }
  
  scatter_plot(data);
//  interval_plotting(200);
};

var format = d3.time.format("%m/%d/%Y %H:%M")

d3.csv("data/prosperLoanData.csv", function(d) {
  d['BorrowerRate'] = +d['BorrowerRate'];
  d['StatedMonthlyIncome'] = +d['StatedMonthlyIncome'];
  d['CreditScoreRangeLower'] = +d['CreditScoreRangeLower'];
  d['LoanOriginationDate'] = format.parse(d['LoanOriginationDate']);
  return d;      
}, draw);
