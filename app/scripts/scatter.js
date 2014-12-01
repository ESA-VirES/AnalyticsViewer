




function scatterPlot(args, callback) {

	//this.margin = {top: 20, right: 20, bottom: 90, left: 70};
	this.margin = {top: 0, right: 120, bottom: 0, left: 0};
	this.headerNames = null;
	this.selector = args.selector;
	this.colors = args.colors;
	this.col_date = [] ;
	this.col_vec = [] ;
	this.sel_x = "";
	this.sel_y = "";
	this.identifiers = [];
	this.active_brushes = [];
	this.brush_extents = {};

	this.tooltip = d3.select("body").append("div")   
        .attr("class", "point-tooltip")
		.style("opacity", 0);

	var self = this;

	if(args.url){
		d3.csv(args.url, function(error, values) {
			self.parseData(values);
			self.render();
			self.parallelsPlot();
	    	callback();
  		});
	}else if(args.data){
		//this.data = ;
		this.parseData(d3.csv.parse(args.data));
		this.render();

	    callback();
	}

	

}


scatterPlot.prototype.parseData = function parseData(values){

	var format_date = "%d/%m/%Y" ;
	var exp_date = /^(\d){4}-(\d){2}-(\d){2}/
	var value;
	var self = this;


	self.data = values;
	// Extract the list of dimensions
    // For each dimension, guess if numeric value or not and create vert scales
    all_dims = d3.keys(self.data[0]) ;
    // Filter hidden dimensions
    dimensions = d3.keys(self.data[0]).filter(function(key) {
    	// TODO temporary if to remove flags, shall be removed
    	if (key.indexOf("Flag") > -1 ||
    		key.indexOf("ASM") > -1 ||
    		key.indexOf("q_NEC") > -1 ||
    		key.indexOf("dF_") > -1 ||
    		key.indexOf("other") > -1 ||
    		key.indexOf("error") > -1 ||
    		key.indexOf("dB_") > -1 ||
    		key.indexOf("VFM") > -1 ||
    		key.indexOf("Status") > -1 ){
    		self.data.forEach (function(p) {delete p[key];}) ; 
    	}else{
	    	// Check if column is a date
	    	if(exp_date.test(self.data[1][key])){
	    		self.data.forEach (function(p) {p[key] = new Date(p[key]);}) ; 
	    		self.col_date.push(key);
	    	// Column is vector data
	    	}else if(self.data[1][key].charAt(0)=="{"){
	    		self.data.forEach (function(p) {
	    			var val = p[key].substring(1, p[key].length-1);
	    			var vector = val.split(";");
	    			for (var i = vector.length - 1; i >= 0; i--) {
	    				// vector[i] = parseFloat(vector[i]);
	    				var new_key;
	    				switch (i){
	    					case 0: new_key="B_N"; break;
	    					case 1: new_key="B_E"; break;
	    					case 2: new_key="B_C"; break;
	    				}
	    				//new_key = key + new_key;
	    				p[new_key] = parseFloat(vector[i]);
	    			};
	    			delete p[key];
	    			// p[key] = vector;
	    			// self.col_vec.push(key);
	    		}) ;

	    	// Check if column is a float value
	    	}else if (value = parseFloat(self.data[1][key])){
	    		self.data.forEach (function(p) {p[key] = parseFloat(p[key]);}) ;
	    	}
	    }
	});

	// Add an active tag to know if row is filtered out or not, used for filtering with parallels
	// Initially all set to true, as no filters yet active
	self.data.forEach (function(p) {p["active"] = 1;}) ;

	self.headerNames = d3.keys(self.data[0]);
	self.headerNames.sort();
	self.identifiers = d3.set(self.data.map(function(d){return d.id;})).values();

	if(self.colors)
		self.colors = arg.colors;
	else
		self.colors = d3.scale.ordinal().domain(self.identifiers).range(d3.scale.category10().range());
		

	// Remove id element
	var index = self.headerNames.indexOf("id");
	if (index > -1) {
		self.headerNames.splice(index, 1);
	}

	self.sel_x = "Latitude";
	self.sel_y = "F";
}

