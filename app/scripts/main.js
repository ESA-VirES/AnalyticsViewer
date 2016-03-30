

//Example Data

//var plotdata = "";



/*var plotdata = 
'"id","Value","Height (m)","Size", "Latitude", "Longitude", "F", "Time"\n'+
'"Retrived_Temperature_Profile_20130515092500","288.14","543.657372416","3","70","-100","10000000","2013-05-15T00:00:00Z"\n'+
'"Retrived_Temperature_Profile_20130515092500","282.81","1481.79149483","3","80","50","10000000","2013-05-16T00:00:00Z"\n'+
'"Retrived_Temperature_Profile_20130515092500","274.01","3119.40302242","3","90","60","10000000","2013-05-17T00:00:00Z"\n'+
'"Retrived_Temperature_Profile_20130515092500","255.78","5957.38264922","3","-50","70","10000000","2013-05-18T00:00:00Z"\n'+
'"Retrived_Temperature_Profile_20130515092500","242.88","7839.48994829","3","-40","80","10000000","2013-05-19T00:00:00Z"\n'+
'"Retrived_Temperature_Profile_20130515092500","226.96","10265.9482761","3","30","90","10000000","2013-05-20T00:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","292.63","111.023387738","3","15","180","10000000","2013-05-15T30:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","292.07","195.793081312","3","25","-160","10000000","2013-05-16T30:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","291.54","324.566781321","3","35","45","10000000","2013-05-17T30:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","290.02","455.337052179","3","45","95","10000000","2013-05-18T30:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","289.34","543.657372416","3","-15","15","10000000","2013-05-19T30:00:00Z"\n'+
'"Temperature_isobaric_5150000_20130515090000","288.78","632.912316569","3","-45","25","10000000","2013-05-20T30:00:00Z"\n';*/





var plotdata =
'dB_AOCS,dB_other,Flags_B,Flags_F,F,Timestamp,q_NEC_CRF,Longitude,B_NEC,Flags_q,Flags_Platform,Radius,SyncStatus,B_error,Latitude,F_error,B_VFM,dF_AOCS,dF_other,ASM_Freq_Dev,Att_error\n'+
'{1.6053;0.7096;-1.5898},{0.1055;0.0561;0.1214},0,1,23200.8318,2014-10-01 00:00:00,{0.003582121;-0.010043989;0.999927588;-0.005577191},-5.9801832,{18442.4187;-3272.5702;-13691.5932},0,1,6893330.57,0,{0.509;0.4973;0.5051},-5.2450082,0.0785,{-17296.3175;3979.4081;14943.0237},0.0,0.0,0.0,1.1103\n'+
'{1.4907;0.4656;-1.6636},{0.1128;0.0556;0.1199},0,1,23125.9352,2014-10-01 00:00:20,{0.003550959;-0.008913144;0.999938526;-0.005557922},-6.0138989,{17798.1246;-3347.522;-14382.0979},0,1,6893523.93,0,{0.5073;0.4957;0.5066},-6.5083574,0.0774,{-17828.5542;4064.0147;14158.048},0.0,-0.1679,0.0,1.2915';


var parsedData = [{"id":"ALARO_Temperature_surface","val":281.040283203125,"height":new Date("2013-05-15T05:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.82177734375,"height":new Date("2013-05-15T08:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.553466796875,"height":new Date("2013-05-15T07:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.425537109375,"height":new Date("2013-05-15T06:00:00.000Z")}];


/*var colors = d3.scale.ordinal()
	.domain(["MOD07_Retrived_Temperature_Profile","AROME_Temperature_isobaric_201305150000"])
	.range(["#1f77b4", "#ff7f0e"]);*/

var args = {
	scatterEl: "#scatter",
	histoEl: "#histograms",
	//url: "data/out2.csv",
	dateformat: "%Y-%m-%d",
	/*selection_x: "availabilityTime",
	selection_y: ["baselinePerpendicularOffset"],*/
	selection_x: "height",
	selection_y: ["val"],
	toIgnoreHistogram: ["productURI", "thumbnailImageLocationList","footprint", "orbitDirection", "polarisationMode", "productId", "browseImageLocationList", "platformShortName","platformSerialIdentifier","instrumentShortName","sensorType","operationalMode","orbitNumber","wrsLongitudeGrid","wrsLatitudeGrid","startTimeFromAscendingNode","completionTimeFromAscendingNode","acquisitionType","polarisationChannels","dopplerFrequency"],
	//url: "http://localhost:8000/vires00/ows?service=WPS&version=1.0.0&request=Execute&identifier=retrieve_data&DataInputs=collection_ids=SW_OPER_MAGB_LR_1B_20141001T000000_20141001T235959_0301_MDR_MAG_LR&rawdataoutput=output"
	url: 'data/swarmdata2.csv'
	//data: plotdata,
	//colors: colors
	//,parsedData: parsedData,
	//showDropDownSelection: false
};

var sp = null;

function init(){
	sp = new scatterPlot(args, function(){
		//sp.absolute("id1","Latitude");
		//sp.colatitude("undefined");
	}, function(values){
		console.log(values);
	}, function(filter){
		console.log(filter);
	});
}

init();



function onscatterPlot(){

	sp.loadData(args);

}
