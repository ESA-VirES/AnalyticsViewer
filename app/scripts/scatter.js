

(function () {
    var originalIs = $.fn.is;
    $.fn.is = function (selector) {
        //selector = getFullSelectorIds(selector);
        if($(this.context).attr("id")=="filtermanager" && selector==":focus"){
        	return true;
        }
        return originalIs.call(this, selector);
    };
})(jQuery);

function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }


function scatterPlot(args, callback, openinfo, filterset) {


	this.scatterEl = args.scatterEl;

	this.margin = defaultFor(
		args.margin,
		{top: 50, right: 90, bottom: 35, left: 70}
	);

	this.histoEl = defaultFor(args.histoEl, false);
	this.histoMargin = defaultFor(
		args.histoMargin,
		{top: 30, right: 70, bottom: 30, left: 100}
	);

	this.uom_set = defaultFor(args.uom_set, {});
	this.filters_hidden = false;
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
	this.lineConnections = defaultFor(args.lineConnections, false);
	this.active_filters = [];
	this.fieldsforfiltering = defaultFor(args.fieldsforfiltering, ["F","F_error","B_N", "B_E", "B_C", "B_error","dst","kp","qdlat","mlt"]);

	this.left_scale = [];
	this.right_scale = [];

	this.timeformat = d3.time.format.utc.multi([
		[".%L", function(d) { return d.getUTCMilliseconds(); }],
		[":%S", function(d) { return d.getUTCSeconds(); }],
		["%H:%M", function(d) { return d.getUTCMinutes(); }],
		["%H:%M", function(d) { return d.getUTCHours(); }],
		["%a %d", function(d) { return d.getUTCDay() && d.getDate() != 1; }],
		["%b %d", function(d) { return d.getUTCDate() != 1; }],
		["%B", function(d) { return d.getUTCMonth(); }],
		["%Y", function() { return true; }]
	]);

	this.renderBlocks = defaultFor(args.renderBlocks, false);

	if (this.renderBlocks){
		this.daily_products = true;
		this.dataRange = defaultFor(args.dataRange, [0,1]);
		this.plotter = new plotty.plot({
			canvas: $('<canvas>')[0],
			domain: this.dataRange
		});
	}

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
	this.col_ordinal = [];
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

scatterPlot.prototype.createSubscript = function createSubscript(string){
	// Adding subscript elements to string which contain underscores
	var newkey = "";
	var parts = string.split("_");
	if (parts.length>1){
		newkey = parts[0];
		for (var i=1; i<parts.length; i++){
			newkey+=(" "+parts[i]).sub();
		}
	}else{
		newkey = string;
	}

	return newkey;
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
    this.col_ordinal = [];


    // Check for residuals
    d3.keys(self.data[0]).filter(function(key) {
    	if (key.indexOf("_res_") > -1)
    		this.residuals = true;

    	if (key.indexOf("F_res_") > -1)
    		res_key = key;
    });


    // Filter hidden dimensions
    d3.keys(self.data[0]).filter(function(key) {

    	// Check if column is a date
    	if(self.data[1][key].charAt(0)=="{"){
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
	
	this.parameter_colors = d3.scale.ordinal().domain(d3.keys(self.data[0])).range(self.parameter_color_range);

	// Add an active tag to know if row is filtered out or not, used for filtering with parallels
	// Initially all set to true, as no filters yet active
	this.data.forEach (function(p) {p["active"] = 1;}) ;

	this.headerNames = d3.keys(self.data[0]);
	this.headerNames.sort();
	this.identifiers = d3.set(self.data.map(function(d){
		return d.id;
	})).values();

	//if(!self.colors)
	this.colors = d3.scale.ordinal().domain(self.identifiers).range(d3.scale.category10().range());
		

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
     d3.select("#imagerenderer").remove();

    d3.selectAll(".SumoSelect").remove();

	d3.select(this.scatterEl).selectAll("*").remove();

	d3.select("body").append("canvas")
		.attr("id", "imagerenderer")
        .attr("width", $(this.scatterEl).width())
        .attr("height", $(this.scatterEl).height())
        .attr("style", "display: none")
        .attr("xmlns", "http://www.w3.org/2000/svg" )
     	.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

    d3.select("body").append("div").attr("id", "pngdataurl");

	d3.select(this.scatterEl).append("button")
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "save")
        .attr("style", "position: absolute; right: 149px; top: 7px")
        .text("Save as Image");

    d3.select(this.scatterEl).append("button")
        .attr("type", "button")
        .attr("class", "btn btn-success")
        .attr("id", "reset")
        .attr("style", "position: absolute; right: 380px; top: 7px")
        .text("Reset Zoom");

    d3.select("#reset").on("click", function(){
    	self.render();
	});


	d3.select("#save").on("click", function(){
		var svg_html = d3.select(".scatter")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().innerHTML;

		var renderHeight = $(self.scatterEl).height();
		var renderWidth = $(self.scatterEl).width();

		$("#imagerenderer").attr('width', renderWidth);
		$("#imagerenderer").attr('height', renderHeight);

		var c = document.querySelector("#imagerenderer");
		var ctx = c.getContext('2d');
		
		
		ctx.drawSvg(svg_html, 0, 0, renderHeight, renderWidth);

		c.toBlob(function(blob) {
			saveAs(blob, "Analytics.png");
		}, "image/png" ,1);

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
		

	this.scatter_svg = svg_container.append("svg")
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

	var format_x;

	if (this.col_date.indexOf(this.sel_x) != -1){
		self.xScale = d3.time.scale.utc().range([0, width]);
		format_x = this.timeformat;
	}else if(this.col_ordinal.indexOf(this.sel_x) != -1){
		self.xScale = d3.scale.ordinal().rangePoints([0, width]);
	}else{
		self.xScale = d3.scale.linear().range([0, width]);
		//format_x = d3.format('.3g');
	}

	self.xAxis = d3.svg.axis()
	    .scale(self.xScale)
	    .orient("bottom")
	    .tickFormat(format_x);


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

		self.xScale.domain(d3.extent(length_array, function(d) { 
		 	return d;
		})).nice();
	}else if(this.col_ordinal.indexOf(this.sel_x) != -1){
		self.xScale.domain(this.data.map(function(d) { 
			return d[self.sel_x]; 
		}));
	}else if(this.col_date.indexOf(this.sel_x) != -1){
		var tmp_domain = d3.extent(this.data, function(d) { 
		 	return d[self.sel_x];
		});

		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(tmp_domain[1].getTime()-tmp_domain[0].getTime())/100)*5;
		var niceDomain = [new Date(tmp_domain[0].getTime()-domainBuffer), new Date(tmp_domain[1].getTime()+domainBuffer)];

		self.xScale.domain(niceDomain);
	}else{
		var tmp_domain = d3.extent(this.data, function(d) { 
		 	return d[self.sel_x];
		});

		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(tmp_domain[1]-tmp_domain[0])/100)*5;
		var niceDomain = [tmp_domain[0]-domainBuffer, tmp_domain[1]+domainBuffer];

		self.xScale.domain(niceDomain);

	}

	// Definition Y scale, domain and format
	// Can have multiple parameters selected so we have to iterate
	// through possible selections

	var format_y_left, format_y_right;

	this.left_scale = [];
	this.right_scale = [];

	// Use median to decide which scale to use for various parameters

	// TODO: Sort and use biggest jump in range as divider

	if (this.sel_y.length == 1){

		var domain;
		var par = this.sel_y[0];
		self.left_scale.push(self.sel_y[0]);

		if(this.col_ordinal.indexOf(par) != -1){
			domain = this.data.map(function(d) { 
				return d[par]; 
			});
		}else{
			domain = d3.extent(this.data, function(d) { 
			 	return d[par];
			});
		}
		var d_max1 = domain[1];
		var d_min1 = domain[0];

	//}else if (this.sel_y.length == 2){

	}else if (this.sel_y.length >= 2){

		var domains = [];

		for (var i = 0; i < this.sel_y.length; i++) {

			var sel = this.sel_y[i];
			var d = d3.extent(this.data, function(d) { 
				return d[sel];
			});

			domains.push({
				parameter: sel,
				domain: d,
				extent: Math.abs(d[1]-d[0])
			});
		}
		// Sort by domain size
		domains = _.sortBy(domains, 'extent');

		// Take maximum and minimum extent for left and right and check the
		// others to see where they fit better

		var min_ext = domains[0];
		var max_ext = domains[domains.length-1];

		self.left_scale.push(max_ext.parameter);
		self.right_scale.push(min_ext.parameter);

		// Go through products between first and last and decide where to add them
		for (var i = 1; i < domains.length-1; i++) {

			var dif_to_min = Math.abs(domains[i].extent / min_ext.extent);
			//var dif_to_max = Math.abs(domains[i].extent / max_ext.extent);
			// We can check if the covered extent is much higher (300 times) the one
			// covered by the minimum, we should add it to the high value scale (left)
			// There is really no solution if there more then two very different extents
			if(dif_to_min > 300){
				self.left_scale.push(domains[i].parameter);
			}else{
				self.right_scale.push(domains[i].parameter);
			}
		}

		// Take the maximum and the minimum of both collections (separated by median)
		// to use as overall domain on each scale
		var d_max1 = d3.max(domains, function(d, i){
			if (self.left_scale.indexOf(d.parameter) != -1){
				return d.domain[1];
			}
		});
		var d_min1 = d3.min(domains, function(d, i){
			if (self.left_scale.indexOf(d.parameter) != -1){
				return d.domain[0];
			}
		});
		var d_max2 = d3.max(domains, function(d, i){
			if (self.right_scale.indexOf(d.parameter) != -1){
				return d.domain[1];
			}
		});
		var d_min2 = d3.min(domains, function(d, i){
			if (self.right_scale.indexOf(d.parameter) != -1){
				return d.domain[0];
			}
		});
		
	}

	function getSelectionScale(selection){
		var scale;
		if (self.col_date.indexOf(selection) != -1){
			scale = d3.time.scale.utc().range([height-self.margin.bottom, 0]);
		}else if(self.col_ordinal.indexOf(selection) != -1){
			scale = d3.scale.ordinal().rangePoints([0, height-self.margin.bottom]);
		}else{
			scale = d3.scale.linear().range([0, height-self.margin.bottom]);
		}
		return scale;
	};

	self.yScale_left = getSelectionScale(this.left_scale[0]);
	

	self.yAxis_left = d3.svg.axis()
		.scale(self.yScale_left)
		.orient("left");

	if (self.col_date.indexOf(this.left_scale[0]) != -1){
		format_y_left = this.timeformat;
		self.yAxis_left.tickFormat(format_y_left);
		self.yScale_left.domain([d_max1, d_min1]);
	}else{
		// 5% buffer so points are not drawn exactly on axis
		// only if scale is not time scale
		var domainBuffer = (Math.abs(d_max1-d_min1)/100)*5;
		self.yScale_left.domain([d_max1+domainBuffer, d_min1-domainBuffer]);
	}

	self.yAxis_right = null;

	if (this.right_scale.length>0){

		self.yScale_right = getSelectionScale(this.right_scale[0]);
		// 5% buffer so points are not drawn exactly on axis
		var domainBuffer = (Math.abs(d_max2-d_min2)/100)*5;
		self.yScale_right.domain([d_max2+domainBuffer, d_min2-domainBuffer]);

		self.yAxis_right = d3.svg.axis()
			.scale(self.yScale_right)
			.orient("right");

		if (self.col_date.indexOf(this.right_scale[0]) != -1){
			format_y_right = this.timeformat;
			self.yAxis_right.tickFormat(format_y_right);
		}
	}

	// Define zoom behaviour based on parameter dependend x and y scales
	var xyzoom = d3.behavior.zoom()
      .x(self.xScale)
      .y(self.yScale_left)
      .on("zoom", multizoomed);

    var xzoom = d3.behavior.zoom()
      .x(self.xScale)
      .on("zoom", zoomed);

    var yzoom = d3.behavior.zoom()
      .y(self.yScale_left)
      .on("zoom", zoomed);

    if(self.right_scale.length > 0){
	    var y2zoom = d3.behavior.zoom()
	      .y(self.yScale_right)
	      .on("zoom", zoomed);
	}

	// Add clip path so only points in the area are shown
	var clippath = this.scatter_svg.append("defs").append("clipPath")
		.attr("id", "clip")
	    .append("rect")
	        .attr("width", width)
	        .attr("height", (height-this.margin.bottom));

	function zoomed() {

		self.scatter_svg.select(".x.axis").call(self.xAxis);
		self.scatter_svg.select(".y.axis").call(self.yAxis_left);
		self.scatter_svg.select(".y2.axis").call(self.yAxis_right);

		xyzoom = d3.behavior.zoom()
				.x(self.xScale)
				.y(self.yScale_left)
				.on("zoom", multizoomed);

		if(self.right_scale.length > 0){
			y2zoom = d3.behavior.zoom()
				.y(self.yScale_right)
				.on("zoom", zoomed);
		}

		self.scatter_svg.select('rect.zoom.xy.box').call(xyzoom);

		
		self.updatedots();
		self.updateTicks();
		zoom_update();

	}

	function multizoomed(){

		self.scatter_svg.select(".x.axis").call(self.xAxis);
		self.scatter_svg.select(".y.axis").call(self.yAxis_left);

		y2zoom.scale(xyzoom.scale()).translate(xyzoom.translate());
		//self.scatter_svg.select(".y2.axis").call(self.yAxis_right);

		xzoom = d3.behavior.zoom()
			.x(self.xScale)
			.on("zoom", zoomed);
		yzoom = d3.behavior.zoom()
			.y(self.yScale_left)
			.on("zoom", zoomed);

		self.updatedots();
		self.updateTicks();
		zoom_update();
	}


	// Update zoom methods
	function zoom_update(multi) {

		self.scatter_svg.select('rect.zoom.x.box').call(xzoom);
		self.scatter_svg.select('rect.zoom.y.box').call(yzoom);
		self.scatter_svg.select('rect.zoom.y2.box').call(y2zoom);
	}


	this.gridselector.on("click", function() {
		self.grid_active = !self.grid_active;
		// If grid is selected we expand the tick size to cover the whole plot
		if(self.grid_active){

			self.scatter_svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#D3D3D3");

			self.xAxis.tickSize(-(self.height-self.margin.bottom));
			self.yAxis_left.tickSize(-self.width);
			

		}else{
			self.xAxis.tickSize(5);
			self.yAxis_left.tickSize(5);

			self.scatter_svg.selectAll('.axis line')
		      	.attr("stroke-width", "2")
		      	.attr("shape-rendering", "crispEdges")
		      	.attr("stroke", "#000");
		}

		// Update Axis to draw lines
		self.scatter_svg.select('.x.axis')
	      .call(self.xAxis);

	    self.scatter_svg.select('.y.axis')
	      .call(self.yAxis_left);

		if(self.yAxis_right){
			self.scatter_svg.select('.y2.axis')
			.call(self.yAxis_right);
		}

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

	if(this.uom_set.hasOwnProperty(this.sel_x)){
		newkey += " ("+this.uom_set[this.sel_x]+") ";
	}

	// Add ticks for X axis
	self.scatter_svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-this.margin.bottom) + ")")
		.call(self.xAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", width - 10)
			.attr("y", -10)
			.style("text-anchor", "end")
			.html(newkey);


	var paras_left = [];
	for (var i = 0; i < self.left_scale.length; i++) {
		var newkey = "";
		var parts = self.left_scale[i].split("_");
		if (parts.length>1){
			newkey = parts.join(" ");
		}else{
			newkey = self.left_scale[i];
		}
		if(self.uom_set.hasOwnProperty(self.left_scale[i])){
			newkey += " ("+self.uom_set[self.left_scale[i]]+") ";
		}
		paras_left.push(newkey);
	};
	paras_left = paras_left.join("; ");
	paras_left = paras_left.replace(/(?!^)dy="5"/g, '');

	// Add ticks for Y axis
	self.scatter_svg.append("g")
		.attr("class", "y axis")
		.call(self.yAxis_left)
		.append("text")
			.attr("class", "label")
			.attr("x", -10)
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "1em")
			.style("text-anchor", "end")
			.html(paras_left);


	if(self.right_scale){

		var paras_right = [];
		for (var i = 0; i < self.right_scale.length; i++) {
			var newkey = "";
			var parts = self.right_scale[i].split("_");
			if (parts.length>1){
				newkey = parts.join(" ");
			}else{
				newkey = self.right_scale[i];
			}
			if(self.uom_set.hasOwnProperty(self.right_scale[i])){
				newkey += " ("+self.uom_set[self.right_scale[i]]+") ";
			}
			paras_right.push(newkey);
		};
		paras_right = paras_right.join("; ");
		paras_right = paras_right.replace(/(?!^)dy="5"/g, '');

		// Add ticks for Y2 axis
		if(self.right_scale.length > 0){
			self.scatter_svg.append("g")
				.attr("class", "y2 axis")
				.attr("transform", "translate("+width+",0)")
				.call(self.yAxis_right)
				.append("text")
					.attr("class", "label")
					.attr("x", -10 )
					.attr("transform", "rotate(-90)")
					.attr("y", -20)
					.attr("dy", "1em")
					.style("text-anchor", "end")
					.html(paras_right);
			}
	}

	self.updateTicks();


    // Add rect to allow zoom and pan interaction over complete graph
	self.scatter_svg.append("rect")
		.attr("width", width)
		.attr("height", height-self.margin.bottom)
		.attr("class", "zoom xy box")
		.style("visibility", "hidden")
		//.attr("fill", "yellow")
		.attr("stroke", "none")
		.attr("fill", "transparent")
		.attr("pointer-events", "all")
		.call(xyzoom);
		
	// Create points of scatter plot, if multiple parameters are selected for Y axis
	// we need to iterate in order to create a full set of points for all

	if(!self.renderBlocks){
		for (var i = this.sel_y.length - 1; i >= 0; i--) {
			self.renderdots(this.sel_y[i]);
			renderlines(this.sel_y[i]);
		};
	}else{
		var products_amount = _.countBy(this.data, "time");
		binData();
		renderRects();

	}

	function renderlines(parameter){
		if(self.lineConnections){
			// Create line function necessary for line rendering
			var line_func = d3.svg.line()
				.x(function(d) { 
					return self.xScale(d[self.sel_x]); 
				})
				.y(function(d) { 
					return self.yAxis_left(d[parameter]); 
				});

			self.scatter_svg.selectAll(".line_"+parameter).remove();

			self.scatter_svg.append("path")
				.attr("class", "area").attr("clip-path", "url(#clip)")
				.attr("class", "line_"+parameter)
				.attr("d", line_func(self.data))
				.style("fill", "none")
				.style("stroke", function(d) { 
					return self.parameter_colors(parameter);
				});
		}
	};

	if(self.dataRange){

		var colorAxisScale = d3.scale.linear();
		colorAxisScale.domain(this.dataRange);
		colorAxisScale.range([(height-self.margin.bottom), 0]);

		var colorAxis = d3.svg.axis()
			.orient("right")
			.tickSize(5)
			.scale(colorAxisScale);

		var step = (colorAxisScale.domain()[1] - colorAxisScale.domain()[0]) / 10;
		colorAxis.tickValues(
			d3.range(colorAxisScale.domain()[0],colorAxisScale.domain()[1]+step, step)
		)

		colorAxis.tickFormat(d3.format(".3e"));

		var g = self.scatter_svg.append("g")
			.attr("class", "color axis")
			.attr("transform", "translate(" + (width+40) + " ,0)")
			.call(colorAxis);

		self.scatter_svg.selectAll('.color.axis path')
			.attr("fill", "none")
			.attr("shape-rendering", "crispEdges")
			.attr("stroke", "#000")
			.attr("stroke-width", "2");

		self.scatter_svg.selectAll('.color.axis line')
			.attr("stroke-width", "2")
			.attr("shape-rendering", "crispEdges")
			.attr("stroke", "#000");

		var image = this.plotter.getColorScaleImage().toDataURL("image/jpg");

		self.scatter_svg.append("image")
			.attr("class", "colorscaleimage")
			.attr("width",  height-self.margin.bottom)
			.attr("height", 20)
			.attr("transform", "translate(" + (width+17) + " ,"+(height-self.margin.bottom)+") rotate(270)")
			.attr("preserveAspectRatio", "none")
			.attr("xlink:href", image);
	}


	function binData(){

		// Bin heights uniformly together creating average for height interval
		var ticks = self.yAxis_left.ticks(70);
		var binned_data = [];

		// Create empty bins
		for(var i=0;i<ticks.length;i++){
			binned_data.push(false);
		}

		// Go through all data objects
		for (var i=0; i<self.data.length; i++) {
			var bin_pos = 0;
			// Go through bins until finding the correct one
			for(var p=0; p<ticks.length; p++){
				if(ticks[p]>self.data[i].height){
					bin_pos = (p-1);
					break;
				}
			}
			if(bin_pos>0){
				// If bin is empty (false) fill it with array of current value
				// We need also to consider the temporal element for binning
				if(!binned_data[bin_pos]){
					binned_data[bin_pos] = [{
						min_height: ticks[bin_pos-1],
						max_height: ticks[bin_pos],
						val: self.data[i].val,
						starttime: self.data[i].starttime,
						endtime: self.data[i].endtime
					}];
				}else{
					// If bin is already full we need to find the correct object
					// which has the same time to calculate and save the average
					var integrated = false;
					for(var o=0; o<binned_data[bin_pos].length; o++){
						var obj = binned_data[bin_pos][o];
						if(
							self.data[i].starttime.getYear() == obj.starttime.getYear() &&
							self.data[i].starttime.getMonth() == obj.starttime.getMonth() &&
							self.data[i].starttime.getDate() == obj.starttime.getDate() &&
							(
								self.data[i].starttime.getHours() != obj.starttime.getHours() ||
								self.data[i].starttime.getMinutes() != obj.starttime.getMinutes() ||
								self.data[i].starttime.getSeconds() != obj.starttime.getSeconds()
							)
						){
							self.daily_products = false;
						}
						if(self.data[i].starttime.getTime() == obj.starttime.getTime()){
							binned_data[bin_pos][o].val = (obj.val + self.data[i].val)/2;
							integrated = true;
							break;
						}
					}
					// If the current time is not available in the bin collection
					// add the object to the bin
					if(!integrated){
						binned_data[bin_pos].push({
							min_height: ticks[bin_pos-1],
							max_height: ticks[bin_pos],
							val: self.data[i].val,
							starttime: self.data[i].starttime,
							endtime: self.data[i].endtime
						});
					}
					
				}
			}

		}

		self.data = _.filter(binned_data, function(o) { return o; });
		self.data = _.flatten(self.data) ;

	};

	function rgbToHex(r, g, b) {
	    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};

	function renderRects(){
		
		var r_width = Math.round((self.width - self.margin.right - self.margin.left)/_.size(products_amount)/2);
		//var r_height = Math.round((self.height - self.margin.bottom)/137);

		var parameter = self.sel_y[0];
		self.scatter_svg.selectAll(".datarectangle")
			.data(self.data)
			.enter().append("rect")
			.attr("class", "area").attr("clip-path", "url(#clip)")
			.attr("class", "datarectangle")
			.attr("x",function(d) { 
				if(self.daily_products){
					var t = d.starttime;
					t.setUTCHours(0,0,0,0);
					return self.xScale(t); 
				}else{
					return self.xScale(d.starttime); 
				}
			})
			.attr("y",function(d) { 
				return self.yAxis_left(d.max_height); 
			})
			.attr("width", function(d) { 
				if(self.daily_products){
					var t = d.starttime;
					t.setUTCHours(23,59,59,999);
					var x_max = self.xScale(t); 
					t.setUTCHours(0,0,0,0);
					return (x_max-self.xScale(t));
				}else{
					return (self.xScale(d.endtime)-self.xScale(d.starttime));
				}
			})
			.attr("height", function(d){
				return (self.yAxis_left(d.min_height)-self.yAxis_left(d.max_height));
			})

			.style("fill", function(d) {
				var c = self.plotter.getColor(d.val);
				return rgbToHex(c[0], c[1], c[2]);
			})
			.style("stroke", "none")

			.on("mouseover", function(d) {
				d3.select(this).style("stroke", "black");

			})  
			.on("mouseout", function(d){
				if(self.selectedpoint == null) 
					d3.select(this).style("stroke", "none");
				else if (self.selectedpoint !== this)
					d3.select(this).style("stroke", "none");
			})

			.on("click", function(d) {

				if (self.selectedpoint != null){
					d3.select(this).style("stroke", "none");
					self.selectedpoint = null;
				}

				self.openinfo(d);

				self.selectedpoint = this;

				var values = "";
				for(var propName in d) {
					propValue = d[propName]
					if (propValue instanceof Date){
						propValue = propValue.toISOString();
					}
					if(propName != "active"){
						values = values + propName + ": " + propValue + "<br>";
					}
				}
				values = '<br>'+values;

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
					d3.select(self.selectedpoint).style("stroke", "none");
					self.selectedpoint = null;
					self.openinfo(null);
				});
			});

			$(document).on("mousedown", function(e){
				if (e.target.nodeName=="rect" && e.target.className!="AV-point-tooltip"){
					if(self.selectedpoint){
						self.tooltip.transition()        
							.duration(100)      
							.style("display", "none");
						d3.select(self.selectedpoint).style("stroke", "none");
						self.selectedpoint = null;
						self.openinfo(null);
					}
				}
			});
	};

    // Add legend for all displayed combinations if not using render blocks attribute

	if (!self.renderBlocks) {
		var y_offset = (this.sel_y.length) * 20;

		for (var i = this.sel_y.length - 1; i >= 0; i--) {

			// Add legend for available unique identifiers in loaded csv data
			var legend = self.scatter_svg.selectAll(".legend_"+self.sel_y[i])
				.data(self.identifiers)
				.enter().append("g")
				.attr("class", "legend_"+self.sel_y[i])
				.attr("transform", function(d,n) { 
					return "translate(0," + ((i*20) + (n*y_offset)) + ")";
				});

			// Add a rectangle with the corresponding color for the legend
			legend.append("circle")
				.attr("cx", width - 25)
				.attr("cy", 9)
				.attr("r", 4)
				.style("fill", function(d) { return self.parameter_colors(self.sel_y[i]); })
				.style("stroke", function(d) { return self.colors(d); });

			// Add identifier as text to label element
			legend.append("text")
				.attr("x", width - 34)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) {
					var label = d + " - " + self.sel_y[i];
					/*if(self.uom_set.hasOwnProperty(self.sel_y[i])){
						label += " ("+self.uom_set[self.sel_y[i]]+") ";
					}*/
					return label; 
				});
		};
	}

	self.scatter_svg.selectAll('text').style("font", "400 13px Arial");
    self.scatter_svg.selectAll('text').style("fill", "black");
    self.scatter_svg.selectAll('text').style("stroke", "none");

	// Resize method, recalculates position of all elements in svg
	function resize() {
	    var width = $(self.scatterEl).width() - self.margin.left - self.margin.right,
	 		height = $(self.scatterEl).height() - self.margin.top - self.margin.bottom;

	 	self.height = height;
		self.width = width;

	 	self.scatter_svg.select("#clip").selectAll("rect")
	 		.attr("width", width)
	        .attr("height", (height-self.margin.bottom));

	 	// Update zoom and pan handles size
		self.scatter_svg.select('rect.zoom.xy.box')
			.attr("width", width)
			.attr("height", height-self.margin.bottom);

		self.scatter_svg.select('rect.zoom.x.box')
			.attr("width", width)
			.attr("height", self.margin.bottom)
			.attr("transform", "translate(" + 0 + "," + (height - self.margin.bottom) + ")");

		self.scatter_svg.select('rect.zoom.y.box')
			.attr("width", self.margin.left)
			.attr("height", height - self.margin.bottom);

		self.scatter_svg.select('rect.zoom.y2.box')
			.attr("width", self.margin.left)
			.attr("height", height - self.margin.bottom)
			.attr("transform", "translate(" + width + ",0)");

	    // Update the range of the scale with new width/height
	    self.xScale.range([0, width]);
	    self.yScale_left.range([0, (height-self.margin.bottom)]);
	    if(self.right_scale.length > 0){
	    	self.yScale_right.range([0, (height-self.margin.bottom)]);
	    }


	    for (var i = self.sel_y.length - 1; i >= 0; i--) {
	    	//var par = self.sel_y[i]
		    // Update legend for available unique identifiers
			var legend = self.scatter_svg.select(".legend_"+self.sel_y[i])
			legend.select("circle")
				.attr("cx", width - 25)
			
			legend.select("text")
				.attr("x", width - 34)
		}

		self.updateTicks();

		// Update the axis with the new scale
	    self.scatter_svg.select('.x.axis')
	      .attr("transform", "translate(0," + (height-self.margin.bottom) + ")")
	      .call(self.xAxis);

	    self.scatter_svg.select('.y.axis')
	      .call(self.yAxis_left);

	    if(self.yAxis_right){
	    	self.scatter_svg.select('.y2.axis')
	      		.call(self.yAxis_right);
	    }

	    self.updatedots();

	    for (var i = self.sel_y.length - 1; i >= 0; i--) {
			renderlines(self.sel_y[i]);
		};
	    
	    if (self.renderBlocks){

			self.scatter_svg.selectAll(".datarectangle")
				.attr("x",function(d) { 
					if(self.daily_products){
						var t = d.starttime;
						t.setUTCHours(0,0,0,0);
						return self.xScale(t); 
					}else{
						return self.xScale(d.starttime); 
					}
				})
				.attr("y",function(d) { 
					return self.yAxis_left(d.max_height); 
				})
				.attr("width", function(d) { 
					if(self.daily_products){
						var t = d.starttime;
						t.setUTCHours(23,59,59,999);
						var x_max = self.xScale(t); 
						t.setUTCHours(0,0,0,0);
						return (x_max-self.xScale(t));
					}else{
						return (self.xScale(d.endtime)-self.xScale(d.starttime));
					}
				})
				.attr("height", function(d){
					return (self.yAxis_left(d.min_height)-self.yAxis_left(d.max_height));
				});

			colorAxisScale.range([(height-self.margin.bottom), 0]);

			self.scatter_svg.selectAll(".color.axis")
				.attr("transform", "translate(" + (width+40) + " ,0)")
				.call(colorAxis);

			self.scatter_svg.selectAll(".colorscaleimage")
				.attr("width",  height-self.margin.bottom)
				.attr("transform", "translate(" + (width+17) + " ,"+(height-self.margin.bottom)+") rotate(270)");
		}

	}

	$(window).resize(resize);

	self.scatter_svg.append("rect")
		.attr("class", "zoom x box")
		.attr("width", width)
		.attr("height", this.margin.bottom)
		.attr("fill", "none")
		.attr("stroke", "none")
		.attr("transform", "translate(" + 0 + "," + (height - this.margin.bottom) + ")")
		.style("visibility", "hidden")
		.attr("pointer-events", "all")
		.call(xzoom);

	self.scatter_svg.append("rect")
		.attr("class", "zoom y box")
		.attr("width", this.margin.left)
		.attr("height", height - this.margin.bottom)
		.attr("transform", "translate(" + -this.margin.left + "," + 0 + ")")
		.attr("fill", "none")
		.attr("stroke", "none")
		.style("visibility", "hidden")
		.attr("pointer-events", "all")
		.call(yzoom);

	if(self.right_scale.length > 0){
		self.scatter_svg.append("rect")
			.attr("class", "zoom y2 box")
			.attr("width", this.margin.right)
			.attr("height", height - this.margin.bottom)
			.attr("transform", "translate(" + width + ",0)")
			.attr("fill", "none")
			.attr("stroke", "none")
			.style("visibility", "hidden")
			.attr("pointer-events", "all")
			.call(y2zoom);
	}

}

