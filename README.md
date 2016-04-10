# Summary
This project is explaning what kind of interest rate people were paying on their loans and how loan intensity (# of loans in the given time) changed over the given time period. The project takes more detailed look on average loan rate and how averages over the credit scores relate to each other.

As a side product, the graph also shows how 2008 credit crises changes the landshape in loans.

# Design
I chose to provide overall 'drinking from firehose' view as the starting point and then narrowing the scope to summarize the firehose view and then expanding it to show more clearly how credit scores correlate with the loanrate.

The first view used scatter plot to give rough view on how load rates correlated with the credit scores where color was used the indicator of the credit scores. Scatter plot provided also clear view how the load intensity changed over the time.

The next step was to focus the view to show the overall average through line-charts as scatter plot wasn't necessarily the best tool to reveal how the overall loan rates changed over the time. Here the approach was to provide quarterly view to give enough critical mass to calculate "good" average. Line-graph also showed the change between quarters making it clearer how much the loan rate changed.

This was a very narrow view so I added the same view so that each credit score category was plotted as own lines. This was the point where narrative storyline ended and the user could explore the lines more details through dynamic animations (effectively tooltips and color changes in lines). Credit scores were coded using colors that was something that I was debating in my mind but chose to do it over gray-scaling or just using tooltips. Let's see what the audience likes on the choices.

# Feedback

# Resources
https://github.com/mbostock/d3 http://www.w3schools.com/js/default.asp https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date http://stackoverflow.com/questions/21787200/d3-mapping-4-colors-to-4-numeric-ranges-to-look-a-bit-like-a-very-basic-heatmap http://stackoverflow.com/questions/19595972/d3-js-converting-months-to-quarter http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html http://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js http://www.w3schools.com/colors/colors_hex.asp
