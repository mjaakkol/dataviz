# Summary
This project is explaning what kind of interest rate people were paying on their loans and how loan intensity (# of loans in the given time) changed over the given time period. The project takes more detailed look on average loan rate and how averages over the credit scores relate to each other.

As a side product, the graph also shows how 2008 credit crises changes the landshape in loans.

# Design
I chose to provide overall 'drinking from firehose' view as the starting point and then narrowing the scope to summarize the firehose view and then expanding it to show more clearly how credit scores correlate with the loanrate.

The first view used scatter plot to give rough view on how load rates correlated with the credit scores where color was used the indicator of the credit scores. Scatter plot provided also clear view how the load intensity changed over the time.

The next step was to focus the view to show the overall average through line-charts as scatter plot wasn't necessarily the best tool to reveal how the overall loan rates changed over the time. Here the approach was to provide quarterly view to give enough critical mass to calculate "good" average. Line-graph also showed the change between quarters making it clearer how much the loan rate changed.

This was a very narrow view so I added the same view so that each credit score category was plotted as own lines. This was the point where narrative storyline ended and the user could explore the lines more details through dynamic animations (effectively tooltips and color changes in lines). Credit scores were coded using colors that was something that I was debating in my mind but chose to do it over gray-scaling or just using tooltips. Let's see what the audience likes on the choices.

# Feedback
Feedback #1:
Scatter plot did "open" to the first reviewer and it needed explaining. That was due to the fact that the person wasn't that familiar with the scatter plots but also the context was kind of new. The graph was too dark not really showing the intensity that well. Also the next button didn't "call for" anybody to press it.

The line-graphs were more evident but the tooltip feature was missed altogether at the starts.

Changes made based on the first reviewers feedback:
- Opacity decreases a bit to bring out the busy periods better
- The text for the button was changed into more "assertive" version to call people to press it
- Tooltip text-size and style was changed to make it standout a bit better.

Feedback #2:
It would be nice to be able to zoom into a given area to see better view how different loans land.

It would be cool if clicking on credit score would make only those values to stay on screen. Effectively, this would mean filtering data per credit scores.

It would be nice if there was a way to compare the same loan amounts against the loan rates in the scatter plot.

When moving the mouse pointer over the click-button, it shouldn't make the cursor look like text editing mouse. 

The second screen looked very good but even there it would be nice to get the quarter displayed on the place were mouse pointer is placed. 

Changes to be made due  the reviewer's feedback:
The zoom idea is good but that's too much work for the given project. Not planning to implement.

The second suggestion is potentially something I could consider implementing. There is some work but not a crazy amount.

The purpose of the graph is not to communicate the load amounts so the feedback is more about wanting to see a completely different view than (maybe still using scatter-plot) providing feedback to this graph.

The click-button issues will be addressed on the following versions. Also the quarter information can be added and it just need to be investigated if it really clarifies anything or just messes things up.

Feedback #3:
Some explanation of the context would have been nice (doesn't necessarily pop up from the graph).

Axis could have been labeled and fonts should have been bigger for both the title as well as for scale and axis. The design looks a bit old style due to selected fonts. The fonts in today's web-pages are bigger and softer.

Reviewer clicked the tooltip line and expected some action but couldn't specify what. It wasn't necessarily clear if something should have been added there. 

All and all the reviewer loved the last picture.

Changes to be made due  the reviewer's feedback:
Font sizes will be increased but not necessarily the style in the scope of this project. I won't necessarily be adding new labels for axis as wanting to keep the minimalist design and there is % signs and it is very clear that x axis is about the time so if the reader just slows down a bit he/she can see what the axis are about (especially as title says it as well). There is some value of keeping the picture simple and this was the only reviewer bringing the topic up.

# Resources
https://github.com/mbostock/d3 http://www.w3schools.com/js/default.asp https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date http://stackoverflow.com/questions/21787200/d3-mapping-4-colors-to-4-numeric-ranges-to-look-a-bit-like-a-very-basic-heatmap http://stackoverflow.com/questions/19595972/d3-js-converting-months-to-quarter http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html http://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js http://www.w3schools.com/colors/colors_hex.asp
