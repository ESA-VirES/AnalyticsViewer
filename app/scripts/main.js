

//Example Data

//var plotdata = "";



/*var plotdata = "descr,r,g,b,a\n"+
"TEST_SAR,0.761541370537,0.768791864189,0.0666862170552,0.557654142818\n"+
"TEST_SAR,0.536185570583,0.344579369451,0.836246768063,0.0797144795387\n"+
"TEST_SAR,0.949489934255,0.0610118253394,0.129181108269,0.62434675067\n"+
"TEST_SAR,0.188981709233,0.763255424047,0.398275608919,0.259770382284\n"+
"TEST_SAR,0.803680811363,0.157337957053,0.0828667750986,0.129449528982";*/




/*var plotdata = "id,val1,val2\n"+
"id0,0.761541370537,0.768791864189\n"+
"id0,0.536185570583,0.344579369451\n"+
"id0,0.949489934255,0.0610118253394\n"+
"id1,0.188981709233,0.763255424047\n"+
"id1,0.761541370537,0.768791864189\n"+
"id1,0.54634563464,0.12343465434\n"+
"id2,0.34527145,0.1344362\n"+
"id2,0.2134721345,0.26415\n"+
"id2,0.803680811363,0.157337957053";*/



/*
var plotdata = "id,val1\n"+
"id0,0.761541370537\n"+
"id0,0.536185570583\n"+
"id0,0.949489934255\n"+
"id1,0.188981709233\n"+
"id1,0.803680811363";
*/

/*
var plotdata = "id,r,g,b,a\n"+
"TEST_SAR,99.0,99.0,1000.0,255.0\n"+
"TEST_SAR,110.0,110.0,1.0,255.0\n"+
"TEST_SAR,125.0,125.0,1.0,255.0\n";
*/

