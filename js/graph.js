
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

function draw_axis(x_axis,y_axis,height,margin){
  d3.select("svg")
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(x_axis);

  d3.select("svg")
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin + ",0)")
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
  var colors = ["red","yellow","green","cyan","blue"];
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
                .key(function(d) {
                  var date = d['LoanOriginationDate'];
                  return new Date(date.getFullYear(),Math.floor(date.getMonth()/3)*3);
                })
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
                .key(function(d) {
                  var date = d['LoanOriginationDate'];
                  return new Date(date.getFullYear(),Math.floor(date.getMonth()/3)*3);
                })
                .rollup(function(d){
                  return d3.mean(d,function(d){
                    return d['BorrowerRate'];
                  });
                })
                .entries(data);

  var nested_mean = d3.nest()
                .key(function(d) {
                  var date = d['LoanOriginationDate'];
                  return new Date(date.getUTCFullYear(),Math.floor(date.getMonth()/3)*3,1);
                })
                .rollup(function(d){
                  return d3.mean(d,function(d){
                    return d['BorrowerRate'];
                  });
                })
                .entries(data);

  var quarters = get_quarters(nested);
  
  // Ending plotting scales and making converters
  // from here we start plotting dots and making graphs

  function update(q,nested_data,highlighted = true, toolt = ""){
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
        .text("Average Borrow's rate up to quarter starting at " + q);

    var line = d3.svg.line()
                .x(x_coord)
                .y(y_coord);
        
    svg.selectAll("path")
      .data(filtered,key_func)
      .exit()
      .remove();
      
    var line_stroke = "gray",
        stroke_width = 2;
        
    var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",1)
        .style("visibility", "hidden")
        .text(toolt);

    if (highlighted == true){
        var circles = svg.selectAll('circles')
                         .data(filtered,key_func);
                         
        circles.exit().remove();

        circles.enter()
          .append("circle")
          .on("mouseover", function(){
              debugger;
              return tooltip.style("visibility", "visible");})
          .transition()
          .duration(100)
          .attr("cx", x_coord)
          .attr("cy", y_coord)
          .style("fill-opacity",1.0);

/*
          .on("mouseover", function(d){
              div.transition()
                .duration(200)
                .style("opacity",.9);
              div.html("cat")
                .style("left",(d3.event.pageX) + "px")
                .style("top",(d3.event.pageY - 28) + "px");
          })
          .on("mouseout",function(d){
              div.transition()
                .duration(500)
                .style("opacity",0);
          })          
*/          
        line_stroke = "black";
        stroke_width = 3;
    }

    var lines = d3.select("svg")
      .append("g")
      .append("path");
      
    function bring_text_up(){
        lines.style("stroke","black")
             .style("opacity",.9);
        return tooltip.style("visibility", "visible")
                      .style("left",(d3.event.pageX) + "px")
                      .style("top",(d3.event.pageY - 28) + "px");
    }    
     
    lines
      .on("mouseover", function(){
        bring_text_up();
      })
/*      .on("mousemove", function(){
        bring_text_up();
      })*/
      .on("mouseout", function(){
          lines.style("stroke","gray")
               .style("opacity",.0);
          return tooltip.transition().duration(500).style("visibility", "hidden");})
      .transition()
      .duration(100)
      .attr("class","line")
      .attr("class","point-clips")
      .attr("class","point-paths")
      .attr("d",line(filtered))
      .style("stroke-width",stroke_width)
      .style("stroke",line_stroke)
      .style("fill", "none");

//      .append("svg:title")
//      .text("muu");
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
      .transition()
      .duration(100)
      .style("fill-opacity",0.7)
      .style("fill", function(d){
        return heatmapColor(d['CreditScoreRangeLower']);
      });
      
      var clear_timeout = setTimeout(function() {
        var existing_circles = d3.selectAll("circle").remove();
      }, 5000);
  }
  
  function calculate_credit_score(score){
    if (score == 0){
      return "0-299"
    }
    else {
      return score + "-" + +score+19;
    }
  }
  
  function update_credit_scores(idx,creditscore_data){
    for (var key in creditscore_data){
        debugger;
        update(idx,creditscore_data[key].values,false,calculate_credit_score(creditscore_data[key].key));
    }
  }
  
  function interval_plotting(timeout){
    var quarter_idx = 0,
        function_idx = 0;
    var functions = [update,update_credit_scores],
        pfunc = functions[0],
        used_data = [nested_mean,nested_cscore];

    // Timer for plotting first in time and then in through credit scores
    var interval = setInterval(function(){
      if(quarter_idx < quarters.length){
          pfunc(quarters[quarter_idx],used_data[function_idx]);
          quarter_idx++;
      }
      else {
        function_idx++;
        if (function_idx < functions.length){
            pfunc = functions[function_idx];
            quarter_idx = 0;
        }
        else {
            clearInterval(interval);
            d3.selectAll("circle").remove();
            
            // this is where we start context sensitivy and interactivity
        }
      }
    },timeout);
  }
  
//  scatter_plot(data);
  interval_plotting(100);
};

var format = d3.time.format("%m/%d/%Y %H:%M")

d3.csv("data/prosperLoanData.csv", function(d) {
  d['BorrowerRate'] = +d['BorrowerRate'];
  d['StatedMonthlyIncome'] = +d['StatedMonthlyIncome'];
  d['CreditScoreRangeLower'] = +d['CreditScoreRangeLower'];
  d['LoanOriginationDate'] = format.parse(d['LoanOriginationDate']);
  return d;      
}, draw);
