// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
(function(){"use strict";jQuery.sap.require("sap.ushell.components.tiles.indicatorTileUtils.smartBusinessUtil");jQuery.sap.require("sap.ui.model.analytics.odata4analytics");sap.ui.getCore().loadLibrary("sap.suite.ui.commons");sap.ui.jsview("sap.ushell.components.tiles.indicatorArea.AreaChartTile",{getControllerName:function(){return"sap.ushell.components.tiles.indicatorArea.AreaChartTile";},createContent:function(c){this.setHeight('100%');this.setWidth('100%');var h="Lorem ipsum";var s="Lorem ipsum";var t=sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);if(t.title&&t.subTitle){h=t.title;s=t.subTitle;}var b=function(n){return new sap.suite.ui.microchart.AreaMicroChartItem({color:"Good",points:{path:"/"+n+"/data",template:new sap.suite.ui.microchart.AreaMicroChartPoint({x:"{day}",y:"{balance}"})}});};var a=function(n){return new sap.suite.ui.microchart.AreaMicroChartLabel({label:"{/"+n+"/label}",color:"{/"+n+"/color}"});};var g={subheader:s,header:h,footerNum:"",footerComp:"",scale:"",unit:"",value:8888,size:"Auto",frameType:"OneByOne",state:sap.m.LoadState.Loading};this.oNVConfContS=new sap.suite.ui.microchart.AreaMicroChart({width:"{/width}",height:"{/height}",size:"{/size}",target:b("target"),innerMinThreshold:b("innerMinThreshold"),innerMaxThreshold:b("innerMaxThreshold"),minThreshold:b("minThreshold"),maxThreshold:b("maxThreshold"),chart:b("chart"),minXValue:"{/minXValue}",maxXValue:"{/maxXValue}",minYValue:"{/minYValue}",maxYValue:"{/maxYValue}",firstXLabel:a("firstXLabel"),lastXLabel:a("lastXLabel"),firstYLabel:a("firstYLabel"),lastYLabel:a("lastYLabel"),minLabel:a("minLabel"),maxLabel:a("maxLabel")});this.oNVConfS=new sap.ushell.components.tiles.sbtilecontent({unit:"{/unit}",size:"{/size}",footer:"{/footerNum}",content:this.oNVConfContS});this.oGenericTile=new sap.m.GenericTile({subheader:"{/subheader}",frameType:"{/frameType}",size:"{/size}",header:"{/header}",tileContent:[this.oNVConfS]});var G=new sap.ui.model.json.JSONModel();G.setData(g);this.oGenericTile.setModel(G);return this.oGenericTile;}});}());