scatterPlot.prototype.updateTicks = function updateTicks(){
	var self = this;
	// In order to work with the canvas renderer styles need to be applied directlo
	// to svg elements instead of using a stile. Here we set stroke width and color 
	// for all ticks and axis paths
	self.scatter_svg.selectAll('.axis .domain')
      	.attr("stroke-width", "2")
      	.attr("stroke", "#000")
      	.attr("shape-rendering", "crispEdges")
      	.attr("fill", "none");

    self.scatter_svg.selectAll('.axis path')
      	.attr("stroke-width", "2")
      	.attr("shape-rendering", "crispEdges")
      	.attr("stroke", "#000");

    // Check if grid active and adapt style accordingly
  	if(self.grid_active){

		self.scatter_svg.selectAll('.axis line')
	      	.attr("stroke-width", "2")
	      	.attr("shape-rendering", "crispEdges")
	      	.attr("stroke", "#D3D3D3");

		self.xAxis.tickSize(-(self.height-self.margin.bottom));
		self.yAxis_left.tickSize(-self.width);
		

	}else{
		self.xAxis.tickSize(5);
		self.yAxis_left.tickSize(5);

		self.scatter_svg.selectAll('.axis line')
	      	.attr("stroke-width", "2")
	      	.attr("shape-rendering", "crispEdges")
	      	.attr("stroke", "#000");
	}

	// Update Axis to draw lines
	self.scatter_svg.select('.x.axis')
      .call(self.xAxis);

    self.scatter_svg.select('.y.axis')
      .call(self.yAxis_left);
    if(self.right_scale.length > 0){
	    self.scatter_svg.select('.y2.axis')
	      .call(self.yAxis_right);
    }
};

