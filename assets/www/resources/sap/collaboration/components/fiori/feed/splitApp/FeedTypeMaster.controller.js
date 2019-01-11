/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.controller("sap.collaboration.components.fiori.feed.splitApp.FeedTypeMaster",{onInit:function(){this.sJamToken=this.getView().getViewData().jamToken;this.sPrefixId=this.getView().getViewData().controlId;this.oBusinessObject=this.getView().getViewData().object;},listItemPress:function(f){if(f===sap.collaboration.FeedType.follows||f===sap.collaboration.FeedType.company){this.getJamWidget(f);this.setDetailPageTitle(f);}else{this.navigateToGroupMaster(f);}},getJamWidget:function(f){var j=new sap.collaboration.components.utils.JamUtil();var w=j.prepareWidgetData(this.sJamToken,f,"",this.oBusinessObject);j.createJamWidget(this.sPrefixId+"widgetContainer",w);},setDetailPageTitle:function(f){var d;f===sap.collaboration.FeedType.follows?d=this.getView().oLangBundle.getText("FRV_DOMAIN_DATA_FEED_TYPES_FOLLOWS"):d=this.getView().oLangBundle.getText("FRV_DOMAIN_DATA_FEED_TYPES_COMPANY");sap.ui.getCore().byId(this.sPrefixId+"feedDetailsPage").setTitle(d);},navigateToGroupMaster:function(f){var n=this.createNavigationData(f);sap.ui.getCore().getEventBus().publish("nav","to",n);},createNavigationData:function(f){var d;f===sap.collaboration.FeedType.group?d={viewName:"sap.collaboration.components.fiori.feed.splitApp.GroupMaster",viewId:this.sPrefixId+"groupMasterView",data:{feedType:sap.collaboration.FeedType.group,lanBundle:this.getView().oLangBundle,groupMasterPageTitle:this.getView().oLangBundle.getText("GROUP_MASTER_PAGE_GROUP_TITLE")}}:d={viewName:"sap.collaboration.components.fiori.feed.splitApp.GroupMaster",viewId:this.sPrefixId+"groupMasterView",data:{feedType:sap.collaboration.FeedType.object,lanBundle:this.getView().oLangBundle,groupMasterPageTitle:this.getView().oLangBundle.getText("GROUP_MASTER_PAGE_BO_TITLE")}};return d;}});