scatterPlot.prototype.render = function(){

	var self = this;
	var width = $(this.selector).width() - analytics.margin.left - analytics.margin.right,
	height = $(this.selector).height() - analytics.margin.top - analytics.margin.bottom;
	height = parseInt(height/100 * 60)


	$(this.selector).empty()

	var x_select = d3.select(this.selector)
			.insert("div")
			.attr("style", "position: absolute; z-index: 100;"+
				"right:"+(analytics.margin.right)+"px;"+
				"top:"+(height+20)+"px;"+
				"bottom:"+(analytics.margin.bottom + 28)+"px;")
			.append("select")
			.attr("style", "width: 20px;");


	x_select.on("change", function(d) {
			self.sel_x = d3.select(this).property("value");
			self.render();
			self.parallelsPlot();
		}
	);

	x_select.selectAll("option")
		.data(this.headerNames)
		.enter()
		.append("option")
		.text(function (d) { 
			if(self.sel_x == d)
				d3.select(this).attr("selected","selected");
			return d; 
	});

	var y_select = d3.select(this.selector)
			.insert("div")
			.attr("style", "position: absolute; z-index: 100;"+
				"margin-left:"+(analytics.margin.left)+
				"px; margin-top:"+(analytics.margin.top-25)+"px;")
			.append("select")
			.attr("style", "width: 20px;");

	y_select.on("change", function(d) {
			self.sel_y = d3.select(this).property("value");
			self.render();
			self.parallelsPlot();
		}
	);

	y_select.selectAll("option")
		.data(this.headerNames)
		.enter()
		.append("option")
		.text(function (d) { 
			if(self.sel_y==d)
				d3.select(this).attr("selected","selected");
			return d; 
	});

	var format_x, format_y;

	var xScale, yScale;

	if (this.col_date.indexOf(this.sel_x) != -1){
		xScale = d3.time.scale().range([0, width]);
		format_x = d3.time.format('%x');
	}else{
		xScale = d3.scale.linear().range([0, width]);
		format_x = d3.format('s');
	}

	if (this.col_date.indexOf(this.sel_y) != -1){
		yScale = d3.time.scale().range([height, 0]);
		format_y = d3.time.format('%x');
	}else{
		yScale = d3.scale.linear().range([height, 0]);
		format_y = d3.format('s');
	}


	
	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")
	    .tickFormat(format_x);

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left")
	    .tickFormat(format_y);

	var svg = d3.select(this.selector).append("svg")
		.attr("class", "scatter")
	    .attr("width", width)
	    .attr("height", height)
	  	.append("g")
	    .attr("transform", "translate(" + analytics.margin.left + "," + analytics.margin.top + ")");


	if(this.col_vec.indexOf(this.sel_x) != -1){
		var length_array = [];
		this.data.forEach(function(d) {
			var vec_length = 0;
			for (var i = d[self.sel_x].length - 1; i >= 0; i--) {
				vec_length += Math.exp(d[self.sel_x][i]);
			};
			vec_length = Math.sqrt(vec_length);
			length_array.push(vec_length);
		});

		xScale.domain(d3.extent(length_array, function(d) { 
		 	return d;
		})).nice();

	}else{
		xScale.domain(d3.extent(this.data, function(d) { 
		 	return d[self.sel_x];
		})).nice();
	}

	if(this.col_vec.indexOf(this.sel_y) != -1){
		var length_array = [];
		this.data.forEach(function(d) {
			var vec_length = 0;
			for (var i = d[self.sel_y].length - 1; i >= 0; i--) {
				vec_length += Math.exp(d[self.sel_y][i]);
			};
			vec_length = Math.sqrt(vec_length);
			length_array.push(vec_length);
		});

		yScale.domain(d3.extent(length_array, function(d) { 
		 	return d;
		})).nice();

	}else{
		yScale.domain(d3.extent(this.data, function(d) { 
			return d[self.sel_y];
		})).nice();
	}

	// Define zoom behaviour based on parameter dependend x and y scales
	var zoom = d3.behavior.zoom()
	    .x(xScale)
	    .y(yScale)
	    .scaleExtent([1, 10])
	    .on("zoom", zoomed);

	// Add rect to allow zoom and pan interaction over complete graph
	svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "transparent");

	// Add clip path so only points in the area are shown
	svg.append("defs").append("clipPath")
		.attr("id", "clip")
	    .append("rect")
	        .attr("width", width)
	        .attr("height", height);


	svg.attr("pointer-events", "all");
	svg.call(zoom);

	function zoomed() {
		svg.select(".x.axis").call(xAxis);
		svg.select(".y.axis").call(yAxis);
		resize();
	}

	// Add checkbox for grid visualization
	this.grid_active = false;
	this.gridselector = d3.select(this.selector).append('input').attr('type','checkbox');
	this.gridselector.attr("style", ("position: absolute; top:" + 20 +"px; left:"+(parseInt(width/2) + this.margin.left)+"px;"));
	this.gridselector.on("change", function() {
		self.grid_active = !self.grid_active;
		// If grid is selected we expand the tick size to cover the whole plot
		if(self.grid_active){
			xAxis.tickSize(-height);
			yAxis.tickSize(-width);
			$.injectCSS({
			    ".scatter .tick line": {
			        stroke: "#D3D3D3 !important"
			    }
			});

		}else{
			xAxis.tickSize(5);
			yAxis.tickSize(5);

			$.injectCSS({
			    ".scatter .tick line": {
			        stroke: "black !important"
			    }
			});
		}
		// Update Axis to draw lines
		svg.select('.x.axis')
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    svg.select('.y.axis')
	      .call(yAxis);
	});


	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text(this.sel_x);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(this.sel_y);

	
	svg.selectAll(".dot")
		.data(this.data)
		.enter().append("circle")
		.attr("class", "area").attr("clip-path", "url(#clip)")
		.attr("class", "dot")
		.style("display", function(d) {
			return !d["active"] ? "none" : null;
		})
		.attr("r", 3.5)
		.attr("cx", function(d) { 
			if (d[self.sel_x] instanceof Array) {
				var vec_length = 0;
				for (var i = d[self.sel_x].length - 1; i >= 0; i--) {
					vec_length += Math.exp(d[self.sel_x][i]);
				};
				vec_length = Math.sqrt(vec_length);
				return xScale(vec_length);
			}else{
				return xScale(d[self.sel_x]); 
			}
		})
		.attr("cy", function(d) { 
			if (d[self.sel_y] instanceof Array) {
				var vec_length = 0;
				for (var i = d[self.sel_y].length - 1; i >= 0; i--) {
					vec_length += Math.exp(d[self.sel_y][i]);
				};
				vec_length = Math.sqrt(vec_length);
				return yScale(vec_length);
			}else{
				return yScale(d[self.sel_y]); 
			}
		 })
		.style("fill", function(d) { return self.colors(d.id); })
		.on("mouseover", function(d) {

			var values = "";
			for(var propName in d) {
			    propValue = d[propName]
			    values = values + propName + ": " + propValue + "<br>";
			}

            self.tooltip.transition()
                .duration(100)
                .style("opacity", .9);
            self.tooltip.html(values)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })           
        .on("mouseout", function(d){
            self.tooltip.transition()        
                .duration(100)      
                .style("opacity", 0);
        });

	var legend = svg.selectAll(".legend")
		.data(this.identifiers)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", function(d) { 
			return self.colors(d); 
		});

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) {return d;});


	function resize() {
	    var width = $(self.selector).width() - analytics.margin.left - analytics.margin.right,
	 		height = $(self.selector).height() - analytics.margin.top - analytics.margin.bottom;

	 	height = parseInt(height/100 * 60);

	    // Update the range of the scale with new width/height
	    xScale.range([0, width]);
	    yScale.range([height, 0]);

	    legend.select("rect")
			.attr("x", width - 18)
		
		legend.select("text")
			.attr("x", width - 24)

	    // update x axis label position
	    svg.select('.x.axis')
	    	.select('.label')
	    	.attr("x", width);

	    // Update the axis with the new scale
	    svg.select('.x.axis')
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    svg.select('.y.axis')
	      .call(yAxis);

	    /* Force D3 to recalculate and update the dots */
	    svg.selectAll(".dot")
			.attr("cx", function(d) {return xScale(d[self.sel_x]);})
			.attr("cy", function(d) {return yScale(d[self.sel_y]);});


		/* Force D3 to recalculate and update grid lines */
		/*svg.selectAll("line.horizontalGrid")
			.data(yScale.ticks()).enter()
		    .append("line")
		        .attr(
		        {
		            "class":"horizontalGrid",
		            "x2" : width,
		            "y1" : function(d){ return yScale(d);},
		            "y2" : function(d){ return yScale(d);},
		            "fill" : "none",
		            "shape-rendering" : "crispEdges",
		            "stroke" : "LightGray",
		            "stroke-width" : "1px"
		        });

		svg.selectAll("line.verticalGrid")
			.data(xScale.ticks()).enter()
		    .append("line")
		        .attr(
		        {
		            "class":"verticalGrid",
		            "x1" : function(d){ return xScale(d);},
		            "x2" : function(d){ return xScale(d);},
		            "y2" : height,
		            "fill" : "none",
		            "shape-rendering" : "crispEdges",
		            "stroke" : "LightGray",
		            "stroke-width" : "1px"
		        });*/
	}

	d3.select(window).on('resize', resize); 



}



