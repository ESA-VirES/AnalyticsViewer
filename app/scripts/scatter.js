

function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }


function scatterPlot(args, callback, openinfo, filterset) {


	this.scatterEl = args.scatterEl;

	this.margin = defaultFor(
		args.margin,
		{top: 50, right: 40, bottom: 35, left: 70}
	);

	this.histoEl = defaultFor(args.histoEl, false);
	this.histoMargin = defaultFor(
		args.histoMargin,
		{top: 30, right: 70, bottom: 30, left: 100}
	);

	this.openinfo = openinfo;
	this.filterset = filterset;
	this.callback = callback;
	this.headerNames = null;
	this.colors = args.colors;
	this.toIgnore = defaultFor(args.toIgnore, ['id','active']);
	this.toIgnoreHistogram = defaultFor(args.toIgnoreHistogram, ['id']);
	this.format_date = defaultFor(args.dateformat, "%H:%M:%S");
	this.parameter_colors = null;
	this.col_ordinal = [] ;
	this.col_date = [] ;
	this.col_vec = [] ;
	this.grid_active = defaultFor(args.grid, true);
	this.sel_x = defaultFor(args.selection_x, "Latitude");
	this.sel_y = defaultFor(args.selection_y, null);
	this.identifiers = [];
	this.active_brushes = [];
	this.brush_extents = {};
	this.parameter_color_range = d3.scale.category20().range();
	this.hist_data = {};
	this.parameters = null;
	this.y = null;
	this.x = null;
	this.x_hist = null;
	this.axis = null;
	this.height = null;
	this.width = null;
	this.selectedpoint = null;
	this.residuals = false;

	this.showDropDownSelection = defaultFor(args.showDropDownSelection, true);;

	d3.selectAll(".AV-point-tooltip").remove();

	this.tooltip = d3.select("body").append("div")
        .attr("class", "AV-point-tooltip");
	

}

scatterPlot.prototype.loadData = function loadData(args){

	var self = this;

	if(args.url){
		d3.csv(args.url, function(error, values) {
			self.parseData(values);
			self.render();
			self.parallelsPlot();
	    	self.callback();
  		});
	}else if(args.data){
		this.parseData(d3.csv.parse(args.data));
		this.render();
		this.parallelsPlot();
	    this.callback();
	}else if(args.parsedData){
		this.data = args.parsedData;
		this.analyseData();
		this.initData();
		this.render();
		this.parallelsPlot();
	    this.callback();
	}
}

scatterPlot.prototype.analyseData = function analyseData(){

	for(var key in this.data[0]){
		// Check if column is a date
    	if(this.data[0][key] instanceof Date){
    		this.col_date.push(key);
	    }else{
	    	var val = +(this.data[0][key]);
	    	if (isNaN(val)){
	    		this.col_ordinal.push(key);
	    	}
	    }
	}

}

