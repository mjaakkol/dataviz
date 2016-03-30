
function key_func(d){
    return d['key'];
}

function get_quarters(nested_q){
    var quarters = [],
        i = 0;

    for(; i < nested_q.length ; ++i){
        quarters.push(new Date(nested_q[i].key));
    }
    debugger;
    return quarters.sort(function(a,b){
        return b-a;
    });
}


function draw(data) {
  "use strict";
  var margin = 50,
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
  interest_extent[1] = 0.38;
  
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

  d3.select("svg")
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(time_axis);

  d3.select("svg")
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin + ",0)")
    .call(interest_axis);

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
                  return d['CreditScoreRangeLower']
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
  debugger;
  function plot_points(data,plot_type){
    d3.selectAll("circle")
      .attr("cx", function(d) {
          return time_scale(d["LoanOriginationDate"]);
      })
      .attr("cy", function(d) {
          return interest_scale(d["BorrowerRate"]);
      })
      .attr("r", 1.5)
      .transition()
      .duration(1000)
      .style("fill-opacity",0.7)
      .style("fill", function(d){
        return heatmapColor(d['CreditScoreRangeLower']);
      });
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
      .duration(1000)
      .style("fill-opacity",0.7)
      .style("fill", function(d){
        return heatmapColor(d['CreditScoreRangeLower']);
      });
      
      var clear_timeout = setTimeout(function() {
        var existing_circles = d3.selectAll("circle").remove();
      }, 10000);
  }
  
  function line_chart(data){
    
  }
  
  function interval_plotting(pfunc,inner_length,outter_length,timeout){
    var quarter_idx = 0,
        credit_score_idx = 0;
    // Timer for plotting first in time and then in through credit scores
    var interval = setInterval(function(){
      if(quarter_idx < outter_length){
        if(credit_score_idx < inner_length){
          pfunc(quarter_idx,credit_score_idx)          
        }
      }
      else {
        clearInterval(interval);
      }
    },timeout);
  }
  
  //scatter_plot(data);
  interval_plotting()
};

var format = d3.time.format("%m/%d/%Y %H:%M")

d3.csv("data/prosperLoanData.csv", function(d) {
  d['BorrowerRate'] = +d['BorrowerRate'];
  d['StatedMonthlyIncome'] = +d['StatedMonthlyIncome'];
  d['CreditScoreRangeLower'] = +d['CreditScoreRangeLower'];
  d['LoanOriginationDate'] = format.parse(d['LoanOriginationDate']);
  return d;      
}, draw);