scatterPlot.prototype.substractComponents = function substractComponents (a, b, parameter){
	this.data.forEach (function(p) {
		p[(a+"-"+b)] = p[a]-p[b];
	}) ;
	this.render();
};

scatterPlot.prototype.absolute = function absolute (productid, parameter){
	this.data.forEach (function(p) {
		if(p["id"] == productid){
			p[parameter] = Math.abs(p[parameter]);
		}
	}) ;
	this.render();
};

scatterPlot.prototype.colatitude = function colatitude (productid){
	this.data.forEach (function(p) {
		//if(p["id"] == productid){
			if(p["Latitude"]<0)
				p["Latitude"] = 90 - p["Latitude"];
		//}
	}) ;
	this.render();
};







scatterPlot.prototype.parallelsPlot = function parallelsPlot(){
	
	var el = d3.select(this.selector);

	var uniqueArray = [];
	var domain = [];

	var parameters = this.headerNames;

	// Remove parameters which are vectors and additionally timestamp
	_.each(this.col_vec.concat("Timestamp").concat("active").concat("F_wmm2010"), function(n){
		var index = parameters.indexOf(n);
		if (index > -1) {
			parameters.splice(index, 1);
		}
	});


	var	width = $(this.selector).width() - this.margin.left - this.margin.right,
		height = $(this.selector).height() - this.margin.top - this.margin.bottom;

	height = parseInt(height/100 * 40);
	height-=30;

	var x = d3.scale.ordinal().domain(parameters).rangePoints([0, width]),
	    y = {};
	    hist_data = {};
	    x_hist = {};

	var line = d3.svg.line(),
	    axis = d3.svg.axis().orient("left"),
	    foreground;

	// User general formatting for ticks on Axis
	axis.tickFormat(d3.format("g"));


	var svg = d3.select(this.selector).append("svg")
		.attr("class", "parallels")
	    .attr("width", width)
	    .attr("height", height)
	  	.append("g")
	  	.attr("display", "block")
	    .attr("transform", "translate(" + analytics.margin.left + "," + analytics.margin.top + ")");



    var self = this;
	// Create a scale and brush for each trait.
	parameters.forEach(function(d) {

	    y[d] = d3.scale.linear()
	        .range([height, 0])
	        .domain(d3.extent(self.data, function(data) { 
	        	return data[d];
			})).nice();

	    y[d].brush = d3.svg.brush()
	        .y(y[d])
	        .on("brushend", brushend);


	    var transformed_data = [];
	    _.each(self.data, function(row){
	    	if (row["active"])
    			transformed_data.push(row[d]);
    	});

	    // Generate a histogram using twenty uniformly-spaced bins.
		hist_data[d] = d3.layout.histogram()
		    .bins(y[d].ticks(60))
		    (transformed_data);
		    //(values);

		x_hist[d] = d3.scale.linear()
		    .domain([0, d3.max(hist_data[d], function(data) { 
		    	return data.length;
		    })])
		    .range([0, 40]);
	});

	// If there were active brushes before re-rendering set the brush extents again
	self.active_brushes.forEach (function(p) {
		y[p].brush.extent(self.brush_extents[p]);
	});

	var y_linear = d3.scale.linear()
	    .domain([0, 20])
	    .range([0, height]);


	parameters.forEach(function(para) {

		var bar = svg.selectAll("." + para)
		    .data(hist_data[para])
		  	.enter().append("g")
		    .attr("class", "bar "+para)
		    .attr("transform", function(d) { 
		    	return "translate(" + x(para) + "," + (y[para](d.x) - height/hist_data[para].length) + ")";
		    });

		bar.append("rect")
		    .attr("height", 
		    	height/hist_data[para].length - 1
		    )
		    .attr("width", function(d) {
		    	return x_hist[para](d.y);
			})
			.style("fill", "#1F77B4");

	});

	var colors = d3.scale.category10().domain(uniqueArray);

	// Add a group element for each trait.
	var g = svg.selectAll(".trait")
	    .data(parameters)
	    .enter().append("svg:g")
	    .attr("class", "trait")
	    .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
		  
	// Add an axis and title.
	g.append("svg:g")
	    .attr("class", "axis")
	    .each(function(d) { 
	    	d3.select(this).call(axis.scale(y[d]));
	    })
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
		return line(parameters.map(function(p) {
		  	return [x(p), y[p](d[p])];
		}));
	}

	// Handles a brush event, toggling the display of foreground lines.
	function brushend(parameter) {
		
		self.active_brushes = parameters.filter(function(p) { return !y[p].brush.empty(); });
		self.brush_extents = {};
		self.active_brushes.map(function(p) { self.brush_extents[p] = y[p].brush.extent(); });

		var active;
		
		_.each(self.data, function(row){

			active = true;

			self.active_brushes.forEach (function(p) {
		    	if (!(self.brush_extents[p][0] <= row[p] && row[p] <= self.brush_extents[p][1])){
		    		active = false;
		    	}
	    	});

			row["active"] = active ? 1 : 0;

		}); 

		self.render();
		self.parallelsPlot();

	}
}