scatterPlot.prototype.renderdots = function renderdots(parameter){
	var self = this;

	d3.select('svg').selectAll(".dot_"+parameter).on('click',null);
	d3.select('svg').selectAll(".dot_"+parameter).on('mouseover',null);
	d3.select('svg').selectAll(".dot_"+parameter).remove();

	self.scatter_svg.selectAll(".dot_"+parameter)
		.data(self.data)
		.enter().append("circle")
		.attr("class", "area").attr("clip-path", "url(#clip)")
		.attr("class", "dot_"+parameter)

		.attr("r", 3.5)

		.attr("cx", function(d) { 
			return self.xScale(d[self.sel_x]); 
		})

		.attr("cy", function(d) { 
			if(self.right_scale.length > 0 && _.indexOf(self.right_scale, parameter) > -1 ){
				return self.yScale_right(d[parameter]);
			}else{
				return self.yScale_left(d[parameter]);
			}
		 })
		.style("fill", function(d) { 
			if (d["active"]){
				return self.parameter_colors(parameter);
			}else{
				return 'rgba(50,50,50,0.3)';
			}
		})
		.style("fill-opacity", function(d) { 
			if (d["active"]){
				return 1;
			}else{
				return 0.15;
			}
		})
		.style("stroke", function(d) {
			if (d["active"]){
				return self.colors(d.id); 
			}else{
				return 'rgba(50,50,50,0.3)';
			}
		})
		.style("stroke-width", 1)

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
			    if (propValue instanceof Date){
			    	propValue = propValue.toISOString();
			    }
			    if(propName != "active"){
				    values = values + propName + ": " + propValue + "<br>";
				}
			}
			values = '<br>'+values;

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
};