/*var plotdata = 
'id,time,val\n'+
'TS1,2013-05-15T00:00:00Z,178\n'+
'TS1,2013-05-16T00:00:00Z,208\n'+
'TS1,2013-05-17T00:00:00Z,178\n'+
'TS1,2013-05-18T00:00:00Z,190\n'+
'TS1,2013-05-19T00:00:00Z,160\n'+
'TS1,2013-05-20T00:00:00Z,78\n'+
'TS1,2013-05-21T00:00:00Z,118\n'+
'TS1,2013-05-22T00:00:00Z,89\n'+
'TS1,2013-05-23T00:00:00Z,76\n'+
'TS1,2013-05-24T00:00:00Z,91\n'+
'TS1,2013-05-25T00:00:00Z,190\n'+
'TS1,2013-05-26T00:00:00Z,111\n'+
'TS1,2013-05-27T00:00:00Z,123\n'+
'TS1,2013-05-28T00:00:00Z,76\n'+

'TS2,2013-05-15T00:00:00Z,76\n'+
'TS2,2013-05-16T00:00:00Z,141\n'+
'TS2,2013-05-17T00:00:00Z,150\n'+
'TS2,2013-05-18T00:00:00Z,114\n'+
'TS2,2013-05-19T00:00:00Z,161\n'+
'TS2,2013-05-20T00:00:00Z,82\n'+
'TS2,2013-05-21T00:00:00Z,57\n'+
'TS2,2013-05-22T00:00:00Z,54\n'+
'TS2,2013-05-23T00:00:00Z,12\n'+
'TS2,2013-05-24T00:00:00Z,93\n'+
'TS2,2013-05-25T00:00:00Z,190\n'+
'TS2,2013-05-26T00:00:00Z,111\n'+
'TS2,2013-05-27T00:00:00Z,167\n'+
'TS2,2013-05-28T00:00:00Z,76\n'+
              
'TS3,2013-05-15T00:00:00Z,178\n'+
'TS3,2013-05-16T00:00:00Z,152\n'+
'TS3,2013-05-17T00:00:00Z,122\n'+
'TS3,2013-05-18T00:00:00Z,138\n'+
'TS3,2013-05-19T00:00:00Z,160\n'+
'TS3,2013-05-20T00:00:00Z,111\n'+
'TS3,2013-05-21T00:00:00Z,118\n'+
'TS3,2013-05-22T00:00:00Z,89\n'+
'TS3,2013-05-23T00:00:00Z,65\n'+
'TS3,2013-05-24T00:00:00Z,91\n'+
'TS3,2013-05-25T00:00:00Z,20\n'+
'TS3,2013-05-26T00:00:00Z,150\n'+
'TS3,2013-05-27T00:00:00Z,123\n'+
'TS3,2013-05-28T00:00:00Z,164\n'+

'TS4,2013-05-15T00:00:00Z,97\n'+
'TS4,2013-05-16T00:00:00Z,20\n'+
'TS4,2013-05-17T00:00:00Z,178\n'+
'TS4,2013-05-18T00:00:00Z,12\n'+
'TS4,2013-05-19T00:00:00Z,160\n'+
'TS4,2013-05-20T00:00:00Z,78\n'+
'TS4,2013-05-21T00:00:00Z,58\n'+
'TS4,2013-05-22T00:00:00Z,1\n'+
'TS4,2013-05-23T00:00:00Z,33\n'+
'TS4,2013-05-24T00:00:00Z,123\n'+
'TS4,2013-05-25T00:00:00Z,186\n'+
'TS4,2013-05-26T00:00:00Z,20\n'+
'TS4,2013-05-27T00:00:00Z,123\n'+
'TS4,2013-05-28T00:00:00Z,96\n'+

'TS5,2013-05-15T00:00:00Z,178\n'+
'TS5,2013-05-16T00:00:00Z,30\n'+
'TS5,2013-05-17T00:00:00Z,76\n'+
'TS5,2013-05-18T00:00:00Z,190\n'+
'TS5,2013-05-19T00:00:00Z,15\n'+
'TS5,2013-05-20T00:00:00Z,78\n'+
'TS5,2013-05-21T00:00:00Z,118\n'+
'TS5,2013-05-22T00:00:00Z,89\n'+
'TS5,2013-05-23T00:00:00Z,44\n'+
'TS5,2013-05-24T00:00:00Z,91\n'+
'TS5,2013-05-25T00:00:00Z,190\n'+
'TS5,2013-05-26T00:00:00Z,111\n'+
'TS5,2013-05-27T00:00:00Z,14\n'+
'TS5,2013-05-28T00:00:00Z,76\n'+

'TS6,2013-05-15T00:00:00Z,178\n'+
'TS6,2013-05-16T00:00:00Z,46\n'+
'TS6,2013-05-17T00:00:00Z,12\n'+
'TS6,2013-05-18T00:00:00Z,1\n'+
'TS6,2013-05-19T00:00:00Z,101\n'+
'TS6,2013-05-20T00:00:00Z,78\n'+
'TS6,2013-05-21T00:00:00Z,118\n'+
'TS6,2013-05-22T00:00:00Z,89\n'+
'TS6,2013-05-23T00:00:00Z,56\n'+
'TS6,2013-05-24T00:00:00Z,91\n'+
'TS6,2013-05-25T00:00:00Z,5\n'+
'TS6,2013-05-26T00:00:00Z,111\n'+
'TS6,2013-05-27T00:00:00Z,87\n'+
'TS6,2013-05-28T00:00:00Z,76\n'+

'TS7,2013-05-15T00:00:00Z,178\n'+
'TS7,2013-05-16T00:00:00Z,208\n'+
'TS7,2013-05-17T00:00:00Z,178\n'+
'TS7,2013-05-18T00:00:00Z,190\n'+
'TS7,2013-05-19T00:00:00Z,160\n'+
'TS7,2013-05-20T00:00:00Z,78\n'+
'TS7,2013-05-21T00:00:00Z,118\n'+
'TS7,2013-05-22T00:00:00Z,89\n'+
'TS7,2013-05-23T00:00:00Z,123\n'+
'TS7,2013-05-24T00:00:00Z,91\n'+
'TS7,2013-05-25T00:00:00Z,190\n'+
'TS7,2013-05-26T00:00:00Z,111\n'+
'TS7,2013-05-27T00:00:00Z,123\n'+
'TS7,2013-05-28T00:00:00Z,76\n'+

'TS8,2013-05-15T00:00:00Z,178\n'+
'TS8,2013-05-16T00:00:00Z,208\n'+
'TS8,2013-05-17T00:00:00Z,178\n'+
'TS8,2013-05-18T00:00:00Z,190\n'+
'TS8,2013-05-19T00:00:00Z,160\n'+
'TS8,2013-05-20T00:00:00Z,78\n'+
'TS8,2013-05-21T00:00:00Z,118\n'+
'TS8,2013-05-22T00:00:00Z,89\n'+
'TS8,2013-05-23T00:00:00Z,150\n'+
'TS8,2013-05-24T00:00:00Z,91\n'+
'TS8,2013-05-25T00:00:00Z,190\n'+
'TS8,2013-05-26T00:00:00Z,111\n'+
'TS8,2013-05-27T00:00:00Z,123\n'+
'TS8,2013-05-28T00:00:00Z,76\n'+

'TS9,2013-05-15T00:00:00Z,178\n'+
'TS9,2013-05-16T00:00:00Z,208\n'+
'TS9,2013-05-17T00:00:00Z,178\n'+
'TS9,2013-05-18T00:00:00Z,190\n'+
'TS9,2013-05-19T00:00:00Z,160\n'+
'TS9,2013-05-20T00:00:00Z,78\n'+
'TS9,2013-05-21T00:00:00Z,118\n'+
'TS9,2013-05-22T00:00:00Z,89\n'+
'TS9,2013-05-23T00:00:00Z,180\n'+
'TS9,2013-05-24T00:00:00Z,91\n'+
'TS9,2013-05-25T00:00:00Z,190\n'+
'TS9,2013-05-26T00:00:00Z,111\n'+
'TS9,2013-05-27T00:00:00Z,123\n'+
'TS9,2013-05-28T00:00:00Z,76\n'+

'TS10,2013-05-15T00:00:00Z,178\n'+
'TS10,2013-05-16T00:00:00Z,208\n'+
'TS10,2013-05-17T00:00:00Z,178\n'+
'TS10,2013-05-18T00:00:00Z,190\n'+
'TS10,2013-05-19T00:00:00Z,160\n'+
'TS10,2013-05-20T00:00:00Z,78\n'+
'TS10,2013-05-21T00:00:00Z,118\n'+
'TS10,2013-05-22T00:00:00Z,89\n'+
'TS10,2013-05-23T00:00:00Z,20\n'+
'TS10,2013-05-24T00:00:00Z,91\n'+
'TS10,2013-05-25T00:00:00Z,190\n'+
'TS10,2013-05-26T00:00:00Z,111\n'+
'TS10,2013-05-27T00:00:00Z,123\n'+
'TS10,2013-05-28T00:00:00Z,76\n';*/


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



