function init(){sp=new scatterPlot(args,function(){},function(a){console.log(a)},function(a){console.log(a)})}function onscatterPlot(){sp.loadData(args)}var plotdata="dB_AOCS,dB_other,Flags_B,Flags_F,F,Timestamp,q_NEC_CRF,Longitude,B_NEC,Flags_q,Flags_Platform,Radius,SyncStatus,B_error,Latitude,F_error,B_VFM,dF_AOCS,dF_other,ASM_Freq_Dev,Att_error\n{1.6053;0.7096;-1.5898},{0.1055;0.0561;0.1214},0,1,23200.8318,2014-10-01 00:00:00,{0.003582121;-0.010043989;0.999927588;-0.005577191},-5.9801832,{18442.4187;-3272.5702;-13691.5932},0,1,6893330.57,0,{0.509;0.4973;0.5051},-5.2450082,0.0785,{-17296.3175;3979.4081;14943.0237},0.0,0.0,0.0,1.1103\n{1.4907;0.4656;-1.6636},{0.1128;0.0556;0.1199},0,1,23125.9352,2014-10-01 00:00:20,{0.003550959;-0.008913144;0.999938526;-0.005557922},-6.0138989,{17798.1246;-3347.522;-14382.0979},0,1,6893523.93,0,{0.5073;0.4957;0.5066},-6.5083574,0.0774,{-17828.5542;4064.0147;14158.048},0.0,-0.1679,0.0,1.2915",parsedData=[{id:"ALARO_Temperature_surface",val:281.040283203125,height:new Date("2013-05-15T05:00:00.000Z")},{id:"ALARO_Temperature_surface",val:280.82177734375,height:new Date("2013-05-15T08:00:00.000Z")},{id:"ALARO_Temperature_surface",val:280.553466796875,height:new Date("2013-05-15T07:00:00.000Z")},{id:"ALARO_Temperature_surface",val:280.425537109375,height:new Date("2013-05-15T06:00:00.000Z")}],args={scatterEl:"#scatter",histoEl:"#histograms",dateformat:"%Y-%m-%d",selection_x:"height",selection_y:["val"],toIgnoreHistogram:["productURI","thumbnailImageLocationList","footprint","orbitDirection","polarisationMode","productId","browseImageLocationList","platformShortName","platformSerialIdentifier","instrumentShortName","sensorType","operationalMode","orbitNumber","wrsLongitudeGrid","wrsLatitudeGrid","startTimeFromAscendingNode","completionTimeFromAscendingNode","acquisitionType","polarisationChannels","dopplerFrequency"],url:"data/swarmdata2.csv"},sp=null;init();