scatterPlot.prototype.updatedots = function updatedots(parameter){
	var self = this;
	// Force D3 to recalculate and update the dots 
	for (var i = self.sel_y.length - 1; i >= 0; i--) {
		self.scatter_svg.selectAll(".dot_"+self.sel_y[i])
			.attr("cx", function(d) {return self.xScale(d[self.sel_x]);})
			.attr("cy", function(d) {
				if(self.right_scale.length > 0 && _.indexOf(self.right_scale, self.sel_y[i]) > -1 ){
					return self.yScale_right(d[self.sel_y[i]]);
				}else{
					return self.yScale_left(d[self.sel_y[i]]);
				}
			});
	};
};

scatterPlot.prototype.applyFilters = function(){
	for (var i = this.sel_y.length - 1; i >= 0; i--) {
		this.renderdots(this.sel_y[i]);
	};
};

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

		if(self.fieldsforfiltering.length>1){
			for (var i = 0; i < self.fieldsforfiltering.length; i++) {
				if(self.parameters.indexOf(self.fieldsforfiltering[i])>0){
					self.active_filters.push(self.fieldsforfiltering[i]);
				}
			}
			self.fieldsforfiltering = [];
		}

		// Do some cleanup (especially on objects with events)
		d3.select(self.histoEl).selectAll(".brush").remove();
		d3.select("#reset_filters").remove();
		d3.select("#toggle_filters").remove();

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
		var buttonlabel = 'Hide filters <i class="fa fa-chevron-down" aria-hidden="true"></i>';
		if(self.filters_hidden){
			buttonlabel = 'Show filters <i class="fa fa-chevron-up" aria-hidden="true"></i>';
		}

		d3.select(this.histoEl).append("button")
			.attr("type", "button")
			.attr("class", "btn btn-success")
			.attr("id", "toggle_filters")
			.attr("style", "position: absolute; left: 58px; top:-30px;")
			.html(buttonlabel);


		if(!self.filters_hidden){
			var leftshift = 70;
			var	width = $(this.histoEl).width() - this.histoMargin.left - this.histoMargin.right - leftshift,
				height = $(this.histoEl).height() - this.histoMargin.top - this.histoMargin.bottom;

			this.x_hist = {};
			this.hist_data = {};
			this.y = {};
			this.x = d3.scale.ordinal().domain(self.active_filters).rangePoints([0, width]);
			this.axis = d3.svg.axis().orient("left");

			var line = d3.svg.line(),
			    foreground;

			// User general formatting for ticks on Axis
			this.axis.tickFormat(d3.format(".3g"));

			var svg = d3.select(this.histoEl).append("svg")
				.attr("class", "parallels")
			    .attr("width", $(this.histoEl).width())
			    .attr("height", $(this.histoEl).height())
			  	.append("g")
			  	.attr("display", "block")
			  	.attr("transform", "translate(" + (this.histoMargin.left+leftshift) + "," + (this.histoMargin.top) + ")");

			d3.select(this.histoEl).append("button")
		        .attr("type", "button")
		        .attr("class", "btn btn-success")
		        .attr("disabled", true)
		        .attr("id", "reset_filters")
		        .attr("style", "position: absolute; left: 174px; top:-30px;")
		        .html('Reset Filters <i class="fa fa-eraser erasorfunction" aria-hidden="true"></i>');


			d3.select(this.histoEl).append("div")
				.attr("class", "input-group")
				.attr("id", "filterinputgroup")
				.attr("style", "position: absolute; top:12px; height:15px; width:100%; left:30px; padding-left:28px;")
				.append("div")
				.attr("class", "input-group-btn")
				.append("button")
				.attr("id", "addfilteropen")
				.attr("type", "button")
				.attr("style", "width:60px;")
				.attr("class", "btn btn-default dropdown-toggle")
				.html('Add <span class="caret"></span>');

			d3.select("#filterinputgroup").append("div")
				.attr("class", "w2ui-field")
				.attr("style", "position: absolute; height:15px; width:"+($(this.histoEl).width()-100)+"px; left:"+(87)+"px;")
				.append("input")
				.attr("id", "filtermanager");

			var that = self;
			function handleClickedItem(evt){
				if($(evt.originalEvent.srcElement).hasClass("erasorfunction") ||
				   $(evt.originalEvent.srcElement).hasClass("w2ui-list-remove")){

					var index = that.active_brushes.indexOf(evt.item.id);
					if (index > -1) {
						that.active_brushes.splice(index, 1);
						that.y[evt.item.id].brush.clear();
					}

					that.active_brushes = that.active_filters.filter(function(p) { return !that.y[p].brush.empty(); });
					that.brush_extents = {};
					that.active_brushes.map(function(p) { that.brush_extents[p] = that.y[p].brush.extent(); });
					var filter = {};

					var active;
					
					_.each(that.data, function(row){
						active = true;
						that.active_brushes.forEach (function(p) {
							filter[p] = that.brush_extents[p];
					    	if (!(that.brush_extents[p][0] <= row[p] && row[p] <= that.brush_extents[p][1])){
					    		active = false;
					    	}
				    	});
						row["active"] = active ? 1 : 0;
					}); 

					that.filterset(filter);
					that.parallelsPlot();
					that.applyFilters();

				}
			}

			function handleRemovedItem(evt){
				if($(evt.originalEvent.srcElement).hasClass("w2ui-list-remove")){

					var index = that.active_filters.indexOf(evt.item.id);
					if (index > -1) {
						that.active_filters.splice(index, 1);
						that.y[evt.item.id].brush.clear();
					}

					that.active_brushes = that.active_filters.filter(function(p) { return !that.y[p].brush.empty(); });
					that.brush_extents = {};
					that.active_brushes.map(function(p) { that.brush_extents[p] = that.y[p].brush.extent(); });
					var filter = {};

					var active;
					
					_.each(that.data, function(row){
						active = true;
						that.active_brushes.forEach (function(p) {
							filter[p] = that.brush_extents[p];
					    	if (!(that.brush_extents[p][0] <= row[p] && row[p] <= that.brush_extents[p][1])){
					    		active = false;
					    	}
				    	});
						row["active"] = active ? 1 : 0;
					}); 

					that.filterset(filter);
					that.parallelsPlot();
					that.applyFilters();

				}
			}

			$('#filtermanager').w2field('enum', { 
				items: self.parameters, 
				openOnFocus: true,
				selected: self.active_filters,
				renderItem: function (item, index, remove) {
					item.style = "width: 100px; margin-left:"+(self.x(item.id))+"px; position: absolute;";
					var curfil = item.id;
					var erasericon = '';
					if(_.find(self.active_brushes, function(fil){return fil == curfil;})){
						erasericon = '<div class="erasoricon erasorfunction"><i class="fa fa-eraser erasorfunction" aria-hidden="true"></i></div>';
					}
					var html = remove + erasericon +self.createSubscript(item.id);
					return html;
				},
				renderDrop: function (item, options) {
					var html = item.id;
				return html;
				},
				onClick: handleClickedItem.bind(self),
				onRemove: handleRemovedItem.bind(self)
			});

			$( "#addfilteropen" ).click(function(){
				$("#filtermanager").focus();
			});

			$('#filtermanager').change(function(event){
				var parameters = $('#filtermanager').data('selected');
				self.active_filters = parameters.map(function(item) {return item.id;});
				self.parallelsPlot();
			});

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
				self.applyFilters();
			});

			// Handles a brush event, toggling the display of foreground lines.
			function brushend(parameter) {
				
				self.active_brushes = self.active_filters.filter(function(p) { return !self.y[p].brush.empty(); });
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
				
				self.applyFilters();
				self.parallelsPlot();

			}

		    self.svg = svg;
			// Create a scale and brush for each trait.
			self.active_filters.forEach(function(d) {

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
				


			self.active_filters.forEach(function(para) {

				var bar = svg.selectAll("." + para)
				    .data(self.hist_data[para])
				  	.enter().append("g")
				    .attr("class", "bar "+para)
				    .attr("transform", function(d) { 
				    	var height_modifier = self.y[para](d.x) - height/self.hist_data[para].length;
				    	if(!height_modifier){
				    		height_modifier = 0;
				    	}
				    	return "translate(" + self.x(para) + "," + height_modifier + ")";
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
			    .data(self.active_filters)
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
			    });
			    /*.append("svg:text")
			    .attr("text-anchor", "middle")
			    .attr("y", -15)
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
				});*/
				


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

		}
		var self = this;

		// Returns the path for a given data point.
		function path(d) {
			return line(self.parameters.map(function(p) {
			  	return [x(p), self.y[p](d[p])];
			}));
		}

		// Resize method, recalculates position of all elements in svg
		function resize_parallels() {

		    var leftshift = 70;
			var	width = $(self.histoEl).width() - self.histoMargin.left - self.histoMargin.right - leftshift,
				height = $(self.histoEl).height() - self.histoMargin.top - self.histoMargin.bottom;

			d3.select(".parallels")
			    .attr("width", $(self.histoEl).width())
			    .attr("height", $(self.histoEl).height());

			self.x.rangePoints([0,width]);

			var hd = self.hist_data;
			var yobj = self.y;


			self.active_filters.forEach(function(para) {

				yobj[para].range([height,0]);

				// TODO: Need for replacement of brushes when modifying height

				var bar = self.svg.selectAll("." + para)
					.data(self.hist_data[para])
				    .attr("transform", function(d) { 
				    	return "translate(" + self.x(para) + "," + (yobj[para](d.x) - height/hd[para].length) + ")";
				    });
			});

			// Add a group element for each trait.
			self.svg.selectAll(".trait")
				.data(self.active_filters)
			    .attr("transform", function(d) { 
			    	return "translate(" + self.x(d) + ")";
			    });

			self.svg.selectAll('.axis')
				.data(self.active_filters)
			    .each(function(d) { 
			    	d3.select(this).call(self.axis.scale(yobj[d]));
			    })

			$("#filterinputgroup .w2ui-field").width( $(self.histoEl).width()-100 );
			$('#filtermanager').w2field('enum', { 
				items: self.parameters, 
				openOnFocus: true,
				selected: self.active_filters,
				renderItem: function (item, index, remove) {
					item.style = "width: 100px; margin-left:"+(self.x(item.id))+"px; position: absolute;";
					var curfil = item.id;
					var erasericon = '';
					if(_.find(self.active_brushes, function(fil){return fil == curfil;})){
						erasericon = '<div class="erasoricon erasorfunction"><i class="fa fa-eraser erasorfunction" aria-hidden="true"></i></div>';
					}
					var html = remove + erasericon +self.createSubscript(item.id);
					return html;
				}
			});
		}

		d3.select("#toggle_filters").on("click", function(){


			if(self.filters_hidden){
				self.filters_hidden = false;
				$(self.histoEl).css("height", "39%");

				$(self.scatterEl).animate({height: "60%"}, {
					step: function( now, fx ) {
						$(self.scatterEl).trigger('resize');
					},
					complete: function() {
						$(self.scatterEl).trigger('resize');
						self.parallelsPlot();
						resize_parallels();
					}
				});

			}else{
				self.filters_hidden = true;
				$(self.scatterEl).animate({height: "95%"}, {
					step: function( now, fx ) {
						$(self.scatterEl).trigger('resize');
					}
				});
				$(self.histoEl).css("height", "40px");
				self.parallelsPlot();
				
			}
			
		});

		$(window).resize(resize_parallels);
	}
}