/*var plotdata = 
'id,time,val\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T00:00:00Z,278.249267578\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T00:00:00Z,279.467041016\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T01:00:00Z,277.314208984\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T01:00:00Z,279.559082031\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T02:00:00Z,279.310791016\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T02:00:00Z,276.83984375\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T03:00:00Z,279.552001953\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T03:00:00Z,276.538330078\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T04:00:00Z,276.584716797\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T04:00:00Z,279.896484375\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T05:00:00Z,278.245361328\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T05:00:00Z,281.733642578\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T06:00:00Z,281.226806641\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T06:00:00Z,284.327636719\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T07:00:00Z,286.869140625\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T07:00:00Z,283.166992188\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T08:00:00Z,288.613037109\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T08:00:00Z,284.842285156\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T09:00:00Z,289.746826172\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T09:00:00Z,286.391357422\n'+
'MOD07_Surface_temperature_data,2013-05-15T09:25:00Z,290.89\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T10:00:00Z,290.380615234\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T10:00:00Z,287.833251953\n'+
'MOD07_Surface_temperature_data,2013-05-15T11:00:00Z,288.55\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T11:00:00Z,288.913574219\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T11:00:00Z,290.883544922\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T12:00:00Z,289.532714844\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T12:00:00Z,291.344726562\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T13:00:00Z,291.099853516\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T13:00:00Z,289.459960938\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T14:00:00Z,290.503173828\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T14:00:00Z,288.927734375\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T15:00:00Z,289.779541016\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T15:00:00Z,288.460205078\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T16:00:00Z,288.479492188\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T16:00:00Z,287.590332031\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T17:00:00Z,286.143798828\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T17:00:00Z,286.302734375\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T18:00:00Z,284.770751953\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T18:00:00Z,284.827148438\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T19:00:00Z,283.511230469\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T19:00:00Z,283.422119141\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T20:00:00Z,282.722900391\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T20:00:00Z,282.828613281\n'+
'MOD07_Surface_temperature_data,2013-05-15T20:35:00Z,282.91\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T21:00:00Z,282.405273438\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T21:00:00Z,282.247070312\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T22:00:00Z,281.846923828\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T22:00:00Z,282.090087891\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-15T23:00:00Z,281.275634766\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-15T23:00:00Z,282.079833984\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T00:00:00Z,280.682861328\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T00:00:00Z,281.848388672\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T01:00:00Z,280.218994141\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T01:00:00Z,281.564453125\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T02:00:00Z,281.398925781\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T02:00:00Z,279.579589844\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T03:00:00Z,278.823486328\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T03:00:00Z,281.206054688\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T04:00:00Z,281.271484375\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T04:00:00Z,278.873046875\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T05:00:00Z,281.856445312\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T05:00:00Z,281.639160156\n'+
'AROME_Temperature_surface_201305150000_data,2013-05-16T06:00:00Z,285.208007812\n'+
'ALARO_Temperature_surface_201305150000_data,2013-05-16T06:00:00Z,282.879638672';*/

