




function scatterPlot(args, callback, mouseover) {

	//this.margin = {top: 20, right: 20, bottom: 90, left: 70};
	this.mouseover = mouseover;
	this.margin = {top: 0, right: 120, bottom: 0, left: 0};
	this.headerNames = null;
	this.selector = args.selector;
	this.colors = args.colors;
	this.parameter_colors = null;
	this.col_date = [] ;
	this.col_vec = [] ;
	this.sel_x = "";
	this.sel_y = [];
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

	this.format_date = "%H:%M:%S" ;
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
	    				if(key == "B_NEC"){
		    				var new_key;
		    				switch (i){
		    					case 0: new_key="B_N"; break;
		    					case 1: new_key="B_E"; break;
		    					case 2: new_key="B_C"; break;
		    				}
		    				//new_key = key + new_key;
		    				p[new_key] = parseFloat(vector[i]);

		    			}else if(key == "B_NEC_res_chaos5"){
		    				// vector[i] = parseFloat(vector[i]);
		    				var new_key;
		    				switch (i){
		    					case 0: new_key="B_N_res"; break;
		    					case 1: new_key="B_E_res"; break;
		    					case 2: new_key="B_C_res"; break;
		    				}
		    				//new_key = key + new_key;
		    				p[new_key] = parseFloat(vector[i]);
		    			}
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

	// Create colorscale for all available parameters

	this.parameter_colors = d3.scale.ordinal().domain(dimensions).range(d3.scale.category20().range().reverse());

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
	self.sel_y = ["F"];
}

