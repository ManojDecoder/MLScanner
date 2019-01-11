sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    var oView;

    return Controller.extend("GPS.GPS.controller.GPS", {

        oView: null,

        onInit: function() {
            oView = this.getView();
        },

        startCamera: function() {
            var width = 300;
            var height = 300;
            var x = (this.getView().$().width() - width)/2;
            var y = (this.getView().$().height() - height)/2 + 10;

             CameraPreview.startCamera({x: x, y: y, width: width, height: height, toBack: false, previewDrag: true, tapPhoto: true, tapFocus: true, camera: CameraPreview.CAMERA_DIRECTION.BACK});
        },

        stopCamera: function() {
             CameraPreview.stopCamera();
        },

        takePicture: function(){
            CameraPreview.takePicture({quality: 100}, function(imgData){
                //var myImage = oView.byId("myImage");
                //myImage.setSrc("data:image/jpeg;base64," + imgData);

                mltext.getText(onSuccessText, onFailText, {
                    imgType: 4,
                    imgSrc: imgData
                });

                // for imgType Use 0,1,2,3 or 4
                function onSuccessText(recognizedText) {
                    //var element = document.getElementById('pp');
                    //element.innerHTML=recognizedText.blocks.blocktext;
                    //Use above two lines to show recognizedText in html
                    console.log(recognizedText);
                    alert("Text: " + recognizedText.blocktext);
                }

                function onFailText(message) {
                    alert('Failed because: ' + message);
                }


                /*
                mltext.getBarcode(onSuccessBarcode, onFailBarcode, {
                    imgType: 4,
                    imgSrc: imgData
                });

                function onSuccessBarcode(recognizedText) {
                    console.log(recognizedText);
                    alert("Barcode: " + recognizedText.blocktext);
                }

                function onFailBarcode(message) {
                    alert('Failed because: ' + message);
                }
                */

            });
        },


    });
});