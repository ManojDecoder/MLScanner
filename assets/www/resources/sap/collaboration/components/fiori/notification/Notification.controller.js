/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2017 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.collaboration.components.utils.NotificationTypeUtil");jQuery.sap.require("sap.collaboration.components.utils.OdataUtil");jQuery.sap.require("sap.collaboration.components.utils.CommonUtil");sap.ui.controller("sap.collaboration.components.fiori.notification.Notification",{onInit:function(){this.initializeRefreshAndTransitionState();this.sPrefixId=this.getView().getViewData().controlId;this.oView=this.getView();this.oLangBundle=this.oView.oLangBundle;this.sOdataServiceUrl=this.getView().getViewData().oDataServiceUrl;this.iTransitionInterval=this.getView().getViewData().transitionInterval;this.iRefreshInterval=this.getView().getViewData().refreshInterval;this.sProfilePhotoHiddenStyleClass=this.oView.sStyleClassPrefix+"ProfileImageHidden";this.sLoadingAnimationDummyTextStyleClass=this.oView.sStyleClassPrefix+"LoadingText";this.sNewNotificationTextStyleClass=this.oView.sStyleClassPrefix+"NewNotificationText";this.sErrorTextStyleClass=this.oView.sStyleClassPrefix+"ErrorText";this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sLoadingAnimationDummyTextStyleClass);this.oView.oNotificationNewNotificationOrErrorText.setText(". . . . . . . . . . . .");this.oView.oNotificationNewNotificationOrErrorText.setBusy(true);this.oNotificationTypeUtil=new sap.collaboration.components.utils.NotificationTypeUtil();},initializeRefreshAndTransitionState:function(){this.bErrorInUnreadCountODataResponse=true;this.bErrorInNoticesODataResponse=true;this.bErrorInODataResponse=true;this.iNotificationCurrentIndex=undefined;this.iNotificationPreviousIndex=undefined;this.aNotifications=undefined;this.bIsTransitionActive=false;this.iNotificationsTransitionCallbackRegistrationId=undefined;this.bIsRefreshActive=false;this.iNotificationsRefreshCallbackRegistrationId=undefined;this.iNotificationUnreadCount=undefined;this.iMaxNotificationsToDisplay=this.getView().getViewData().numberOfNotifications;this.aImageControls=this.getView().getViewData().aProfilePhotos;this.iNotificationsToDisplay=undefined;this.aUsedImageControls=[];},onBeforeRendering:function(){this.initializeCommonUtil();this.initializeOdataModel();this.initializeOdataUtils();},onAfterRendering:function(){this.fetchNotificationData();},initializeOdataModel:function(){var a=true;this.oOdataModel=new sap.ui.model.odata.ODataModel(this.sOdataServiceUrl,a);},initializeOdataUtils:function(){this.oODataUtil=new sap.collaboration.components.utils.OdataUtil();},initializeCommonUtil:function(){this.oCommonUtil=new sap.collaboration.components.utils.CommonUtil();},fetchNotificationData:function(){var r=[];var n=this.oODataUtil.createNotificationUnreadCountBatchOperation(this.oOdataModel);var N=this.oODataUtil.createNotificationBatchOperation(this.oOdataModel,this.iMaxNotificationsToDisplay);r.push(n);r.push(N);var p=this.getFunctionParseResult();var e=this.getFunctionErrorCallBack();this.oODataUtil.executeODataBatchRequest(this.oOdataModel,r,p,true,e);},getFunctionParseResult:function(){var s=this;return function(r){s.oView.oNotificationNewNotificationOrErrorText.setBusy(false);s.oView.oNotificationNewNotificationOrErrorText.setText("");s.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(s.sLoadingAnimationDummyTextStyleClass);s.initializeRefreshAndTransitionState();if(r[0].error&&!r[1].error){s.bErrorInNoticesODataResponse=false;s.aNotifications=r[1].results;s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setUiContent();s.activateNotificationRefresh();}else if(!r[0].error&&r[1].error){s.bErrorInUnreadCountODataResponse=false;s.iNotificationUnreadCount=r[0].GetNoticeUnreadCount.UnreadCount;s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setUiContent();s.activateNotificationRefresh();}else if(r[0].error&&r[1].error){s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setUiContent();s.activateNotificationRefresh();}else{s.bErrorInUnreadCountODataResponse=false;s.bErrorInNoticesODataResponse=false;s.bErrorInODataResponse=false;s.aNotifications=r[1].results;s.iNotificationUnreadCount=r[0].GetNoticeUnreadCount.UnreadCount;if(s.iMaxNotificationsToDisplay>0){if(s.aNotifications.length>0){if(s.iNotificationUnreadCount>0){s.iNotificationsToDisplay=Math.min(s.iMaxNotificationsToDisplay,s.aNotifications.length,s.iNotificationUnreadCount);s.iNotificationCurrentIndex=0;s.iNotificationPreviousIndex=s.iNotificationsToDisplay-1;s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setProfilePhotosSrc();s.setUiContent();s.activateNotificationTransition();s.activateNotificationRefresh();}else{s.iNotificationsToDisplay=1;s.iNotificationCurrentIndex=0;s.iNotificationPreviousIndex=s.iNotificationsToDisplay-1;s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setProfilePhotosSrc();s.setUiContent();s.activateNotificationRefresh();}}else{s.iNotificationsToDisplay=0;s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.activateNotificationRefresh();}}else{s.iNotificationsToDisplay=0;s.clearAllUiTexts();s.hideAllProfilePhotoControls();}}};},getFunctionErrorCallBack:function(){var s=this;return function(e){s.initializeRefreshAndTransitionState();s.clearAllUiTexts();s.hideAllProfilePhotoControls();s.setUiContent();s.activateNotificationRefresh();};},setProfilePhotosSrc:function(){var s;var S;var p;for(var i=0;i<this.iNotificationsToDisplay;++i){s=this.aNotifications[i].SenderId;S=this.aNotifications[i].SenderFullName;p=this.getProfilePhotoURL(S,s);this.oView.aProfilePhotos[i].addStyleClass(this.sProfilePhotoHiddenStyleClass);this.oView.aProfilePhotos[i].setSrc(p);}},getProfilePhotoURL:function(s,S){if(s!==""){return this.sOdataServiceUrl+"/Members("+S+")/ProfilePhoto/$value";}else{return sap.ui.resource('sap.collaboration.components',"images/Anonymous.png");}},hideAllProfilePhotoControls:function(){for(var i=0;i<this.oView.aProfilePhotos.length;++i){this.oView.aProfilePhotos[i].addStyleClass(this.sProfilePhotoHiddenStyleClass);}},clearAllUiTexts:function(){this.oView.oNotificationTypeText.setText("");this.oView.oNotificationMessageText.setText("");this.oView.oNotificationUnreadCountText.setText("");this.oView.oNotificationNewNotificationOrErrorText.setText("");this.oView.oNotificationAgeText.setText("");this.oView.oNotificationGroupText.setText("");},setUiContent:function(){if(this.bErrorInODataResponse){this.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(this.sNewNotificationTextStyleClass);this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sErrorTextStyleClass);this.oView.oNotificationNewNotificationOrErrorText.setText(this.oLangBundle.getText("NOTIF_ERROR_MESSAGE"));}else{var n=this.aNotifications[this.iNotificationCurrentIndex];var N="NOTIF_"+n.EventType.toUpperCase();var s=n.Message;var a;if(this.iNotificationUnreadCount>999){a=this.oLangBundle.getText("NOTIF_MORE_THAN_999_NEW_NOTIFICATIONS");}else{a=this.iNotificationUnreadCount;}var c=n.CreatedAt;var g=n.GroupName;var b=this.oNotificationTypeUtil.getRequiredNotificationPropertyNames(n.EventType);var d=this.getNotificationPropertyValues(b,n);this.oView.oNotificationTypeText.setText(this.oLangBundle.getText(N,d));this.oView.oNotificationMessageText.setText(s);this.oView.aProfilePhotos[this.iNotificationPreviousIndex].addStyleClass(this.sProfilePhotoHiddenStyleClass);this.oView.aProfilePhotos[this.iNotificationCurrentIndex].removeStyleClass(this.sProfilePhotoHiddenStyleClass);this.oView.oNotificationUnreadCountText.setText(a);this.oView.oNotificationNewNotificationOrErrorText.removeStyleClass(this.sErrorTextStyleClass);this.oView.oNotificationNewNotificationOrErrorText.addStyleClass(this.sNewNotificationTextStyleClass);this.oView.oNotificationNewNotificationOrErrorText.setText(this.oLangBundle.getText("NOTIF_NEW_NOTIFICATIONS"));var e=this.calculateNotificationAge(c,g).split("\n");var f=e[0];var h="";if(e.length>1){h=e[1];}this.oView.oNotificationAgeText.setText(f);this.oView.oNotificationGroupText.setText(h);this.iNotificationPreviousIndex=this.iNotificationCurrentIndex;this.iNotificationCurrentIndex=(this.iNotificationCurrentIndex+1)%this.iNotificationsToDisplay;}},getNotificationPropertyValues:function(n,N){var a=[];for(var i=0;i<n.length;i++){a.push(N[n[i]]);}return a;},calculateNotificationAge:function(c,g){if(!this.oCommonUtil.isValidDate(c)){return"";}var n=new Date();c.setMilliseconds(0);n.setMilliseconds(0);var a=60000;var b=a*60;var d=b*24;var e=n.getTime()-c.getTime();if(e>=d){var f=Math.round(parseFloat(e/d,10));if(f===1){if(g!==""){return this.oLangBundle.getText("NOTIF_DAY_AGO_GRP",[f.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_DAY_AGO_NO_GRP",[f.toString()]);}}else{if(g!==""){return this.oLangBundle.getText("NOTIF_DAYS_AGO_GRP",[f.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_DAYS_AGO_NO_GRP",[f.toString()]);}}}else if(e>=b){var h=Math.round(parseFloat(e/b,10));if(h===1){if(g!==""){return this.oLangBundle.getText("NOTIF_HOUR_AGO_GRP",[h.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_HOUR_AGO_NO_GRP",[h.toString()]);}}else{if(g!==""){return this.oLangBundle.getText("NOTIF_HOURS_AGO_GRP",[h.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_HOURS_AGO_NO_GRP",[h.toString()]);}}}else{var i=Math.round(parseFloat(e/a,10));if(i===1){if(g!==""){return this.oLangBundle.getText("NOTIF_MINUTE_AGO_GRP",[i.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_MINUTE_AGO_NO_GRP",[i.toString()]);}}else{if(g!==""){return this.oLangBundle.getText("NOTIF_MINUTES_AGO_GRP",[i.toString(),g]);}else{return this.oLangBundle.getText("NOTIF_MINUTES_AGO_NO_GRP",[i.toString()]);}}}},activateNotificationTransition:function(){if(!this.bIsTransitionActive){this.iNotificationsTransitionCallbackRegistrationId=this.getTransitionRegistrationId();this.bIsTransitionActive=true;}},getTransitionRegistrationId:function(){return setInterval(this.setUiContent.bind(this),this.iTransitionInterval);},deactivateNotificationTransition:function(){if(this.bIsTransitionActive){clearInterval(this.iNotificationsTransitionCallbackRegistrationId);this.bIsTransitionActive=false;}},activateNotificationRefresh:function(){if(!this.bIsRefreshActive){this.iNotificationsRefreshCallbackRegistrationId=this.getRefreshRegistrationId();this.bIsRefreshActive=true;}},getRefreshRegistrationId:function(){return setInterval(this.refreshNotification.bind(this),this.iRefreshInterval);},deactivateNotificationRefresh:function(){if(this.bIsRefreshActive){clearInterval(this.iNotificationsRefreshCallbackRegistrationId);this.bIsRefreshActive=false;}},refreshNotification:function(){this.deactivateNotificationTransition();this.deactivateNotificationRefresh();this.fetchNotificationData();}});
