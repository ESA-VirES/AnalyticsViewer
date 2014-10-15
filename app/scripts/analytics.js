var analytics = {

	margin : {top: 20, right: 20, bottom: 90, left: 70},
	
	scatterPlot: function(arg){

		colors = null;
		if(arg.colors)
			colors = arg.colors;
		else
			colors = d3.scale.category10();
	
		this.data = null;
		this.headerNames = null;
		selector = arg.selector;

		sel_x = "";
		sel_y = "";

		var col_date = [] ; // you can force date type for some data
		var format_date = "%d/%m/%Y" ; // Cf d3.time.format 
		// and for automatic detection
		var exp_date = /^(\d){4}-(\d){2}-(\d){2}/
		var value;


		d3.csv("data/data.csv", function(error, data) {

			// Extract the list of dimensions
		    // For each dimension, guess if numeric value or not and create vert scales
		    all_dims = d3.keys(data[0]) ;
		    // Filter hidden dimensions
		    dimensions = d3.keys(data[0]).filter(function(key) {
		    	// Check if column is a date
		    	if(exp_date.test(data[1][key])){
		    		data.forEach (function(p) {p[key] = new Date(p[key]);}) ; 
		    		col_date.push(key);
		    	// Check if column is a float value
		    	}else if (value = parseFloat(data[1][key])){
		    		data.forEach (function(p) {p[key] = parseFloat(p[key]);}) ;
		    	}
			});

  			headerNames = d3.keys(data[0]);

  			identifiers = d3.set(data.map(function(d){return d.id;})).values();

  			colors = null;
			if(arg.colors)
				colors = arg.colors;
			else
				colors = d3.scale.ordinal().domain(identifiers).range(d3.scale.category10());

  			// Remove id element
  			var index = headerNames.indexOf("id");
  			if (index > -1) {
				headerNames.splice(index, 1);
			}

			sel_x = headerNames[0];
			sel_y = headerNames[1];


        	renderplot(this.selector, data, "Latitude", "Longitude");
      	});

      	function renderplot(selector, data){


      		var width = $(selector).width() - analytics.margin.left - analytics.margin.right,
				height = $(selector).height() - analytics.margin.top - analytics.margin.bottom;

			var max_x, max_y;

			$(selector).empty()

			var x_select = d3.select(selector)
      			.insert("div")
      			.attr("style", "position: absolute; z-index: 100;"+
      				"right:"+(analytics.margin.right)+
      				"px; bottom:"+(analytics.margin.bottom + 28)+"px;")
      			.append("select")
      			.attr("style", "width: 20px;");

    		x_select
      			.on("change", function(d) {
        			sel_x = d3.select(this).property("value");
        			renderplot(selector, data, sel_x, sel_y);
      			}
      		);

      		x_select.selectAll("option")
      			.data(headerNames)
      			.enter()
        		.append("option")
        		.text(function (d) { 
        			d3.select(this).attr("selected","selected");
        			return d; 
        	});

        	var y_select = d3.select(selector)
      			.insert("div")
      			.attr("style", "position: absolute; z-index: 100;"+
      				"margin-left:"+(analytics.margin.left)+
      				"px; margin-top:"+(analytics.margin.top-25)+"px;")
      			.append("select")
      			.attr("style", "width: 20px;");

    		y_select
      			.on("change", function(d) {
        			sel_y = d3.select(this).property("value");
        			renderplot(selector, data, sel_x, sel_y);
      			}
      		);

      		y_select.selectAll("option")
      			.data(headerNames)
      			.enter()
        		.append("option")
        		.text(function (d) { 
        			if(sel_y==d)
        				d3.select(this).attr("selected","selected");
        			return d; 
        	});

        	var format_x, format_y;
        	var x, y;

       
        	if (col_date.indexOf(sel_x) != -1){
				x = d3.time.scale().range([0, width]);
        		format_x = d3.time.format('%x');
        	}else{
        		x = d3.scale.linear().range([0, width]);
        		format_x = d3.format('s');
        	}

        	if (col_date.indexOf(sel_y) != -1){
        		y = d3.time.scale().range([height, 0]);
        		format_y = d3.time.format('%x');
        	}else{
        		y = d3.scale.linear().range([height, 0]);
        		format_y = d3.format('s');
        	}


			
			var color = d3.scale.category10();

			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom")
			    .tickFormat(format_x);

			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .tickFormat(format_y);

      		var svg = d3.select(selector).append("svg")
			    .attr("width", width)
			    .attr("height", height)
			  .append("g")
			    .attr("transform", "translate(" + analytics.margin.left + "," + analytics.margin.top + ")");

			d3.max(data, function(d) { return d.y; })

			x.domain(d3.extent(data, function(d) { 
			 	return d[sel_x];
			})).nice();

			y.domain(d3.extent(data, function(d) { 
				return d[sel_y];
			})).nice();


			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text(sel_x);

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text(sel_y);

			svg.selectAll(".dot")
				.data(data)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("r", 3.5)
				.attr("cx", function(d) { return x(d[sel_x]); })
				.attr("cy", function(d) { return y(d[sel_y]); })
				.style("fill", function(d) { return colors(d.id); });

			var legend = svg.selectAll(".legend")
				.data(identifiers)
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", function(d) { return colors(d); });

			legend.append("text")
				.attr("x", width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) {return d;});

		}

      	
	},

	nv_scatterPlot: function(arg){
		var colors = null;
		if(arg.colors)
			colors = arg.colors;
		else
			colors = d3.scale.category10();

		keyColor = function(d, i) {
			var n = d.key.lastIndexOf("_");
			var key = d.key.substring(0, n);
			return colors(key);
		};
		
		var chart = nv.models.scatterChart()
            .showDistX(true)
            .showDistY(true)
            .useVoronoi(true)
            .color(keyColor)
            //.transitionDuration(300);

			chart.xAxis.tickFormat(d3.format());
			chart.yAxis.tickFormat(d3.format());
			chart.tooltipContent(function(key) {
				return '<p>' + key + '</p>';
			});

     	var el = d3.select(arg.selector);
		var el = d3.select(arg.selector);
		$(arg.selector).empty();
		var width = $(arg.selector).width() - analytics.margin.left - analytics.margin.right,
			height = $(arg.selector).height() - analytics.margin.top - analytics.margin.bottom;

		var mine = d3.csv.parse(arg.data);
   		el.append("svg")
			.attr("display", "block")
			.attr("width", width)
		    .attr("height", height)
			.datum(convertData(mine))
			.call(chart);

  		nv.utils.windowResize(chart.update);

		chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

		function convertData(inputData) {
		   var data = [];
		   var uniqueArray = [];

			for (i = 0; i < inputData.length; i++) {
				var array = $.map(inputData[i], function(value, index) {
				    return [value];
				});
				if (uniqueArray.indexOf(array[0]) == -1)
				{
					uniqueArray.push(array[0]);
					data.push({
						key: array[0],
						values: []
					});
				}
			}

			//console.log(uniqueArray);
			 
			for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] == uniqueArray[j])
					{
						data[j].values.push({
						  x: parseFloat(array[1])
						, y: parseFloat(array[2])
						, size: parseFloat(array[3])
						});
					}
				}	   
			}
			return data;
		}

	},

	boxPlot: function(arg){

		var colors = null;
		if(arg.colors)
			colors = arg.colors;
		else
			colors = d3.scale.category10();

		keyColor = function(d, i) {
			var n = d.key.lastIndexOf("_");
			var key = d.key.substring(0, n);
			return colors(key);
		};
		
		var el = d3.select(arg.selector);
		$(arg.selector).empty();

    	var width = $(arg.selector).width() -analytics.margin.left - analytics.margin.right,
		    height = $(arg.selector).height() -analytics.margin.top - analytics.margin.bottom;

		var box_separation = 40;
		
		var min = Infinity,
		    max = -Infinity;

		
		var mine = d3.csv.parse(arg.data);
		var data = convertData(mine);

		var calc_width = width/data.length - box_separation*2;
		if (calc_width > 100)
			calc_width = 100;
	
		var chart = d3.box()
			.whiskers(iqr(1.5))
			.width(calc_width)
			.height(height - analytics.margin.top - analytics.margin.bottom);

        chart.domain([min, max]);

        var svg = el.selectAll("svg")
			.attr("display", "none")
			.append("g")
			.data(data)
			.enter().append("svg")
			.attr("class", "box")
			.attr("width", width/data.length)
			.attr("height", height + analytics.margin.bottom + analytics.margin.top)
			.append("g")
			.attr("transform", "translate(" + ( width/data.length/2 - calc_width/2) + "," + analytics.margin.top + ")")
			.call(chart)
			.attr("stroke", keyColor);
		  
			  

		function convertData(inputData) {

			var data = [];
			var uniqueArray = [];

			/*for (i = 0; i < inputData.length; i++) {
				var array = $.map(inputData[i], function(value, index) {
				    return [value];
				});
				if (uniqueArray.indexOf(array[0]) == -1)
				{
					uniqueArray.push(array[0]);
				}
			}*/
			for (i = 0; i < inputData.length; i++) {
				var array = $.map(inputData[i], function(value, index) {
				    return [value];
				});
				if (uniqueArray.indexOf(array[0]) == -1)
				{
					uniqueArray.push(array[0]);
					data.push({
						key: array[0],
						values: []
					});
				}
			}
			 
			/*for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] != uniqueArray[j]) continue;
				    var e = j,
				        s = parseFloat(array[1]),
				        d = data[e];
				    if (!d) d = data[e] = [s];
				    else d.push(s);
				    if (s > max) max = s;
				    if (s < min) min = s;
				}	   
			}*/

			/*for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] == uniqueArray[j])
					{
						data[j].values.push({
						  0: new Date(array[1])
						, 1: parseFloat(array[2])
						});
					}
				}	   
			}*/

			for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] != uniqueArray[j]) continue;
				    var e = j,
				        s = parseFloat(array[1]),
				        d = data[e];
				    if (!d)
				    	d = data[e] = [s];
				    else
				    	data[j].values.push(s);
				    if (s > max) max = s;
				    if (s < min) min = s;
				}	   
			}

			return data;
		}
	},

	stackedPlot: function(arg){
		var colors = d3.scale.category20();
		keyColor = function(d, i) {return colors(d.key)};

     	var el = d3.select(arg.selector);
		var el = d3.select(arg.selector);
		$(arg.selector).empty();
		var width = $(arg.selector).width() - analytics.margin.left - analytics.margin.right,
			height = $(arg.selector).height() - analytics.margin.top - analytics.margin.bottom;

			
		var chart = nv.models.stackedAreaChart()
                .useInteractiveGuideline(true)
                .x(function(d) { return d[0] })
                .y(function(d) { return d[1] })
                .color(keyColor)
                .transitionDuration(300);
                //.clipEdge(true);

		chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
		chart.yAxis.tickFormat(d3.format('.02f'));
		
		var mine = d3.csv.parse(arg.data);
		
		el.append("svg")
			.attr("display", "block")
			.attr("width", width)
		    .attr("height", height)
			.datum(convertData(mine))
			.transition().duration(1000)
			.call(chart)
			.each('start', function() {
				setTimeout(function() {
					el.selectAll('svg *').each(function() {
					if(this.__transition__)
						this.__transition__.duration = 1;
					})
				}, 0)
			})

		nv.utils.windowResize(chart.update);
  
		function convertData(inputData) {
		   var data = [];
		   var uniqueArray = [];

			for (i = 0; i < inputData.length; i++) {
				var array = $.map(inputData[i], function(value, index) {
				    return [value];
				});
				if (uniqueArray.indexOf(array[0]) == -1)
				{
					uniqueArray.push(array[0]);
					data.push({
						key: array[0],
						values: []
					});
				}
			}
			 
			for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] == uniqueArray[j])
					{
						data[j].values.push({
						  0: new Date(array[1])
						, 1: parseFloat(array[2])
						});
					}
				}	   
			}
			return data;
		}
	},


	linePlot: function(arg){

		var colors = null;
		if(arg.colors)
			colors = arg.colors;
		else
			colors = d3.scale.category10();

		keyColor = function(d, i) {
			return colors(d.key)
		};

     	var el = d3.select(arg.selector);

		//var data = d3.csv.parse(arg.data);


		$(arg.selector).empty();
		var width = $(arg.selector).width() - analytics.margin.left - analytics.margin.right,
			height = $(arg.selector).height() - analytics.margin.top - analytics.margin.bottom;

		var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
                .x(function(d) { return d[0] })
                .y(function(d) { return d[1] })
                .color(keyColor)
		;

		chart.xAxis     //Chart x-axis settings
			.axisLabel('Time')
		  	.tickFormat(function(d) { return d3.time.format('%x %Hh')(new Date(d)) });

		chart.yAxis     //Chart y-axis settings
		  .axisLabel('Values')
		  .tickFormat(d3.format('.02f'));

		var data = convertData(d3.csv.parse(arg.data));

		/*var chart = nv.models.stackedAreaChart()
                .useInteractiveGuideline(true)
                .x(function(d) { return d[0] })
                .y(function(d) { return d[1] })
                .color(keyColor)
                .transitionDuration(300);
                //.clipEdge(true);

		chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
		chart.yAxis.tickFormat(d3.format());*/
		
		
		
		el.append("svg")
			.attr("display", "block")
			.attr("width", width)
		    .attr("height", height)
			.datum(data)
			.call(chart)
			

		nv.utils.windowResize(chart.update);
  
		function convertData(inputData) {
		   var data = [];
		   var uniqueArray = [];

			for (i = 0; i < inputData.length; i++) {
				var array = $.map(inputData[i], function(value, index) {
				    return [value];
				});
				if (uniqueArray.indexOf(array[0]) == -1)
				{
					uniqueArray.push(array[0]);
					data.push({
						key: array[0],
						values: []
					});
				}
			}
			 
			for (j = 0; j < uniqueArray.length; j++) {
				for (k = 0; k < inputData.length; k++)
				{
					var array = $.map(inputData[k], function(value, index) {
					    return [value];
					});
					if (array[0] == uniqueArray[j])
					{
						data[j].values.push({
						  0: new Date(array[1])
						, 1: parseFloat(array[2])
						});
					}
				}	   
			}
			return data;
		}
	},


	parallelsPlot: function(arg){
		var el = d3.select(arg.selector);
		$(arg.selector).empty();

		var traits = [];
		var uniqueArray = [];
		var domain = [];
		var data = new Object();

		var mine = d3.csv.parse(arg.data);	
		for (i = 0; i < mine.length; i++) {
			var array = $.map(mine[i], function(value, index) {
			    return [value];
			});
			if (uniqueArray.indexOf(array[0]) == -1)
			{
				uniqueArray.push(array[0]);
			}
		}

		for (i = 0; i < mine.length; i++) {
			$.each(mine[i], function(value, index) {
			    if(typeof(data[value]) == 'undefined' || data[value] == null){
			    	data[value] = [parseFloat(index)];
			    }else{
			    	data[value].push(parseFloat(index))
			    }
			});
		}

		var L = mine.length;
		var firstId = 0;
		var obj = mine[0];
		for (var j in obj) {
		    if (firstId != 0)
			{
				traits.push(j);
			}
			else
			{
				firstId = 1;
			}
		}
	
		var species = uniqueArray;

    	var	width = $(arg.selector).width() - analytics.margin.left - analytics.margin.right,
			height = $(arg.selector).height() - analytics.margin.top - analytics.margin.bottom;

		var x = d3.scale.ordinal().domain(traits).rangePoints([0, width]),
		    y = {};

		var line = d3.svg.line(),
		    axis = d3.svg.axis().orient("left"),
		    foreground;

		var svg = el.append("svg:svg")
			.attr("class", "svg")
			.attr("display", "block")
			.attr("width", "100%")
		    .attr("height", "100%")
		  	.append("svg:g")
		    .attr("transform", "translate(" + analytics.margin.left + "," + analytics.margin.top + ")");


		  // Create a scale and brush for each trait.
		  console.log(data);
		  traits.forEach(function(d) {
		  	console.log(d,d3.min(data[d]),d3.max(data[d]));
		    y[d] = d3.scale.linear()
		        .domain([d3.min(data[d]),d3.max(data[d])])
		        .range([height, 0]);

		    y[d].brush = d3.svg.brush()
		        .y(y[d])
		        .on("brush", brush);
		 });

		  var colors = d3.scale.category10().domain(uniqueArray);

		 
		  // Add a legend.
		  var legend = svg.selectAll("g.legend")
		      .data(species)
		    .enter().append("svg:g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 584) + ")"; });

		  legend.append("svg:line")
		      .attr("class", String)
		      .attr("x2", 8)
		      .attr("stroke",function(d) {
		      	return colors(d);
		      });

		  legend.append("svg:text")
		      .attr("x", 12)
		      .attr("dy", ".31em")
		      .text(function(d) { return "Item " + d; });

		 
		  // Add foreground lines.
		  foreground = svg.append("svg:g")
		      .attr("class", "foreground")
		    .selectAll("path")
		      .data(mine)
		    .enter().append("svg:path")
		      .attr("d", path)
		      .attr("stroke",function(d) {
		      	var array = $.map(d, function(value, index) {
				    return [value];
				});
		      	return colors(array[0]);
		      })
		      .attr("class", function(d) {
		      	var array = $.map(d, function(value, index) {
				    return [value];
				});
		       	return array[0]; 
	   		  });

		  // Add a group element for each trait.
		  var g = svg.selectAll(".trait")
		      .data(traits)
		    .enter().append("svg:g")
		      .attr("class", "trait")
		      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
			  
		  // Add an axis and title.
		  g.append("svg:g")
		      .attr("class", "axis")
		      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
		    .append("svg:text")
		      .attr("text-anchor", "middle")
		      .attr("y", -9)
		      .text(String);


		  // Add a brush for each axis.
		  g.append("svg:g")
		      .attr("class", "brush")
		      .each(function(d) { d3.select(this).call(y[d].brush); })
		    .selectAll("rect")
		      .attr("x", -8)
		      .attr("width", 16);

		// Returns the path for a given data point.
		function path(d) {
		  return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
		}

		// Handles a brush event, toggling the display of foreground lines.
		function brush() {
			var actives = traits.filter(function(p) { return !y[p].brush.empty(); }),
				extents = actives.map(function(p) { return y[p].brush.extent(); });

			foreground.classed("fade", function(d) {
				return !actives.every(function(p, i) {
					return extents[i][0] <= d[p] && d[p] <= extents[i][1];
				});
			});
		}
	},
}