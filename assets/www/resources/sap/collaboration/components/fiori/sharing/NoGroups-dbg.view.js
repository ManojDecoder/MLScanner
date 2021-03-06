/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2017 SAP SE. All rights reserved
 */

sap.ui.jsview("sap.collaboration.components.fiori.sharing.NoGroups", {

	/**
	 * Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * memberOf NoGroups
	 */ 
	getControllerName : function() {
		return "sap.collaboration.components.fiori.sharing.NoGroups";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * Creates and returns a UI5 mobile VBox 
	 */ 
	createContent : function(oController) {
		var sPrefixId = this.getViewData().controlId;
		
		this.oNoGroupsVBox = new sap.m.VBox(sPrefixId + "_NoGroupsVbox");
		this.oNoGroupsVBox.addItem(this.createNoDataLayout());
		
		return this.oNoGroupsVBox;
	},
	
	/** 
	 * Creates the UI5 elements/controls that should be rendered in the VBox
	 * @param {sap.ui.controller} oController The view Controller
	 * @private
	 */ 
	createNoDataLayout : function(oController) {
		var sPrefixId = this.getViewData().controlId;
		var oLangBundle = this.getViewData().langBundle;
		var sJamUrl = this.getViewData().jamUrl;
		
		// Prepare the UI controls in case of no groups available 
		this.oNoDataLayout = new sap.ui.layout.VerticalLayout(sPrefixId + "_NoDataLayout", {
			width: "100%",
		    content: [
						new sap.ui.core.HTML(sPrefixId + "_NoDataDiv", {content: "<div>" + oLangBundle.getText("NO_GROUPS_ERROR") + "</div>"}),
						new sap.m.VBox(sPrefixId + "_LinkVbox",{
							alignItems: sap.m.FlexAlignItems.End,
							items: [
				                new sap.m.Link(sPrefixId + "_JamLink", {
				                	text : oLangBundle.getText("JAM_URL_TEXT"),
				                	target: "_blank",
				                	href : sJamUrl
				                })
			                ]
						}).addStyleClass("linkVBox")
			]
		});
		
		return this.oNoDataLayout;
		
	}
});