scatterPlot.prototype.render = function(){

	var self = this;
	var width = $(this.selector).width() - analytics.margin.left - analytics.margin.right,
	height = $(this.selector).height() - analytics.margin.top - analytics.margin.bottom;
	height = parseInt(height/100 * 60)

	$(this.selector).empty()


	d3.select(this.selector).append("canvas")   
        .attr("width", $(this.selector).width())
        .attr("height", $(this.selector).height())
        .attr("style", "display: none");

	d3.select(this.selector).append("button")   
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "save")
        .attr("style", "position: absolute; right: 45px; top: 7px")
        .text("Save");


	d3.select("#save").on("click", function(){
		var html = d3.select(".scatter")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().parentNode.innerHTML;

		var c = document.querySelector("canvas");
		var ctx = c.getContext('2d');
		ctx.drawSvg(html, 0, 0, $(this.selector).width(), height);

		var a = document.createElement("a");
		a.download = "sample.png";
		a.href = c.toDataURL("image/png");

		var pngimg = '<img src="'+a.href+'">'; 
		d3.select("#pngdataurl").html(pngimg);

		a.click();

	});

	// Add button for grid toggle
	this.grid_active = false;
	this.gridselector = d3.select(this.selector).append("button")   
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "grid")
        .attr("style", "position: absolute; right: 110px; top: 7px")
        .text("Toggle Grid");


	var x_select = d3.select(this.selector)
			.insert("div")
				.attr("class", "xselectdropdown")
				.attr("style", "position: absolute; z-index: 100;"+
					"right:"+(analytics.margin.right)+"px;"+
					"top:"+(height+20)+"px;")
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
			.attr("style", "position: absolute;"+
				"margin-left:"+(analytics.margin.left + 10)+
				"px; margin-top:"+(analytics.margin.top-40)+"px;")
			.append("select")
				.attr("multiple", "multiple");


	y_select.selectAll("option")
		.data(this.headerNames)
		.enter()
		.append("option")
		.text(function (d) { 
			if(self.sel_y.indexOf(d) != -1)
				d3.select(this).attr("selected","selected");
			d3.select(this).attr("value", d)
			return d; 
		});

	$(y_select).SumoSelect({ okCancelInMulti: true });


	$(".SumoSelect").change(function(evt){

		var sel_y = [];
		_.each($(this).find(".optWrapper .selected"), function(elem){
			sel_y.push(elem.dataset.val);
		});

		self.sel_y = sel_y;
		self.render();
		self.parallelsPlot();
	
	});

	var color = d3.scale.category10();



	// Definition and creation of scatter plot svg element with available size

	var svg_container = d3.select(this.selector).append("div")
		.attr("class", "svg_container")
		.attr("style", "width:" + $(this.selector).width() +"px; height:60%");

	var svg = svg_container.append("svg")
		.attr("class", "scatter")
	    .attr("width", width)
	    .attr("height", height)
	  	.append("g")
	    .attr("transform", "translate(" + analytics.margin.left + "," + analytics.margin.top + ")");

	

	// Definition X scale, domain and format

	var xScale, format_x;

	if (this.col_date.indexOf(this.sel_x) != -1){
		xScale = d3.time.scale().range([0, width]);
		format_x = d3.time.format(self.format_date);
	}else{
		xScale = d3.scale.linear().range([0, width]);
		format_x = d3.format('s');
	}

	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")
	    .tickFormat(format_x);

	if (this.col_date.indexOf(this.sel_y) != -1){
		yScale = d3.time.scale().range([height, 0]);
		format_y = d3.time.format(self.format_date);
	}else{
		yScale = d3.scale.linear().range([height, 0]);
		format_y = d3.format('s');
	}

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


	
	
	// Definition Y scale, domain and format
	// Can have multiple parameters selected so we have to iterate
	// through possible selections

	var yScale, format_y;

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left")
	    .tickFormat(format_y);

	for (var i = this.sel_y.length - 1; i >= 0; i--) {

		var tmp_domain = d3.extent(this.data, function(d) { 
			return d[self.sel_y[i]];
		});

		// If the parameter minimum is bigger then a previously set minimum and the 
		// currently set minimum is not the default 0 overwrite it
		if(tmp_domain[0] > yScale.domain()[0] && yScale.domain()[0] != 0){
			tmp_domain[0] = yScale.domain()[0];
		}
		// If the parameter maximum is lower then a previously set maximum overwrite it
		if(tmp_domain[1] < yScale.domain()[1]){
			tmp_domain[1] = yScale.domain()[1];
		}

		yScale.domain(tmp_domain).nice();
	};



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
	var clippath = svg.append("defs").append("clipPath")
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


	this.gridselector.on("click", function() {
		self.grid_active = !self.grid_active;
		// If grid is selected we expand the tick size to cover the whole plot
		if(self.grid_active){

			svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#D3D3D3");

			xAxis.tickSize(-height);
			yAxis.tickSize(-width);
			

		}else{
			xAxis.tickSize(5);
			yAxis.tickSize(5);

			svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#000");
		}

		// Update Axis to draw lines
		svg.select('.x.axis')
	      .call(xAxis);

	    svg.select('.y.axis')
	      .call(yAxis);
	});


	// Add ticks for X axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", width - 10)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text(this.sel_x);

	// Add ticks for Y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", -10)
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "1em")
			.style("text-anchor", "end")
			.text(this.sel_y);


	// In order to work with the canvas renderer styles need to be applied directlo
	// to svg elements instead of using a stile. Here we set stroke width and color 
	// for all ticks and axis paths
	svg.selectAll('.axis .domain')
      	.attr("stroke-width", "2")
      	.attr("stroke", "#000")
      	.attr("shape-rendering", "crispEdges")
      	.attr("fill", "none");

    svg.selectAll('.axis line')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");

    svg.selectAll('.axis path')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");


	// Create points of scatter plot, if multiple parameters are selected for Y axis
	// we need to iterate in order to create a full set of points for all

	for (var i = this.sel_y.length - 1; i >= 0; i--) {
		renderdots(this.sel_y[i]);
	};

	function renderdots(parameter){
		svg.selectAll(".dot_"+parameter)
			.data(self.data)
			.enter().append("circle")
			.attr("class", "area").attr("clip-path", "url(#clip)")
			.attr("class", "dot_"+parameter)
			.style("display", function(d) {
				return !d["active"] ? "none" : null;
			})
			.attr("r", 3.5)

			.attr("cx", function(d) { 
				return xScale(d[self.sel_x]); 
			})

			.attr("cy", function(d) { 
				return yScale(d[parameter]); 
			 })
			.style("fill", function(d) { return self.parameter_colors(parameter); })
			.style("stroke", function(d) { return self.colors(d.id); })

			.on("mouseover", function(d) {

				self.mouseover(d);

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
    }


    // Add legend for all displayed combinations

    var y_offset = (this.sel_y.length) * 20;

    for (var i = this.sel_y.length - 1; i >= 0; i--) {
	

	    // Add legend for available unique identifiers in loaded csv data
		var legend = svg.selectAll(".legend_"+self.sel_y[i])
			.data(this.identifiers)
			.enter().append("g")
			.attr("class", "legend_"+self.sel_y[i])
			.attr("transform", function(d,n) { 
				return "translate(0," + ((i*y_offset) + (n*20)) + ")";
			});

		// Add a rectangle with the corresponding color for the legend
		legend.append("circle")
			.attr("cx", width - 15)
			.attr("cy", 9)
			.attr("r", 4)
			.style("fill", function(d) { return self.parameter_colors(self.sel_y[i]); })
			.style("stroke", function(d) { return self.colors(d); });

		// Add identifier as text to label element
		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {return d + " - " + self.sel_y[i]; });

		};


	// Resize method, recalculates position of all elements in svg
	function resize() {
	    var width = $(self.selector).width() - analytics.margin.left - analytics.margin.right,
	 		height = $(self.selector).height() - analytics.margin.top - analytics.margin.bottom;

	 	height = parseInt(height/100 * 60);

	 	svg_container.attr("style", "width:" + $(this.selector).width() +"px; height:60%");

	 	$(x_select.node().parentNode)
			.attr("style", "position: absolute; z-index: 100;"+
				"right:"+(analytics.margin.right)+"px;"+
				"top:"+(height+20)+"px;");

	 	clippath.attr("width", width).attr("height", height);

	    // Update the range of the scale with new width/height
	    xScale.range([0, width]);
	    yScale.range([height, 0]);

	    legend.select("circle")
			.attr("cx", width - 15)
		
		legend.select("text")
			.attr("x", width - 24)

	    // update x axis label position
	    svg.select('.x.axis')
	    	.select('.label')
	    	.attr("x", width - 10);


	    if(self.grid_active){

			svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#D3D3D3");

			xAxis.tickSize(-height);
			yAxis.tickSize(-width);
			

		}else{
			xAxis.tickSize(5);
			yAxis.tickSize(5);

			svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#000");
		}

		// Update the axis with the new scale
	    svg.select('.x.axis')
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	    svg.select('.y.axis')
	      .call(yAxis);

	    /* Force D3 to recalculate and update the dots */
	    for (var i = self.sel_y.length - 1; i >= 0; i--) {
	    	svg.selectAll(".dot_"+self.sel_y[i])
				.attr("cx", function(d) {return xScale(d[self.sel_x]);})
				.attr("cy", function(d) {return yScale(d[self.sel_y[i]]);});
	    };
	    

	}

	$(window).resize(resize);



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

	// Clone array
	var parameters = this.headerNames.slice(0);

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


	// In order to work with the canvas renderer styles need to be applied directlo
	// to svg elements instead of using a stile. Here we set stroke width and color 
	// for all ticks and axis paths
	svg.selectAll('.axis .domain')
      	.attr("stroke-width", "2")
      	.attr("stroke", "#000")
      	.attr("shape-rendering", "crispEdges")
      	.attr("fill", "none");

    svg.selectAll('.axis line')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");

    svg.selectAll('.axis path')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");


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

	// Resize method, recalculates position of all elements in svg
	function resize_parallels() {
	    var	width = $(self.selector).width() - self.margin.left - self.margin.right,
			height = $(self.selector).height() - self.margin.top - self.margin.bottom;

		height = parseInt(height/100 * 40);
		height-=30;


		x.rangePoints([0,width]);


		parameters.forEach(function(para) {

			y[para].range([0,height]);

			var bar = svg.selectAll("." + para)
			    .attr("transform", function(d) { 
			    	return "translate(" + x(para) + "," + (y[para](d.x) - height/hist_data[para].length) + ")";
			    });

			bar.append("rect")
			    .attr("width", function(d) {
			    	return x_hist[para](d.y);
				});

		});

		// Add a group element for each trait.
		svg.selectAll(".trait")
		    .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

		svg.selectAll('.axis')
		    .each(function(d) { 
		    	d3.select(this).call(axis.scale(y[d]));
		    })

	}

	$(window).resize(resize_parallels);
}