/*var plotdata = "id,time,val\n"+
"ts1,2003-03-12T15:23,27.3847880968\n"+
"ts1,2003-03-13T15:23,31.231231\n"+
"ts1,2003-03-14T15:23,1.231231\n"+
"ts1,2003-03-15T15:23,10.231231\n"+
"ts2,2003-03-12T15:23,56.231231\n"+
"ts2,2003-03-13T15:23,123.231231\n"+
"ts2,2003-03-14T15:23,11.231231\n"+
"ts2,2003-03-15T15:23,98.231231\n";*/

//+
/*"ts1, 1154318400000, 32\n"+
"ts1, 1174318400000, 15\n"+
"ts1, 1194318400000, 29\n"+
"ts1, 1214318400000, 11\n"+
"ts2, 1138683600000, 1.3847880968\n"+
"ts2, 1154318400000, 20\n"+
"ts2, 1174318400000, 6\n"+
"ts2, 1194318400000, 9\n"+
"ts2, 1214318400000, 15\n"+
"ts3, 1138683600000, 9.3847880968\n"+
"ts3, 1154318400000, 11\n"+
"ts3, 1174318400000, 15\n"+
"ts3, 1194318400000, 19\n"+
"ts3, 1214318400000, 23\n";*/


/*var plotdata = "id,r,g,b,a\n"+
	"asd,0.1536185570583,0.17536185570583,0.6536185570583,0.100\n"+
	"asd,0.2536185570583,0.23536185570583,0.2536185570583,0.536185570583\n"+
	"asd,0.3536185570583,0.37536185570583,0.6536185570583,0.100\n"+
	"as,0.4536185570583,0.43536185570583,0.2536185570583,0.536185570583\n"+
	"as,0.5536185570583,0.51536185570583,0.0536185570583,0.536185570583\n"+
	"as,100.6536185570583,0.67536185570583,0.6536185570583,0.100\n"+
	"yx,0.7536185570583,0.73536185570583,0.2536185570583,0.536185570583\n"+
	"yx,0.8536185570583,0.81536185570583,0.0536185570583,0.536185570583";*/