scatterPlot.prototype.parseData = function parseData(values){

	var exp_date = /^(\d){4}-(\d){2}-(\d){2}/
	var value;
	var self = this;

	this.data = null;
	self.data = values;
	// Extract the list of dimensions
    // For each dimension, guess if numeric value or not and create vert scales
    all_dims = d3.keys(self.data[0]);
    this.residuals = false;
    var res_key = "";


    // Check for residuals
    d3.keys(self.data[0]).filter(function(key) {
    	if (key.indexOf("_res_") > -1)
    		this.residuals = true;

    	if (key.indexOf("F_res_") > -1)
    		res_key = key;
    });


    // Filter hidden dimensions
    d3.keys(self.data[0]).filter(function(key) {
    	// TODO temporary if to remove flags, shall be removed
    	if ($.inArray(key, self.toIgnore) > -1 ){
    		self.data.forEach (function(p) {delete p[key];}) ; 
    	}else{
	    	// Check if column is a date
	    	if(exp_date.test(self.data[1][key])){
	    		self.data.forEach (function(p) {
	    			//p[key] = new Date(p[key].replace(/-/g,'/'));
	    			p[key] = new Date(p[key]);
	    		}) ; 
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
		    				if(!this.residuals)
		    					p[new_key] = parseFloat(vector[i]);

		    			}else if(key.indexOf( "B_NEC_res_" ) > -1){
		    				// vector[i] = parseFloat(vector[i]);
		    				var id = key.replace("B_NEC_res_", "");
		    				var new_key;
		    				switch (i){
		    					case 0: new_key=("B_N_res_"+id); break;
		    					case 1: new_key=("B_E_res_"+id); break;
		    					case 2: new_key=("B_C_res_"+id); break;
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
	    	/*}else if (value = parseFloat(self.data[1][key])){
	    		self.data.forEach (function(p) {p[key] = parseFloat(p[key]);}) ;
	    	}*/
		    }else{
		    	var val = +(self.data[1][key]);
		    	if (!isNaN(val)){
		    		self.data.forEach (function(p) {p[key] = +(p[key]);}) ;
		    	}else{
		    		self.col_ordinal.push(key);
		    	}
		    }
		    if(this.residuals && key == "F"){
				self.data.forEach (function(p) {delete p[key];}) ; 
			}
		}
	});

    self.initData();
}

scatterPlot.prototype.initData = function initData(){    
    
    var controlled_sel_y = [];

    var self = this;

    d3.keys(self.data[0]).filter(function(key) {

    	// If there is already an y axis selection make sure the parameters are available in the data
    	if (self.sel_y != null){
	    	for (var i=0; i < self.sel_y.length; i++) {
	    		// Vector components are separated into multiple parameters so there we need a special check for this.
	    		if (key.indexOf("NEC")>-1){
	    			if (key.replace("NEC", "N") == self.sel_y[i] ||
	    				key.replace("NEC", "E") == self.sel_y[i] ||
	    				key.replace("NEC", "C") == self.sel_y[i])
	    				controlled_sel_y.push(self.sel_y[i]);

	    		}else{
		    		if (key == self.sel_y[i])
	    				controlled_sel_y.push(self.sel_y[i]);
	    		}

	    	};
	    }
    });


    if (this.sel_y == null || controlled_sel_y.length == 0){

    	// TODO: We need a better way to find where data is available, ordinarily we create the data
		// and the first 4 paramaters are id, lat, lon, radius so for now the 5th parameter could be of 
		// interest for visualization, but this is by far not the best way to do it.
		
		// First we check if residuals are available else we take the 6th element
		if (this.residuals)
    		controlled_sel_y = [res_key];
		else if(d3.keys(self.data[0])[5])
			controlled_sel_y = [d3.keys(self.data[0])[5]];

		
    }

    // TODO: Check to see if old selection was F and new data with residuals was loaded.
    // If yes we switch to residual visualization.
    // This is not a good way of doing this! Which parameter should be selected should be 
    // specified during instantiation.

    

    this.sel_y = controlled_sel_y;

	// Create colorscale for all available parameters
	
	self.parameter_colors = d3.scale.ordinal().domain(d3.keys(self.data[0])).range(self.parameter_color_range);

	// Add an active tag to know if row is filtered out or not, used for filtering with parallels
	// Initially all set to true, as no filters yet active
	self.data.forEach (function(p) {p["active"] = 1;}) ;

	self.headerNames = d3.keys(self.data[0]);
	self.headerNames.sort();
	self.identifiers = d3.set(self.data.map(function(d){return d.id;})).values();

	//if(!self.colors)
	self.colors = d3.scale.ordinal().domain(self.identifiers).range(d3.scale.category10().range());
		

	// Remove unwanted elements
	for (var i = self.toIgnore.length - 1; i >= 0; i--) {
		var index = self.headerNames.indexOf(self.toIgnore[i]);
		if (index > -1) {
			self.headerNames.splice(index, 1);
		}
	};
	


	var new_sel_x = null;

	if(self.headerNames.indexOf(self.sel_x) > -1){
		new_sel_x = self.sel_x;
	}

	if(new_sel_x)
		self.sel_x = new_sel_x;
	else
		self.sel_x = "Latitude";

	// Check if there are active brushes/filters which need to be applied
	if (self.active_brushes.length > 0){
		_.each(self.data, function(row){
			active = true;
			self.active_brushes.forEach (function(p) {
				// Check if filter parameter is in data
				if ( row.hasOwnProperty(p) ) {
			    	if (!(self.brush_extents[p][0] <= row[p] && row[p] <= self.brush_extents[p][1])){
			    		active = false;
			    	}
			    }
	    	});
			row["active"] = active ? 1 : 0;
		}); 
	}

	
}

scatterPlot.prototype.render = function(){

	var self = this;
	var width = $(this.scatterEl).width() - this.margin.left - this.margin.right,
	height = $(this.scatterEl).height() - this.margin.top - this.margin.bottom;

	this.height = height;
	this.width = width;

	// Doing some cleanup as just emptyig the div does not seem to cleanup correctly
	for (var i = this.sel_y.length - 1; i >= 0; i--) {
		var par = this.sel_y[i];
		d3.select('svg').selectAll(".dot_"+par).remove();

	};

	// Clenaup of possible event bound objects
    d3.select("#save").remove();
    d3.select("#pngdataurl").remove();
    d3.select("#grid").remove();

    d3.selectAll(".SumoSelect").remove();

	d3.select(this.scatterEl).selectAll("*").remove();

	d3.select("body").append("canvas")
		.attr("id", "imagerenderer")
        .attr("width", $(this.scatterEl).width())
        .attr("height", $(this.scatterEl).height())
        .attr("style", "display: none");

    d3.select("body").append("div").attr("id", "pngdataurl");

	d3.select(this.scatterEl).append("button")
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "save")
        .attr("style", "position: absolute; right: 149px; top: 7px")
        .text("Save as Image");


	d3.select("#save").on("click", function(){
		var svg_html = d3.select(".scatter")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().innerHTML;

		var c = document.querySelector("#imagerenderer");
		var ctx = c.getContext('2d');
		
		ctx.drawSvg(svg_html, 0, 0, self.width, self.height);

		//var a = document.createElement("a");
		var a = d3.select("#pngdataurl").append("a")[0][0];
		a.download = "Analytics.png";
		a.href = c.toDataURL("image/png");

		a.click();
		d3.select("#pngdataurl").selectAll("*").remove();

	});

	// Add button for grid toggle
	
	this.gridselector = d3.select(this.scatterEl).append("button")
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "grid")
        .attr("style", "position: absolute; right: 275px; top: 7px")
        .text("Toggle Grid");


    d3.select(this.scatterEl).append("button")   
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "download_button")
        .attr("style", "position: absolute; right: 55px; top: 7px")
        .text("Download");


    if(this.showDropDownSelection){


	    var y_select = d3.select(this.scatterEl)
				.insert("div")
				.attr("style", "position: absolute;"+
					"margin-left:"+(this.margin.left + 10)+
					"px; margin-top:"+(this.margin.top-40)+"px;")
				.append("select")
					.attr("multiple", "multiple");

			

		y_select.selectAll("option")
			.data(this.headerNames)
			.enter()
			.append("option")
			.text(function (d) { 
				if(self.sel_y.indexOf(d) != -1)
					d3.select(this).attr("selected","selected");

				// Renaming of keys introducing subscript
				var newkey = "";
				var parts = d.split("_");
				if (parts.length>1){
					newkey = parts[0];
					for (var i=1; i<parts.length; i++){
						newkey+=(" "+parts[i]).sub();
					}
				}else{
					newkey = d;
				}

				d3.select(this).attr("value", d)
				return newkey; 
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

	}


	// Definition and creation of scatter plot svg element with available size

	var svg_container = d3.select(this.scatterEl).append("div")
		.attr("class", "svg_container")
		.attr("style", 'width: 100%;height: 100%;')
		

	var svg = svg_container.append("svg")
		.attr("class", "scatter")
	  	.append("g")
	    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


	if(this.showDropDownSelection){

		var x_select = d3.select(this.scatterEl)
			.insert("div")
				.attr("class", "xselectdropdown")
				.attr("style", "position: relative; float:right;"+
					"width:120px;"+"bottom:45px; right:160px")
				.append("select")
					.attr("style", "width: 250px;");

			

		x_select.selectAll("option")
			.data(this.headerNames)
			.enter()
			.append("option")
			.text(function (d) { 

				if(self.sel_x == d)
					d3.select(this).attr("selected","selected");

				// Renaming of keys introducing subscript
				var newkey = "";
				var parts = d.split("_");
				if (parts.length>1){
					newkey = parts[0];
					for (var i=1; i<parts.length; i++){
						newkey+=(" "+parts[i]).sub();
					}
				}else{
					newkey = d;
				}

				d3.select(this).attr("value", d)
				return newkey; 
			});

		$(x_select).SumoSelect({ okCancelInMulti: false });


		$(".xselectdropdown").find(".SumoSelect").change(function(evt){

			self.sel_x = $(this).find(".optWrapper .selected").data().val;
			self.render();
			self.parallelsPlot();
		
		});
	}
	

	// Definition X scale, domain and format

	var xScale, format_x;

	if (this.col_date.indexOf(this.sel_x) != -1){
		xScale = d3.time.scale().range([0, width]);
		//format_x = d3.time.format(self.format_date);
	}else if(this.col_ordinal.indexOf(this.sel_x) != -1){
		xScale = d3.scale.ordinal().rangePoints([0, width]);
	}else{
		xScale = d3.scale.linear().range([0, width]);
		//format_x = d3.format('.3g');
	}

	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom")
	    .tickFormat(format_x);

	// Use first selected element of y axis as definer for axis domain and scale

	var firstYSelection = this.sel_y[0];

	if (this.col_date.indexOf(firstYSelection) != -1){
		yScale = d3.time.scale().range([height, 0]);
		//format_y = d3.time.format(self.format_date);
	}else if(this.col_ordinal.indexOf(firstYSelection) != -1){
		yScale = d3.scale.ordinal().rangePoints([height-this.margin.bottom, 0]);
	}else{
		yScale = d3.scale.linear().range([height-this.margin.bottom, 0]);
		//format_y = d3.format('.3g');
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
	}else if(this.col_ordinal.indexOf(this.sel_x) != -1){
		xScale.domain(this.data.map(function(d) { 
			return d[self.sel_x]; 
		}));
	}else if(this.col_date.indexOf(this.sel_x) != -1){
		var tmp_domain = d3.extent(this.data, function(d) { 
		 	return d[self.sel_x];
		});

		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(tmp_domain[1].getTime()-tmp_domain[0].getTime())/100)*5;
		var niceDomain = [new Date(tmp_domain[0].getTime()-domainBuffer), new Date(tmp_domain[1].getTime()+domainBuffer)];

		xScale.domain(niceDomain);
	}else{
		var tmp_domain = d3.extent(this.data, function(d) { 
		 	return d[self.sel_x];
		});

		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(tmp_domain[1]-tmp_domain[0])/100)*5;
		var niceDomain = [tmp_domain[0]-domainBuffer, tmp_domain[1]+domainBuffer];

		xScale.domain(niceDomain);

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

		var tmp_domain;

		if(this.col_ordinal.indexOf(firstYSelection) != -1){
			tmp_domain = this.data.map(function(d) { 
				return d[firstYSelection]; 
			});
		}else{
			tmp_domain = d3.extent(this.data, function(d) { 
			 	return d[firstYSelection];
			});
		}


		/*var tmp_domain = d3.extent(this.data, function(d) { 
			return d[self.sel_y[i]];
		});*/

		// If the parameter minimum is bigger then a previously set minimum and the 
		// currently set minimum is not the default 0 overwrite it
		if(tmp_domain[0] > yScale.domain()[0] && yScale.domain()[0] != 0){
			tmp_domain[0] = yScale.domain()[0];
		}
		// If the parameter maximum is lower then a previously set maximum overwrite it
		// and the currently set maximum is not the default 1 overwrite it
		if(tmp_domain[1] < yScale.domain()[1] && yScale.domain()[1] != 1){
			tmp_domain[1] = yScale.domain()[1];
		}

		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(tmp_domain[1]-tmp_domain[0])/100)*5;
		var niceDomain = [tmp_domain[0]-domainBuffer, tmp_domain[1]+domainBuffer];

		yScale.domain(niceDomain);
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
	        .attr("height", (height-this.margin.bottom));


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

			xAxis.tickSize(-(self.height-self.margin.bottom));
			yAxis.tickSize(-self.width);
			

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

	// Renaming of selected key introducing subscript
	var newkey = "";
	var parts = this.sel_x.split("_");
	if (parts.length>1){
		newkey = "<tspan>"+parts[0]+"</tspan>";
		for (var i=1; i<parts.length; i++){
			var modifier = "";
			if(i==1)
				modifier = ' dy="5"';
			newkey+='<tspan style="font-size:10px;"'+modifier+'> '+parts[i]+'</tspan>';
		}
	}else{
		newkey = this.sel_x;
	}

	// Add ticks for X axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-this.margin.bottom) + ")")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", width - 10)
			.attr("y", -10)
			.style("text-anchor", "end")
			.html(newkey);

	// Renaming of selected key introducing subscript
	var combinednewkey = [];
	for (var i = 0; i < this.sel_y.length; i++) {
		var newkey = "";
		var parts = this.sel_y[i].split("_");
		if (parts.length>1){
			/*newkey = "<tspan>"+parts[0]+"</tspan>";
			for (var j=1; j<parts.length; j++){
				var modifier = "";
				if(j==1)
					modifier = ' dy="5"';
				newkey+='<tspan style="font-size:10px;"'+modifier+'> '+parts[j]+'</tspan>';
			}*/
			newkey = parts.join(" ");
		}else{
			newkey = this.sel_y[i];
		}
		combinednewkey.push(newkey);
	};

	combinednewkey = combinednewkey.join("; ");

	combinednewkey = combinednewkey.replace(/(?!^)dy="5"/g, '');

	

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
			.html(combinednewkey);


	// In order to work with the canvas renderer styles need to be applied directlo
	// to svg elements instead of using a stile. Here we set stroke width and color 
	// for all ticks and axis paths
	svg.selectAll('.axis .domain')
      	.attr("stroke-width", "2")
      	.attr("stroke", "#000")
      	.attr("shape-rendering", "crispEdges")
      	.attr("fill", "none");

    svg.selectAll('.axis path')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");

    // Check if grid active and adapt style accordingly
  	if(self.grid_active){

		svg.selectAll('.axis line')
	      	.attr("stroke-width", "2")
	      	.attr("shape-rendering", "crispEdges")
	      	.attr("stroke", "#D3D3D3");

		xAxis.tickSize(-(height-self.margin.bottom));
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
				$(this).attr("r",7);

	        })  

	        .on("click", function(d) {

	        	if (self.selectedpoint != null){
	        		self.selectedpoint.attr("r",3.5);
	        		self.selectedpoint = null;
	        	}

				self.openinfo(d);

				self.selectedpoint = $(this);

				var values = "";
				for(var propName in d) {
				    propValue = d[propName]
				    values = values + propName + ": " + propValue + "<br>";
				}

	            self.tooltip.transition()
	                .duration(100)
	                .style("display", "block");
	            self.tooltip.html(values)
	                .style("left", (d3.event.pageX + 10) + "px")
	                .style("top", (d3.event.pageY + 3) + "px");

	            // Add close button
	            var closeArea = self.tooltip.append('text')
					.text('X')
					.attr("style", "position:absolute; right:13px; top:4px; cursor:pointer;")
					.attr("font-family", "sans-serif")
					.attr("font-size", "20px");

				closeArea.on("click", function(){
					self.tooltip.transition()        
	                	.duration(100)
	                	.style("display", "none");
	                	self.selectedpoint.attr("r",3.5);
	        			self.selectedpoint = null;
	        			self.openinfo(null);
				});
	            
	            // Close tooltip if interaction is done anywhere else.
	            $(document).on("mousedown", function(e){
	            	if (e.target.nodeName!="circle" && e.target.className!="AV-point-tooltip"){
	            		if(self.selectedpoint){
	            			self.tooltip.transition()        
			                	.duration(100)      
			                	.style("display", "none");
		                	self.selectedpoint.attr("r",3.5);
		        			self.selectedpoint = null;
		        			self.openinfo(null);
	            		}
	            		
	            	}
	            });

				
	        })

	        .on("mouseout", function(d){
        		if(self.selectedpoint == null) 
        			$(this).attr("r",3.5);
        		else if (self.selectedpoint[0] !== $(this)[0])
        			$(this).attr("r",3.5);
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

	svg.selectAll('text').style("font", "400 13px Arial");
    svg.selectAll('text').style("fill", "black");
    svg.selectAll('text').style("stroke", "none");




	// Resize method, recalculates position of all elements in svg
	function resize() {
	    var width = $(self.scatterEl).width() - self.margin.left - self.margin.right,
	 		height = $(self.scatterEl).height() - self.margin.top - self.margin.bottom;

	 	self.height = height;
		self.width = width;

	 	clippath.attr("width", width).attr("height", (height-self.margin.bottom));

	 	// Update Rect size
	 	// Add rect to allow zoom and pan interaction over complete graph
		svg.select("rect")
			.attr("width", width)
			.attr("height", height);

	    // Update the range of the scale with new width/height
	    xScale.range([0, width]);
	    yScale.range([(height-self.margin.bottom), 0]);

	    for (var i = self.sel_y.length - 1; i >= 0; i--) {
		    // Update legend for available unique identifiers
			var legend = svg.select(".legend_"+self.sel_y[i])
			legend.select("circle")
				.attr("cx", width - 15)
			
			legend.select("text")
				.attr("x", width - 24)
		}

	   

	    // update x axis label position
	    svg.select('.x.axis')
	    	.select('.label')
	    	.attr("x", width - 10);


	    if(self.grid_active){

			svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#D3D3D3");

			xAxis.tickSize(-(height-self.margin.bottom));
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
	      .attr("transform", "translate(0," + (height-self.margin.bottom) + ")")
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

	if(this.histoEl){

		var self = this;

		// Clone array
		this.parameters = this.headerNames.slice(0);

		// Do some cleanup (especially on objects with events)
		d3.select(self.histoEl).selectAll(".brush").remove();
		d3.select("#reset_filters").remove();

		this.parameters.forEach(function(para) {
			var histosvg = d3.select(self.histoEl).select('svg');
			histosvg.selectAll("." + para).remove();
			histosvg.selectAll('.trait.'+para).remove();
		});

		$(this.histoEl).empty();


		var uniqueArray = [];
		var domain = [];

		// Remove parameters which are vectors and additionally timestamp
		_.each(this.col_vec.concat("Timestamp").concat("active").concat("F_wmm2010"), function(n){
			var index = self.parameters.indexOf(n);
			if (index > -1) {
				self.parameters.splice(index, 1);
			}
		});

		
		// Remove parameters marked to be ignored
		_.each(self.toIgnoreHistogram, function(n){
			var index = self.parameters.indexOf(n);
			if (index > -1) {
				self.parameters.splice(index, 1);
			}
		});


		var	width = $(this.histoEl).width() - this.histoMargin.left - this.histoMargin.right,
			height = $(this.histoEl).height() - this.histoMargin.top - this.histoMargin.bottom;

		this.x_hist = {};
		this.hist_data = {};
		this.y = {};
		this.x = d3.scale.ordinal().domain(self.parameters).rangePoints([0, width]);
		this.axis = d3.svg.axis().orient("left");

		var line = d3.svg.line(),
		    foreground;

		// User general formatting for ticks on Axis
		this.axis.tickFormat(d3.format(".3g"));

		var svg = d3.select(this.histoEl).append("svg")
			.attr("class", "parallels")
		    .attr("width", width)
		    .attr("height", height)
		  	.append("g")
		  	.attr("display", "block")
		  	.attr("transform", "translate(" + this.histoMargin.left + "," + (this.histoMargin.top) + ")");

		d3.select(this.histoEl).append("button")
	        .attr("type", "button")
	        .attr("class", "btn btn-success")
	        .attr("disabled", true)
	        .attr("id", "reset_filters")
	        .attr("style", "position: absolute; left: 62px; top:-30px;")
	        .text("Reset Filters");

	    if (self.active_brushes.length>0){
			// Activate clear filter button
			d3.select("#reset_filters").attr('disabled', null);
		}

		d3.select("#reset_filters").on("click", function(){
			self.active_brushes = [];
			self.filterset({});

			_.each(self.data, function(row){
				row["active"] = true;
			}); 

			self.parallelsPlot();
			self.render();
		});



	    var self = this;
	    self.svg = svg;
		// Create a scale and brush for each trait.
		self.parameters.forEach(function(d) {

			if(self.col_ordinal.indexOf(d) != -1){
				self.y[d] = d3.scale.ordinal()
					.rangePoints([height, 0])
			        .domain(self.data.map(function(data) { 
						return data[d]; 
					}));

			}else{
			    self.y[d] = d3.scale.linear()
			        .range([height, 0])
			        .domain(d3.extent(self.data, function(data) { 
			        	return data[d];
					})).nice();
		    }

		    self.y[d].brush = d3.svg.brush()
		        .y(self.y[d])
		        .on("brushend", brushend)
		        .on("brush", function(param){

		        	var brush_top = self.svg.selectAll('.trait.'+param).selectAll('.resize.n');
		        	var brush_bottom = self.svg.selectAll('.trait.'+param).selectAll('.resize.s');
		        	var extent = self.y[param].brush.extent();
		        	var format = d3.format('.02f');

		        	brush_top.select("text").remove();
		        	brush_bottom.select("text").remove();

		        	brush_top.append("text")
		               .text(format(extent[1]))
		               .style("transform", "translate(15px,0px)");
		            brush_bottom.append("text")
		               .text(format(extent[0]))
		               .style("transform", "translate(15px,0px)");


		        });


		    var transformed_data = [];
		    _.each(self.data, function(row){
		    	if (row["active"])
	    			transformed_data.push(row[d]);
	    	});


		    // Generate a histogram using twenty uniformly-spaced bins.
		    if(self.col_ordinal.indexOf(d) != -1){
		    	self.hist_data[d] = d3.layout.histogram()
		    		//.bins(self.y[d])
					(transformed_data.map(function(data) { 
							return data[d]; 
						})
					);
		    }else{

				self.hist_data[d] = d3.layout.histogram()
				    .bins(self.y[d].ticks(60))
				    //.bins(self.y[d].ticks())
				    (transformed_data);
				    //(values);
			}
			transformed_data = null;

			self.x_hist[d] = d3.scale.linear()
			    .domain([0, d3.max(self.hist_data[d], function(data) { 
			    	return data.length;
			    })])
			    .range([0, 40]);
		});

		// If there were active brushes before re-rendering set the brush extents again
		var filter_to_remove = [];
		self.active_brushes.forEach (function(p) {
			if ( self.y.hasOwnProperty(p) ) {
			    // Re-set brush
			    self.y[p].brush.extent(self.brush_extents[p]);
			}else{
				// Add to remove list
				filter_to_remove.push(p);
			}
		});
		
		// Remove unnecessary filters
		for (var i = filter_to_remove.length - 1; i >= 0; i--) {
			var index = self.active_brushes.indexOf(filter_to_remove[i]);
			if (index > -1) {
				self.active_brushes.splice(index, 1);
			}
		};

		if (filter_to_remove.length>0){
			var filter = {};
			self.active_brushes.forEach (function(p) {
				filter[p] = self.brush_extents[p];
	    	});
			self.filterset(filter);
		}
			


		self.parameters.forEach(function(para) {

			var bar = svg.selectAll("." + para)
			    .data(self.hist_data[para])
			  	.enter().append("g")
			    .attr("class", "bar "+para)
			    .attr("transform", function(d) { 
			    	return "translate(" + self.x(para) + "," + (self.y[para](d.x) - height/self.hist_data[para].length) + ")";
			    });

			bar.append("rect")
			    .attr("height", 
			    	height/self.hist_data[para].length - 1
			    )
			    .attr("width", function(d) {
			    	return self.x_hist[para](d.y);
				})
				.style("fill", "#1F77B4");

		});

		//var colors = d3.scale.category10().domain(uniqueArray);

		// Add a group element for each trait.
		var g = svg.selectAll(".trait")
		    .data(self.parameters)
		    .enter().append("svg:g")
		    //.attr("class", "trait")
		    .attr("class", function(d) { return "trait " + d; })
		    .attr("transform", function(d) { 
		    	return "translate(" + self.x(d) + ")"; 
		    });
			  
		// Add an axis and title.
		g.append("svg:g")
		    .attr("class", "axis")
		    .each(function(d) { 
		    	d3.select(this).call(self.axis.scale(self.y[d]));
		    })
		    .append("svg:text")
		    .attr("text-anchor", "middle")
		    .attr("y", -12)
		    .html(function (d) { 
				// Renaming of keys introducing subscript
				var newkey = "";
				var parts = d.split("_");
				if (parts.length>1){
					newkey = "<tspan>"+parts[0]+"</tspan>";
					for (var i=1; i<parts.length; i++){
						var modifier = "";
						if(i==1)
							modifier = ' dy="5"';
						newkey+='<tspan style="font-size:10px;"'+modifier+'> '+parts[i]+'</tspan>';
					}
				}else{
					newkey = d;
				}
				return newkey; 
			});


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
		    .each(function(d) { d3.select(this).call(self.y[d].brush); })
		    .selectAll("rect")
		    .attr("x", -8)
		    .attr("width", 16);

		// Returns the path for a given data point.
		function path(d) {
			return line(self.parameters.map(function(p) {
			  	return [x(p), self.y[p](d[p])];
			}));
		}

		// Handles a brush event, toggling the display of foreground lines.
		function brushend(parameter) {
			
			self.active_brushes = self.parameters.filter(function(p) { return !self.y[p].brush.empty(); });
			self.brush_extents = {};
			self.active_brushes.map(function(p) { self.brush_extents[p] = self.y[p].brush.extent(); });
			var filter = {};

			var active;
			
			_.each(self.data, function(row){
				active = true;
				self.active_brushes.forEach (function(p) {
					filter[p] = self.brush_extents[p];
			    	if (!(self.brush_extents[p][0] <= row[p] && row[p] <= self.brush_extents[p][1])){
			    		active = false;
			    	}
		    	});
				row["active"] = active ? 1 : 0;
			}); 

			self.filterset(filter);
			

			self.render();
			self.parallelsPlot();

		}

		// Resize method, recalculates position of all elements in svg
		function resize_parallels() {

		    var	width = $(self.histoEl).width() - self.histoMargin.left - self.histoMargin.right,
				height = $(self.histoEl).height() - self.histoMargin.top - self.histoMargin.bottom;

			self.x.rangePoints([0,width]);

			var hd = self.hist_data;
			var yobj = self.y;


			self.parameters.forEach(function(para) {

				yobj[para].range([height,0]);

				//yobj[para].brush.y(yobj[para]);
				// TODO: Need for replacement of brushes when modifying height
		        	

				var bar = svg.selectAll("." + para)
					.data(self.hist_data[para])
				    .attr("transform", function(d) { 
				    	return "translate(" + self.x(para) + "," + (yobj[para](d.x) - height/hd[para].length) + ")";
				    });

				/*bar.append("rect")
				    .attr("width", function(d) {
				    	return self.x_hist[para](d.y);
					});*/

			});


			// Add a group element for each trait.
			svg.selectAll(".trait")
				.data(self.parameters)
			    .attr("transform", function(d) { 
			    	return "translate(" + self.x(d) + ")";
			    });


			svg.selectAll('.axis')
				.data(self.parameters)
			    .each(function(d) { 
			    	d3.select(this).call(self.axis.scale(yobj[d]));
			    })

			

		}

		var self = this;

		$(window).resize(resize_parallels);
	}
}


