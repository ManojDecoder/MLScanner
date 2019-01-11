(function(){"use strict";jQuery.sap.require("sap.ovp.cards.ActionUtils");jQuery.sap.require("sap.ui.generic.app.navigation.service.NavigationHandler");jQuery.sap.require("sap.ui.generic.app.navigation.service.PresentationVariant");jQuery.sap.require("sap.ovp.cards.CommonUtils");var A=sap.ovp.cards.ActionUtils;sap.ui.controller("sap.ovp.cards.generic.Card",{onInit:function(){var s=this.getView().mPreprocessors.xml[0].ovpCardProperties.oData.state;if(s!=="Loading"&&s!=="Error"){var h=this.getView().byId("ovpCardHeader");if(!!h){h.attachBrowserEvent("click",this.onHeaderClick.bind(this));h.addEventDelegate({onkeydown:function(e){if(!e.shiftKey&&(e.keyCode==13||e.keyCode==32)){e.preventDefault();this.onHeaderClick();}}.bind(this)});}}var n=this.getView().byId("kpiNumberValue");if(n){n.addEventDelegate({onAfterRendering:function(){var $=n.$();var a=$.find(".sapMNCValueScr");var b=$.find(".sapMNCScale");a.attr("aria-label",a.text());b.attr("aria-label",b.text());var c=this.getView().byId("ovpCardHeader").getDomRef();var C=this.getOwnerComponent().getComponentData();if(!!C&&!!C.appComponent){var d=C.appComponent;if(!!d.getModel("ui")){var u=d.getModel("ui");if(!!u.getProperty("/containerLayout")&&u.getProperty("/containerLayout")==="resizable"){var D=C.appComponent.getDashboardLayoutUtil();if(!!D){D.setKpiNumericContentWidth(c);}}}}}.bind(this)});}var o=this.getView().byId("ovpTable");if(o){o.addEventDelegate({onAfterRendering:function(){var O=this.getView().byId("ovpTable");var $=O.$();var a=$.find(".ovpTableSmartLink");if(a.length>0){a.removeAttr("aria-labelledby");}}.bind(this)});}},exit:function(){if(this.resizeHandlerId){sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);}},onAfterRendering:function(){this.enableClick=true;var c=this.getCardPropertiesModel().getProperty("/contentFragment");var C=this.getOwnerComponent().getComponentData();this._handleCountHeader();this._handleKPIHeader();var s=this.getCardPropertiesModel().getProperty("/selectedKey");if(s&&this.getCardPropertiesModel().getProperty("/state")!=='Loading'){var d=this.getView().byId("ovp_card_dropdown");if(d){d.setSelectedKey(s);}}try{var C=this.getOwnerComponent().getComponentData();if(C&&C.appComponent){var a=C.appComponent;if(a.getModel('ui')){var u=a.getModel('ui');if(u.getProperty('/containerLayout')==='resizable'){var D=a.getDashboardLayoutUtil();if(D){var o=D.dashboardLayoutModel.getCardById(C.cardId);if(o&&o.template==='sap.ovp.cards.stack'){o.dashboardLayout.autoSpan=false;}if(D.isCardAutoSpan(C.cardId)){this.resizeHandlerId=sap.ui.core.ResizeHandler.register(this.getView(),function(E){jQuery.sap.log.info('DashboardLayout autoSize:'+E.target.id+' -> '+E.size.height);setTimeout(function(){D.setAutoCardSpanHeight(E);},0);});this.oDashboardLayoutUtil=D;this.cardId=C.cardId;}}}}}}catch(e){jQuery.sap.log.error("DashboardLayout autoSpan check failed.");}if(this.oDashboardLayoutUtil&&this.oDashboardLayoutUtil.isCardAutoSpan(this.cardId)){var $=jQuery("#"+this.oDashboardLayoutUtil.getCardDomId(this.cardId));if(this.oView.$().outerHeight()>$.innerHeight()){this.oDashboardLayoutUtil.setAutoCardSpanHeight(null,this.cardId,this.oView.$().height());}}var i=0;if(C&&C.mainComponent){var m=C.mainComponent;if(m.bGlobalFilterLoaded){i=this.checkNavigation();}}var b=this.getCardPropertiesModel();var S=b.getProperty("/state");if(S!=="Loading"&&S!=="Error"){var f=b.getProperty("/template");if(f==="sap.ovp.cards.stack"){if(!i){var v=this.getView().byId('ViewAll');if(v){v=v.getDomRef();jQuery(v).remove();}}}}if(i){if(c?c!=="sap.ovp.cards.quickview.Quickview":true){if(c==="sap.ovp.cards.stack.Stack"){var g=this.getView().getDomRef();var h=jQuery(g).find('.sapOvpCardContentRightHeader');if(h.length!==0){h.addClass('sapOvpCardNavigable');}}else{this.getView().addStyleClass("sapOvpCardNavigable");}}if(c&&c==="sap.ovp.cards.quickview.Quickview"){var H=this.byId("ovpCardHeader");if(H){H.addStyleClass("sapOvpCardNavigable");}}}else{if(c){this.getView().addStyleClass("ovpNonNavigableItem");var H=this.byId("ovpCardHeader");if(H){H.$().removeAttr('role');H.addStyleClass('ovpNonNavigableItem');}var I=this.checkLineItemNavigation();if(!I){switch(c){case"sap.ovp.cards.list.List":var l=this.getView().byId("listItem");if(l){l.setType("Inactive");}break;case"sap.ovp.cards.table.Table":var l=this.getView().byId("tableItem");if(l){l.setType("Inactive");}break;case"sap.ovp.cards.linklist.LinkList":var l=this.getView().byId("ovpCLI");if(l){l.setType("Inactive");}break;}}}}var j=this.getView().byId("ovp_card_dropdown");var t=this.getView().byId("toolbar");if(t){var k=t.getDomRef();jQuery(k).attr("aria-label",j.getSelectedItem().getText());}},checkNavigation:function(){if(this.getEntityType()){var e=this.getEntityType();if(this.getCardPropertiesModel()){var c=this.getCardPropertiesModel();var i=c.getProperty("/identificationAnnotationPath");var a=i;var C=this.getCardPropertiesModel().getProperty("/contentFragment");if(C&&(C==="sap.ovp.cards.stack.Stack"||C==="sap.ovp.cards.quickview.Quickview")){var b=(i)?i.split(","):[];if(b&&b.length>1){if(C==="sap.ovp.cards.stack.Stack"){a=b[0];}else{a=b[1];}}}var r=e[a];if(this.isNavigationInAnnotation(r)){return 1;}}}else if(this.getCardPropertiesModel()&&this.getCardPropertiesModel().getProperty("/template")==="sap.ovp.cards.linklist"&&this.getCardPropertiesModel().getProperty("/staticContent")&&this.getCardPropertiesModel().getProperty("/targetUri")){return 1;}return 0;},checkLineItemNavigation:function(){if(this.getEntityType()){var e=this.getEntityType();if(this.getCardPropertiesModel()){var c=this.getCardPropertiesModel();var a=c.getProperty("/annotationPath");var r=e[a];return this.isNavigationInAnnotation(r);}}},isNavigationInAnnotation:function(r){if(r&&r.length){for(var i=0;i<r.length;i++){var I=r[i];if(I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"||I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForAction"||I.RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"){return 1;}}}return 0;},onHeaderClick:function(){if(sap.ovp.cards.CommonUtils.checkIfAPIIsUsed(this)){sap.ovp.cards.CommonUtils.onHeaderClicked();}else{var c=this.getCardPropertiesModel();var t=c.getProperty("/template");var T=c.getProperty("/targetUri");if(t=="sap.ovp.cards.linklist"&&c.getProperty("/staticContent")!==undefined&&T){window.location.href=T;}else if(c.getProperty("/staticContent")!==undefined&&T===""){return;}else{this.doNavigation(this.getView().getBindingContext());}}},resizeCard:function(c){jQuery.sap.log.info(c);if(this.resizeHandlerId){sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);this.resizeHandlerId=null;}},_handleCountHeader:function(){var c=this.getView().byId("ovpCountHeader");if(c){var i=this.getCardItemsBinding();if(i){this.setHeaderCounter(i,c);i.attachDataReceived(function(){this.setHeaderCounter(i,c);}.bind(this));i.attachChange(function(){this.setHeaderCounter(i,c);}.bind(this));}}},setHeaderCounter:function(i,c){var t=i.getLength();var C=i.getCurrentContexts().length;var o,a="";var n=sap.ui.core.format.NumberFormat.getIntegerInstance({minFractionDigits:0,maxFractionDigits:1,decimalSeparator:".",style:"short"});C=parseFloat(C,10);var b=this.getOwnerComponent().getComponentData();if(b&&b.appComponent){var d=b.appComponent;if(d.getModel('ui')){var u=d.getModel('ui');if(u.getProperty('/containerLayout')!=='resizable'){if(t!==0){t=n.format(Number(t));}if(C!==0){C=n.format(Number(C));}}else{o=this.getDashboardLayoutUtil().dashboardLayoutModel.getCardById(b.cardId);}}}if(0===C){a="";}else if(o&&o.dashboardLayout.showOnlyHeader){a=sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Header_Total",[t]);}else if(t!=C){a=sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Header",[C,t]);}c.setText(a);var e=c.$();e.attr("aria-label",a);},_handleKPIHeader:function(){var k,s;if(this.getView()&&this.getView().getDomRef()){k=this.getView().getDomRef().getElementsByClassName("numericContentHbox");s=this.getView().getDomRef().getElementsByClassName("noDataSubtitle");}else{return;}if(k||s){var i=this.getCardItemsBinding();if(i){i.attachDataReceived(function(){this._setSubTitleWithUnitOfMeasure(i);var t=i.getLength();if(k[0]){k[0].style.visibility=null;if(t===0){k[0].style.visibility='hidden';}}if(s.length!==0){s[0].style.display="none";if(t===0){s[0].style.display="flex";}}}.bind(this));}}},_setSubTitleWithUnitOfMeasure:function(i){var c=this.getCardPropertiesModel();if(!!c){var d=c.getData();var s=this.getView().byId("SubTitle-Text");if(!!s){s.setText(d.subTitle);if(!!d&&!!d.entityType&&!!d.dataPointAnnotationPath){var e=c.getData().entityType;var D=e[d.dataPointAnnotationPath];var m;if(D&&D.Value&&D.Value.Path){m=D.Value.Path;}else if(D&&D.Description&&D.Description.Value&&D.Description.Value.Path){m=D.Description.Value.Path;}if(!!m){var p=sap.ovp.cards.CommonUtils.getUnitColumn(m,e);var k=this.byId("kpiHeader");if(!!k){var a=k.getAggregation("items")[0];if(!!a){var b=a.getItems()[0];if(!!b){var C=b.getBindingContext().getPath();if(!!p&&!!C){var M=this.getModel();var o=M.getContext(C);if(!!o){var u=o.getProperty(p);var f=sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("SubTitle_IN");if(!!d.subTitle&&!!f&&!!u){s.setText(d.subTitle+" "+f+" "+u);var g=s.getAggregation("customData");if(!!g&&!!g[0]){g[0].setValue(d.subTitle+" "+f+" "+u);}}}}}}}}}}}},getCardItemsBinding:function(){},onActionPress:function(e){var s=e.getSource(),c=this._getActionObject(s),a=s.getBindingContext();if(c.type.indexOf("DataFieldForAction")!==-1){this.doAction(a,c);}else{this.doNavigation(a,c);}},_getActionObject:function(s){var c=s.getCustomData();var C={};for(var i=0;i<c.length;i++){C[c[i].getKey()]=c[i].getValue();}return C;},doNavigation:function(c,n){if(!this.enableClick){return;}this.enableClick=false;setTimeout(function(){this.enableClick=true;}.bind(this),1000);if(!n){n=this.getEntityNavigationEntries(c)[0];}if(n){switch(n.type){case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":this.doNavigationWithUrl(c,n);break;case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":this.doIntentBasedNavigation(c,n,false);break;}}},doNavigationWithUrl:function(c,n){var p=sap.ushell.Container.getService("URLParsing");if(!(p.isIntentUrl(n.url))){window.open(n.url);}else{var P=p.parseShellHash(n.url);this.doIntentBasedNavigation(c,P,true);}},fnHandleError:function(e){if(e instanceof sap.ui.generic.app.navigation.service.NavError){if(e.getErrorCode()==="NavigationHandler.isIntentSupported.notSupported"){sap.m.MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_NAV_ERROR_NOT_AUTHORIZED_DESC"),{title:sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE")});}else{sap.m.MessageBox.show(e.getErrorCode(),{title:sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE")});}}},doCrossApplicationNavigation:function(I,n){var s="#"+I.semanticObject+'-'+I.action;var t=this;sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported([s]).done(function(r){if(r[s].supported===true){if(!!n.params){if(typeof n.params=='string'){try{n.params=JSON.parse(n.params);}catch(e){jQuery.sap.log.error("Could not parse the Navigation parameters");return;}}}var c=t.getOwnerComponent().getComponentData();var g=c?c.globalFilter:undefined;var u=g&&g.getUiState({allFilters:false});var S=u?JSON.stringify(u.getSelectionVariant()):"{}";g=jQuery.parseJSON(S);if(!n.params){n.params={};}if(!!g&&!!g.SelectOptions){for(var i=0;i<g.SelectOptions.length;i++){var G=g.SelectOptions[i].Ranges;if(!!G){var v=[];for(var j=0;j<G.length;j++){if(G[j].Sign==="I"&&G[j].Option==="EQ"){v.push(G[j].Low);}}n.params[g.SelectOptions[i].PropertyName]=v;}}}sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(n);}else{var E=new sap.ui.generic.app.navigation.service.NavError("NavigationHandler.isIntentSupported.notSupported");t.fnHandleError(E);}}).fail(function(){jQuery.sap.log.error("Could not get authorization from isIntentSupported");});},doIntentBasedNavigation:function(c,i,u){var p,n,e=c?c.getObject():null;if(e&&e.__metadata){delete e.__metadata;}var N=sap.ovp.cards.CommonUtils.getNavigationHandler();if(N){if(i){p=this._getEntityNavigationParameters(e);n={target:{semanticObject:i.semanticObject,action:i.action},appSpecificRoute:i.appSpecificRoute,params:p.newSelectionVariant};var C={},m=null;if(this.getOwnerComponent()&&this.getOwnerComponent().getComponentData()){m=this.getOwnerComponent().getComponentData().mainComponent;if(!!m){m.getCustomAppStateDataExtension(C);}}var a={selectionVariant:p.oldSelectionVariant,presentationVariant:p.newPresentationVariant,customData:C};if(u){if(i&&i.semanticObject&&i.action){var P=this.getCardPropertiesModel().getProperty("/staticParameters");n.params=(!!P)?P:{};this.doCrossApplicationNavigation(i,n);}}else{N.navigate(n.target.semanticObject,n.target.action,n.params,a,this.fnHandleError);}}}},doAction:function(c,a){this.actionData=A.getActionInfo(c,a,this.getEntityType());if(this.actionData.allParameters.length>0){this._loadParametersForm();}else{this._callFunction();}},getEntityNavigationEntries:function(c,a){var n=[];var e=this.getEntityType();if(!e){return n;}if(!a){var C=this.getCardPropertiesModel();var I=C.getProperty("/identificationAnnotationPath");var b=(I)?I.split(","):[];if(b&&b.length>1){a=b[0];}else{a=I;}}var r=e[a];if(Array.isArray(r)){r=sap.ovp.cards.AnnotationHelper.sortCollectionByImportance(r);for(var i=0;i<r.length;i++){if(r[i].RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){n.push({type:r[i].RecordType,semanticObject:r[i].SemanticObject.String,action:r[i].Action.String,label:r[i].Label?r[i].Label.String:null});}if(r[i].RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"&&!r[i].Url.UrlRef){var m=this.getView().getModel();var M=m.oMetaModel;var E=M.createBindingContext(e.$path);var B=sap.ui.model.odata.AnnotationHelper.format(E,r[i].Url);var o=new sap.ui.core.CustomData({key:"url",value:B});o.setModel(m);o.setBindingContext(c);var u=o.getValue();n.push({type:r[i].RecordType,url:u,value:r[i].Value.String,label:r[i].Label?r[i].Label.String:null});}}}return n;},getModel:function(){return this.getView().getModel();},getMetaModel:function(){if(this.getModel()){return this.getModel().getMetaModel();}},getCardPropertiesModel:function(){return this.getView().getModel("ovpCardProperties");},getEntitySet:function(){if(!this.entitySet){var e=this.getCardPropertiesModel().getProperty("/entitySet");this.entitySet=this.getMetaModel().getODataEntitySet(e);}return this.entitySet;},getEntityType:function(){if(!this.entityType){if(this.getMetaModel()&&this.getEntitySet()){this.entityType=this.getMetaModel().getODataEntityType(this.getEntitySet().entityType);}}return this.entityType;},getCardContentContainer:function(){if(!this.cardContentContainer){this.cardContentContainer=this.getView().byId("ovpCardContentContainer");}return this.cardContentContainer;},_getEntityNavigationParameters:function(e){var u={};var E;var c=this.getOwnerComponent().getComponentData();var g=c?c.globalFilter:undefined;var C=sap.ovp.cards.AnnotationHelper.getCardSelections(this.getCardPropertiesModel());var a=C.filters;var b=C.parameters;a&&a.forEach(function(y){y.path=y.path.replace("/",".");if(y.operator===sap.ui.model.FilterOperator.NE){y.operator=sap.ui.model.FilterOperator.EQ;y.sign="E";}});C.filters=a;b&&b.forEach(function(y){y.path=y.path.replace("/",".");});C.parameters=b;var o=sap.ovp.cards.AnnotationHelper.getCardSorters(this.getCardPropertiesModel());var s,G,p;if(e){E=this.getEntityType();var k;for(var i=0;E.property&&i<E.property.length;i++){k=E.property[i].name;var v=e[k];if(e.hasOwnProperty(k)){if(window.Array.isArray(e[k])&&e[k].length===1){u[k]=e[k][0];}else if(jQuery.type(v)!=="object"){u[k]=v;}}}}var U=g&&g.getUiState({allFilters:false});var S=U?JSON.stringify(U.getSelectionVariant()):"{}";G=new sap.ui.generic.app.navigation.service.SelectionVariant(S);p=new sap.ui.generic.app.navigation.service.PresentationVariant(o);s=this._buildSelectionVariant(g,C);var m=null,d;if(this.getOwnerComponent()&&this.getOwnerComponent().getComponentData()){m=this.getOwnerComponent().getComponentData().mainComponent;}if(!!m){var f=this.getCardPropertiesModel();if(!!f){var h=f.getProperty("/customParams");if(!!h){var P=e;var l=m.onCustomParams(h);if(typeof l==="function"){d=l(P);var I=(d&&typeof d==="object"&&!Array.isArray(d)),n=(I&&d.ignoreEmptyString);var q=I?d.selectionVariant:d;for(var j=0;q&&j<q.length;j++){var r=q[j];if(r&&r.path&&(r.operator||n)&&(r.value1||r.value1===0||(r.value1===""&&n))&&(r.sign||n)){var V=r.value1.toString();var t=(r.value2)?r.value2.toString():undefined;if(r.value1===""&&n){s.removeSelectOption(r.path);}s.addSelectOption(r.path,r.sign,r.operator,V,t);if(u[r.path]){u[r.path]=null;}}}if(n){s=this._removeEmptyStringsFromSelectionVariant(s);}}}var w=f.getProperty("/staticParameters");if(!!w){for(var k in w){u[k]=w[k];}}}}var N=sap.ovp.cards.CommonUtils.getNavigationHandler();var x=null;if(N){if(d&&typeof d==="object"&&!Array.isArray(d)&&d.ignoreEmptyString){x=N.mixAttributesAndSelectionVariant(u,s.toJSONString(),sap.ui.generic.app.navigation.service.SuppressionBehavior.ignoreEmptyString);}else{x=N.mixAttributesAndSelectionVariant(u,s.toJSONString());}}return{oldSelectionVariant:G?G.toJSONString():null,newSelectionVariant:x?x.toJSONString():null,newPresentationVariant:p?p.toJSONString():null};},_removeEmptyStringsFromSelectionVariant:function(s){var p=s.getParameterNames();for(var i=0;i<p.length;i++){if(s.getParameter(p[i])===""){s.removeParameter(p[i]);}}var S=s.getSelectOptionsPropertyNames();for(i=0;i<S.length;i++){var a=s.getSelectOption(S[i]);for(var j=0;j<a.length;j++){if(a[j].Low===""&&!a[j].High){a.splice(j,1);j--;}}if(a.length===0){s.removeSelectOption(S[i]);}}return s;},_buildSelectionVariant:function(g,c){var u=g&&g.getUiState({allFilters:false});var s=u?JSON.stringify(u.getSelectionVariant()):"{}";var S=new sap.ui.generic.app.navigation.service.SelectionVariant(s);var f,v,V,p;var C=c.filters;var a=c.parameters;for(var i=0;i<C.length;i++){f=C[i];if(f.path&&f.operator&&typeof f.value1!=="undefined"){v=f.value1.toString();V=(typeof f.value2!=="undefined")?f.value2.toString():undefined;S.addSelectOption(f.path,f.sign,f.operator,v,V);}}var n,N,b;for(var j=0;j<a.length;j++){p=a[j];if(!p.path||!p.value){continue;}n=p.path.split("/").pop();n=n.split(".").pop();if(n.indexOf("P_")===0){N=n;b=n.substr(2);}else{N="P_"+n;b=n;}if(S.getParameter(N)){continue;}if(S.getParameter(b)){continue;}S.addParameter(n,p.value);}return S;},_loadParametersForm:function(){var p=new sap.ui.model.json.JSONModel();p.setData(this.actionData.parameterData);var t=this;var P=new sap.m.Dialog('ovpCardActionDialog',{title:this.actionData.sFunctionLabel,afterClose:function(){P.destroy();}}).addStyleClass("sapUiNoContentPadding");var a=new sap.m.Button({text:this.actionData.sFunctionLabel,press:function(e){var m=A.getParameters(e.getSource().getModel(),t.actionData.oFunctionImport);P.close();t._callFunction(m,t.actionData.sFunctionLabel);}});var c=new sap.m.Button({text:"Cancel",press:function(){P.close();}});P.setBeginButton(a);P.setEndButton(c);var o=function(e){var m=A.mandatoryParamsMissing(e.getSource().getModel(),t.actionData.oFunctionImport);a.setEnabled(!m);};var f=A.buildParametersForm(this.actionData,o);P.addContent(f);P.setModel(p);P.open();},_callFunction:function(u,a){var p={batchGroupId:"Changes",changeSetId:"Changes",urlParameters:u,forceSubmit:true,context:this.actionData.oContext,functionImport:this.actionData.oFunctionImport};var t=this;var P=new Promise(function(r,b){var m=t.actionData.oContext.getModel();var f;f="/"+p.functionImport.name;m.callFunction(f,{method:p.functionImport.httpMethod,urlParameters:p.urlParameters,batchGroupId:p.batchGroupId,changeSetId:p.changeSetId,headers:p.headers,success:function(d,R){r(R);},error:function(R){R.actionText=a;b(R);}});});P.then(function(r){return sap.m.MessageToast.show(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Toast_Action_Success"),{duration:1000});},function(e){var b=sap.ovp.cards.CommonUtils.showODataErrorMessages(e);if(b===""&&e.actionText){b=sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Toast_Action_Error")+' "'+e.actionText+'"'+".";}return sap.m.MessageBox.error(b,{title:sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE"),onClose:null,styleClass:"",initialFocus:null,textDirection:sap.ui.core.TextDirection.Inherit});});},setErrorState:function(){var c=this.getOwnerComponent();if(!c||!c.oContainer){return;}var C=c.oContainer;var o=this.getCardPropertiesModel();var a={name:"sap.ovp.cards.loading",componentData:{model:this.getView().getModel(),settings:{category:o.getProperty("/category"),title:o.getProperty("/title"),description:o.getProperty("/description"),entitySet:o.getProperty("/entitySet"),state:sap.ovp.cards.loading.State.ERROR,template:o.getProperty("/template")}}};var l=sap.ui.component(a);C.setComponent(l);setTimeout(function(){c.destroy();},0);},changeSelection:function(s,a,c){if(!a){var d=this.getView().byId("ovp_card_dropdown");s=parseInt(d.getSelectedKey(),10);}var t={};if(!a){t=this.getCardPropertiesModel().getProperty("/tabs")[s-1];}else{t=c.tabs[s-1];}var u={cardId:this.getOwnerComponent().getComponentData().cardId,selectedKey:s};for(var p in t){u[p]=t[p];}if(sap.ovp.cards.CommonUtils.checkIfAPIIsUsed(this)){sap.ovp.cards.CommonUtils.recreateCard(u,this.getOwnerComponent().getComponentData());}else{this.getOwnerComponent().getComponentData().mainComponent.recreateCard(u);}},getItemHeight:function(g,c,f){if(!!g){var a=g.getView().byId(c);var h=0;if(!!a){if(f){if(a.getItems()[0]&&a.getItems()[0].getDomRef()){h=jQuery(a.getItems()[0].getDomRef()).outerHeight(true);}}else{if(a.getDomRef()){h=jQuery(a.getDomRef()).outerHeight(true);}}}return h;}},getDashboardLayoutUtil:function(){var d=null;var c=this.getOwnerComponent().getComponentData();if(c.appComponent){d=c.appComponent.getDashboardLayoutUtil();}return d;},getHeaderHeight:function(){var h=this.getItemHeight(this,'ovpCardHeader');var c=this.getOwnerComponent()?this.getOwnerComponent().getComponentData():null;if(c){var C=this.getDashboardLayoutUtil().dashboardLayoutModel.getCardById(c.cardId);return 0===h?C.dashboardLayout.headerHeight:h;}else{return h;}}});})();