/*
var plotdata = "id,val1,val2,val3,val4,val5\n"+
"id0,'2010-07-22T01:38:40Z',0.768791864189,0.0666862170552,0.557654142818,0.840223998953\n"+
"id1,'2010-07-22T02:38:40Z',0.344579369451,0.836246768063,0.0797144795387,0.0777813168074\n"+
"id2,'2010-07-22T03:38:40Z',0.0610118253394,0.129181108269,0.62434675067,0.698046540216\n"+
"id3,'2010-07-22T04:38:40Z',0.763255424047,0.398275608919,0.259770382284,0.924085735394\n"+
"id4,'2010-07-22T05:38:40Z',0.157337957053,0.0828667750986,0.129449528982,0.969509351777\n";
*/

var parsedData = [{"id":"ALARO_Temperature_surface","val":281.040283203125,"height":new Date("2013-05-15T05:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.82177734375,"height":new Date("2013-05-15T08:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.553466796875,"height":new Date("2013-05-15T07:00:00.000Z")},{"id":"ALARO_Temperature_surface","val":280.425537109375,"height":new Date("2013-05-15T06:00:00.000Z")}];

sp = null;

function onscatterPlot(){

	var colors = d3.scale.ordinal()
    	.domain(["MOD07_Retrived_Temperature_Profile","AROME_Temperature_isobaric_201305150000"])
    	.range(["#1f77b4", "#ff7f0e"]);

	var args = {
		scatterEl: "#scatter",
		histoEl: "#histograms",
		//url: "data/out2.csv",
		dateformat: "%Y-%m-%d",
		/*selection_x: "availabilityTime",
		selection_y: ["baselinePerpendicularOffset"],*/
		selection_x: "height",
		selection_y: ["val"],
		toIgnoreHistogram: ["productURI", "thumbnailImageLocationList","footprint", "orbitDirection", "polarisationMode", "productId", "browseImageLocationList", "platformShortName","platformSerialIdentifier","instrumentShortName","sensorType","operationalMode","orbitNumber","wrsLongitudeGrid","wrsLatitudeGrid","startTimeFromAscendingNode","completionTimeFromAscendingNode","acquisitionType","polarisationChannels","dopplerFrequency"]
		//url: "http://localhost:8000/vires00/ows?service=WPS&version=1.0.0&request=Execute&identifier=retrieve_data&DataInputs=collection_ids=SW_OPER_MAGB_LR_1B_20141001T000000_20141001T235959_0301_MDR_MAG_LR&rawdataoutput=output"
		//data: plotdata,
		//colors: colors
		,parsedData: parsedData,
		//showDropDownSelection: false
	};

	this.sp = new scatterPlot(args, function(){
		//sp.absolute("id1","Latitude");
		//sp.colatitude("undefined");
	}, function(values){
		console.log(values);
	}, function(filter){
		console.log(filter);
	});

	this.sp.loadData(args);



}

function onboxPlot(){

	/*var args = {
		selector: "#canvas",
		data: plotdata
	};
	analytics.boxPlot(args);*/
	var args = {
		selector: "#canvas",
		url: "data/swarmdata2.csv"
	};
	this.sp.loadData(args);

}

function onstackedPlot(){

	/*var args = {
		selector: "#canvas",
		data: plotdata
	};

	analytics.stackedPlot(args);*/
	var args = {
		selector: "#canvas",
		url: "data/swarmdata.csv"
	};
	this.sp.loadData(args);
}


function onparallelsPlot(){

	var args = {
		selector: "#canvas",
		data: plotdata
	};
	analytics.parallelsPlot(args);
}

function onlinePlot(){


    var colors = d3.scale.ordinal()
    	.domain(["TS1","TS3","TS2","TS5","TS4","TS7","TS6","TS8","TS9","TS10"])
    	.range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]);

			    

	var args = {
		selector: "#canvas",
		data: plotdata,
		colors: colors
	};

	analytics.linePlot(args);
}