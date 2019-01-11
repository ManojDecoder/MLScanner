package com.neutrinos.mltextplugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.app.Activity;
import android.content.Context;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Point;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.net.Uri;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.util.Base64;
import android.util.Log;
import android.util.SparseArray;

import com.google.android.gms.dynamic.IFragmentWrapper;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.vision.Frame;
import com.google.android.gms.vision.text.Text;
import com.google.android.gms.vision.text.TextBlock;
import com.google.android.gms.vision.text.TextRecognizer;
import com.google.firebase.ml.common.FirebaseMLException;
import com.google.firebase.ml.custom.FirebaseModelDataType;
import com.google.firebase.ml.custom.FirebaseModelInputOutputOptions;
import com.google.firebase.ml.custom.FirebaseModelInputs;
import com.google.firebase.ml.custom.FirebaseModelInterpreter;
import com.google.firebase.ml.custom.FirebaseModelManager;
import com.google.firebase.ml.custom.FirebaseModelOptions;
import com.google.firebase.ml.custom.FirebaseModelOutputs;
import com.google.firebase.ml.custom.model.FirebaseCloudModelSource;
import com.google.firebase.ml.custom.model.FirebaseLocalModelSource;
import com.google.firebase.ml.custom.model.FirebaseModelDownloadConditions;
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetectorOptions;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.google.firebase.ml.vision.text.FirebaseVisionText;
import com.google.firebase.ml.vision.text.FirebaseVisionTextRecognizer;
import com.google.firebase.ml.vision.text.RecognizedLanguage;

import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcode;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetector;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.PriorityQueue;


public class Mltext extends CordovaPlugin {

    //private static final int REQUEST_CODE = 99;
    //FirebaseVisionImage image = FirebaseVisionImage.fromBitmap(bitmap);
    private static final int NORMFILEURI = 0; // Make bitmap without compression using uri from picture library (NORMFILEURI & NORMNATIVEURI have same functionality in android)
    private static final int NORMNATIVEURI = 1; // Make compressed bitmap using uri from picture library for faster ocr but might reduce accuracy (NORMFILEURI & NORMNATIVEURI have same functionality in android)
    private static final int FASTFILEURI = 2; // Make uncompressed bitmap using uri from picture library (FASTFILEURI & FASTFILEURI have same functionality in android)
    private static final int FASTNATIVEURI = 3; // Make compressed bitmap using uri from picture library for faster ocr but might reduce accuracy (FASTFILEURI & FASTFILEURI have same functionality in android)
    private static final int BASE64 = 4;  // send base64 image instead of uri
//    private TextRecognizer detector;
//    private static final int BLOCKS = 0; // return blocks with 2 new lines in between
//    private static final int LINES = 1; // return lines with new line in between
//    private static final int WORDS = 2; // return words with comma in between
//    private static final int ALL = 3; // return all with new line in between
//    // protected final static String[] permissions = { Manifest.permission.CAMERA,
    //         Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE };


    /**
     * Name of the model file hosted with Firebase.
     */
    private static final String HOSTED_MODEL_NAME = "cloud_model_1";
    private static final String LOCAL_MODEL_ASSET = "mobilenet_v1_1.0_224_quant.tflite";
    /**
     * Name of the label file stored in Assets.
     */
    private static final String LABEL_PATH = "labels.txt";
    /**
     * Number of results to show in the UI.
     */
    private static final int RESULTS_TO_SHOW = 3;
    /**
     * Dimensions of inputs.
     */
    private static final int DIM_BATCH_SIZE = 1;
    private static final int DIM_PIXEL_SIZE = 3;
    private static final int DIM_IMG_SIZE_X = 224;
    private static final int DIM_IMG_SIZE_Y = 224;
    /**
     * Labels corresponding to the output of the vision model.
     */
    private List<String> mLabelList;

    private final PriorityQueue<Map.Entry<String, Float>> sortedLabels =
            new PriorityQueue<>(
                    RESULTS_TO_SHOW,
                    new Comparator<Map.Entry<String, Float>>() {
                        @Override
                        public int compare(Map.Entry<String, Float> o1, Map.Entry<String, Float>
                                o2) {
                            return (o1.getValue()).compareTo(o2.getValue());
                        }
                    });

    /* Preallocated buffers for storing image data. */
    private final int[] intValues = new int[DIM_IMG_SIZE_X * DIM_IMG_SIZE_Y];
    /**
     * An instance of the driver class to run model inference with Firebase.
     */
    private FirebaseModelInterpreter mInterpreter;
    /**
     * Data configuration of input & output data of model.
     */
    private FirebaseModelInputOutputOptions mDataOptions;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        // your init code here
        initCustomModel();
    }

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        //callbackContext = callbackContext;
        if (action.equals("getText")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                            int argstype = NORMFILEURI;
//                            int argrtype = ALL;
                            String argimagestr = "";
                        try
                        {
                            Log.d("argsbeech", args.toString());

                            //JSONObject argsoption = args.getJSONObject(0);
                            //argstype = argsoption.getInt("imgType");
                            argstype = args.getInt(0);
                            argimagestr = args.getString(1);
//                            argrtype = args.getInt(1);
                            //argimagestr = argsoption.getString("imgSrc");
                        }
                        catch(Exception e)
                        {
                        callbackContext.error("Argument error");
                        PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                        callbackContext.sendPluginResult(r);
                        }
                        Bitmap bitmap= null;
                        Uri uri = null;
                        ByteBuffer imgData = null;

                        if(argstype==NORMFILEURI || argstype==NORMNATIVEURI||argstype==FASTFILEURI || argstype==FASTNATIVEURI)
                        {
                            try
                            {
                                if(!argimagestr.trim().equals(""))
                                {
                                        String imagestr = argimagestr;

                                        // code block that allows this plugin to directly work with document scanner plugin and camera plugin
                                        if(imagestr.substring(0,6).equals("file://"))
                                        {
                                            imagestr = argimagestr.replaceFirst("file://","");
                                        }
                                        //

                                        uri = Uri.parse(imagestr);

                                        if((argstype==NORMFILEURI || argstype==NORMNATIVEURI)&& uri != null) // normal ocr
                                        {
                                            bitmap = MediaStore.Images.Media.getBitmap(cordova.getActivity().getBaseContext().getContentResolver(), uri);
                                        }
                                        else if((argstype==FASTFILEURI || argstype==FASTNATIVEURI) && uri != null) //fast ocr (might be less accurate)
                                        {
                                            bitmap = decodeBitmapUri(cordova.getActivity().getBaseContext(), uri);
                                        }

                                }
                                else
                                {
                                    callbackContext.error("Image Uri or Base64 string is empty");
                                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                    callbackContext.sendPluginResult(r);
                                }
                            }
                            catch (Exception e)
                            {
                                e.printStackTrace();
                                callbackContext.error("Exception");
                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                callbackContext.sendPluginResult(r);
                            }
                        }
                        else if (argstype==BASE64)
                        {
                            if(!argimagestr.trim().equals(""))
                            {
                                byte[] decodedString = Base64.decode(argimagestr, Base64.DEFAULT);
                                bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                            }
                            else
                            {
                                callbackContext.error("Image Uri or Base64 string is empty");
                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                callbackContext.sendPluginResult(r);
                            }
                        }
                        else
                        {
                            callbackContext.error("Non existent argument. Use 0, 1, 2 , 3 or 4");
                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                            callbackContext.sendPluginResult(r);
                        }

                        FirebaseVisionTextRecognizer textRecognizer = FirebaseVision.getInstance()
                                .getOnDeviceTextRecognizer();

                        if (bitmap != null)
                        {

                            imgData = convertBitmapToByteBuffer(bitmap, bitmap.getWidth(), bitmap.getHeight());
                            try {

                                JSONObject resultobj = new JSONObject();
                                JSONArray rawValue  = new JSONArray();

                                FirebaseModelInputs inputs = new FirebaseModelInputs.Builder().add(imgData).build();
                                mInterpreter
                                        .run(inputs, mDataOptions)
                                        .addOnFailureListener(new OnFailureListener() {
                                            @Override
                                            public void onFailure(@NonNull Exception e) {
                                                e.printStackTrace();
                                                callbackContext.error("Error with Custom Recognition Module");
                                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                                callbackContext.sendPluginResult(r);
                                            }
                                        })
                                        .continueWith(

                                                new Continuation<FirebaseModelOutputs, List<String>>() {
                                                    @Override
                                                    public List<String> then(Task<FirebaseModelOutputs> task) {
                                                        byte[][] labelProbArray = task.getResult()
                                                                .<byte[][]>getOutput(0);
                                                        List<String> topLabels = getTopLabels(labelProbArray);


                                                        try {
                                                            JSONObject resultobj = new JSONObject();
                                                            JSONArray rawValue  = new JSONArray();

                                                            rawValue.put(topLabels);

                                                            resultobj.put("blocktext", rawValue);

                                                            callbackContext.success(resultobj);
                                                            PluginResult r = new PluginResult(PluginResult.Status.OK);
                                                            callbackContext.sendPluginResult(r);


                                                        }
                                                        catch (JSONException e)
                                                        {
                                                            callbackContext.error(String.valueOf(e));
                                                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                                            callbackContext.sendPluginResult(r);
                                                        }
                                                        return topLabels;


                                                    }
                                                });
                            } catch (FirebaseMLException e) {
                                e.printStackTrace();
                            }
                            /*
                            FirebaseVisionImage image = FirebaseVisionImage.fromBitmap(bitmap);
                            textRecognizer.processImage(image)
                                    .addOnSuccessListener(result -> {
                                        try
                                        {
                                            JSONObject resultobj = new JSONObject();

                                            JSONObject blockobj = new JSONObject();
                                            JSONObject lineobj = new JSONObject();
                                            JSONObject wordobj = new JSONObject();

                                            JSONArray blocktext = new JSONArray();
                                            JSONArray blockconfidence = new JSONArray();
                                            JSONArray blocklanguages = new JSONArray();
                                            JSONArray blockpoints = new JSONArray();
                                            JSONArray blockframe = new JSONArray();

                                            JSONArray linetext = new JSONArray();
                                            JSONArray lineconfidence = new JSONArray();
                                            JSONArray linelanguages = new JSONArray();
                                            JSONArray linepoints = new JSONArray();
                                            JSONArray lineframe = new JSONArray();

                                            JSONArray wordtext = new JSONArray();
                                            JSONArray wordconfidence = new JSONArray();
                                            JSONArray wordlanguages = new JSONArray();
                                            JSONArray wordpoints = new JSONArray();
                                            JSONArray wordframe = new JSONArray();

                                            if(result.getText().trim().equals(""))
                                            {
                                                callbackContext.error("No text found in image");
                                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                                callbackContext.sendPluginResult(r);
                                            }
                                            else
                                            {

                                                for (FirebaseVisionText.TextBlock block : result.getTextBlocks())
                                                {

                                                    blocktext.put(block.getText());
                                                    blockconfidence.put(block.getConfidence());
                                                    blocklanguages.put(block.getRecognizedLanguages());

                                                    JSONObject blockcorners = new JSONObject();
                                                    if (block.getCornerPoints()==null){
                                                        blockcorners.put("x1", "");
                                                        blockcorners.put("y1", "");

                                                        blockcorners.put("x2", "");
                                                        blockcorners.put("y2", "");

                                                        blockcorners.put("x3", "");
                                                        blockcorners.put("y3", "");

                                                        blockcorners.put("x4", "");
                                                        blockcorners.put("y4", "");
                                                    }
                                                    else {
                                                        blockcorners.put("x1", Objects.requireNonNull(block.getCornerPoints())[0].x);
                                                        blockcorners.put("y1", Objects.requireNonNull(block.getCornerPoints())[0].y);

                                                        blockcorners.put("x2", Objects.requireNonNull(block.getCornerPoints())[1].x);
                                                        blockcorners.put("y2", Objects.requireNonNull(block.getCornerPoints())[1].y);

                                                        blockcorners.put("x3", Objects.requireNonNull(block.getCornerPoints())[2].x);
                                                        blockcorners.put("y3", Objects.requireNonNull(block.getCornerPoints())[2].y);

                                                        blockcorners.put("x4", Objects.requireNonNull(block.getCornerPoints())[3].x);
                                                        blockcorners.put("y4", Objects.requireNonNull(block.getCornerPoints())[3].y);
                                                    }


//                                                for (Point a:Objects.requireNonNull(block.getCornerPoints()))
//                                                {
//                                                    blockcorners.put(a.toString());
//                                                }


                                                    blockpoints.put(blockcorners);

                                                    JSONObject blockframeobj = new JSONObject();
                                                    if (block.getBoundingBox()==null)
                                                    {
                                                        blockframeobj.put("x", "");
                                                        blockframeobj.put("y", "");
                                                        blockframeobj.put("height","");
                                                        blockframeobj.put("width", "");
                                                    }
                                                    else {
                                                        blockframeobj.put("x", block.getBoundingBox().left);
                                                        blockframeobj.put("y", block.getBoundingBox().bottom);
                                                        blockframeobj.put("height", block.getBoundingBox().height());
                                                        blockframeobj.put("width", block.getBoundingBox().width());
                                                    }

                                                    blockframe.put(blockframeobj);

                                                    for (FirebaseVisionText.Line line : block.getLines())
                                                    {

                                                        linetext.put(line.getText());
                                                        lineconfidence.put(line.getConfidence());
                                                        linelanguages.put(line.getRecognizedLanguages());

                                                        JSONObject linecorners = new JSONObject();

                                                        if (line.getCornerPoints()==null){
                                                            linecorners.put("x1", "");
                                                            linecorners.put("y1", "");

                                                            linecorners.put("x2", "");
                                                            linecorners.put("y2", "");

                                                            linecorners.put("x3", "");
                                                            linecorners.put("y3", "");

                                                            linecorners.put("x4", "");
                                                            linecorners.put("y4", "");
                                                        }
                                                        else {
                                                            linecorners.put("x1", line.getCornerPoints()[0].x);
                                                            linecorners.put("y1", line.getCornerPoints()[0].y);

                                                            linecorners.put("x2", line.getCornerPoints()[1].x);
                                                            linecorners.put("y2", line.getCornerPoints()[1].y);

                                                            linecorners.put("x3", line.getCornerPoints()[2].x);
                                                            linecorners.put("y3", line.getCornerPoints()[2].y);

                                                            linecorners.put("x4", line.getCornerPoints()[3].x);
                                                            linecorners.put("y4", line.getCornerPoints()[3].y);
                                                        }

                                                        linepoints.put(linecorners);

                                                        JSONObject lineframeobj = new JSONObject();

                                                        if (line.getBoundingBox()==null)
                                                        {
                                                            lineframeobj.put("x", "");
                                                            lineframeobj.put("y", "");
                                                            lineframeobj.put("height","");
                                                            lineframeobj.put("width", "");
                                                        }
                                                        else
                                                        {
                                                            lineframeobj.put("x", line.getBoundingBox().left);
                                                            lineframeobj.put("y", line.getBoundingBox().bottom);
                                                            lineframeobj.put("height", line.getBoundingBox().height());
                                                            lineframeobj.put("width", line.getBoundingBox().width());
                                                        }


                                                        lineframe.put(lineframeobj);

                                                        for (FirebaseVisionText.Element element : line.getElements())
                                                        {

                                                            wordtext.put(element.getText());
                                                            wordconfidence.put(element.getConfidence());
                                                            wordlanguages.put(element.getRecognizedLanguages());

                                                            JSONObject wordcorners = new JSONObject();


                                                            if (element.getCornerPoints()==null)
                                                            {
                                                                wordcorners.put("x1", "");
                                                                wordcorners.put("y1", "");

                                                                wordcorners.put("x2", "");
                                                                wordcorners.put("y2", "");

                                                                wordcorners.put("x3", "");
                                                                wordcorners.put("y3", "");

                                                                wordcorners.put("x4", "");
                                                                wordcorners.put("y4", "");
                                                            }
                                                            else
                                                            {
                                                                wordcorners.put("x1", element.getCornerPoints()[0].x);
                                                                wordcorners.put("y1", element.getCornerPoints()[0].y);

                                                                wordcorners.put("x2", element.getCornerPoints()[1].x);
                                                                wordcorners.put("y2", element.getCornerPoints()[1].y);

                                                                wordcorners.put("x3", element.getCornerPoints()[2].x);
                                                                wordcorners.put("y3", element.getCornerPoints()[2].y);

                                                                wordcorners.put("x4", element.getCornerPoints()[3].x);
                                                                wordcorners.put("y4", element.getCornerPoints()[3].y);
                                                            }

                                                            wordpoints.put(wordcorners);

                                                            JSONObject wordframeobj = new JSONObject();
                                                            if (element.getBoundingBox()==null)
                                                            {
                                                                wordframeobj.put("x", "");
                                                                wordframeobj.put("y", "");
                                                                wordframeobj.put("height","");
                                                                wordframeobj.put("width", "");
                                                            }
                                                            else
                                                            {
                                                                wordframeobj.put("x", element.getBoundingBox().left);
                                                                wordframeobj.put("y", element.getBoundingBox().bottom);
                                                                wordframeobj.put("height", element.getBoundingBox().height());
                                                                wordframeobj.put("width", element.getBoundingBox().width());
                                                            }



                                                            wordframe.put(wordframeobj);
                                                            //wordframe.put(element.getBoundingBox());

                                                        }
                                                    }
                                                }


                                                blockobj.put("blocktext", blocktext);
                                                blockobj.put("blockconfidence", blockconfidence);
                                                blockobj.put("blocklanguages", blocklanguages);
                                                blockobj.put("blockpoints", blockpoints);
                                                blockobj.put("blockframe", blockframe);

                                                lineobj.put("linetext", linetext);
                                                lineobj.put("lineconfidence", lineconfidence);
                                                lineobj.put("linelanguages", linelanguages);
                                                lineobj.put("linepoints", linepoints);
                                                lineobj.put("lineframe", lineframe);

                                                wordobj.put("wordtext", wordtext);
                                                wordobj.put("wordconfidence", wordconfidence);
                                                wordobj.put("wordlanguages", wordlanguages);
                                                wordobj.put("wordpoints", wordpoints);
                                                wordobj.put("wordframe", wordframe);

                                                resultobj.put("blocks", blockobj);
                                                resultobj.put("lines", lineobj);
                                                resultobj.put("words", wordobj);

                                                callbackContext.success(resultobj);
                                                PluginResult r = new PluginResult(PluginResult.Status.OK);
                                                callbackContext.sendPluginResult(r);
                                            }
                                        }
                                        catch (JSONException e)
                                        {
                                            callbackContext.error(String.valueOf(e));
                                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                            callbackContext.sendPluginResult(r);
                                        }
                                    })
                                    .addOnFailureListener(
                                            new OnFailureListener() {
                                                @Override
                                                public void onFailure(@NonNull Exception e) {
                                                    callbackContext.error("Error with Text Recognition Module");
                                                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                                    callbackContext.sendPluginResult(r);
                                                }
                                            });
                            */
                        }
                        else
                        {
                            callbackContext.error("Error in uri or base64 data!");
                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                            callbackContext.sendPluginResult(r);
                        }
                    } catch (Exception e) {
                        callbackContext.error("Main loop Exception");
                        PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                        callbackContext.sendPluginResult(r);
                    }
                }
            });

            return true;

        }

        if (action.equals("getBarcode")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        int argstype = NORMFILEURI;
//                            int argrtype = ALL;
                        String argimagestr = "";
                        try
                        {
                            Log.d("argsbeech", args.toString());

                            //JSONObject argsoption = args.getJSONObject(0);
                            //argstype = argsoption.getInt("imgType");
                            argstype = args.getInt(0);
                            argimagestr = args.getString(1);
//                            argrtype = args.getInt(1);
                            //argimagestr = argsoption.getString("imgSrc");
                        }
                        catch(Exception e)
                        {
                            callbackContext.error("Argument error");
                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                            callbackContext.sendPluginResult(r);
                        }
                        Bitmap bitmap= null;
                        Uri uri = null;
                        if(argstype==NORMFILEURI || argstype==NORMNATIVEURI||argstype==FASTFILEURI || argstype==FASTNATIVEURI)
                        {
                            try
                            {
                                if(!argimagestr.trim().equals(""))
                                {
                                    String imagestr = argimagestr;

                                    // code block that allows this plugin to directly work with document scanner plugin and camera plugin
                                    if(imagestr.substring(0,6).equals("file://"))
                                    {
                                        imagestr = argimagestr.replaceFirst("file://","");
                                    }
                                    //

                                    uri = Uri.parse(imagestr);

                                    if((argstype==NORMFILEURI || argstype==NORMNATIVEURI)&& uri != null) // normal ocr
                                    {
                                        bitmap = MediaStore.Images.Media.getBitmap(cordova.getActivity().getBaseContext().getContentResolver(), uri);
                                    }
                                    else if((argstype==FASTFILEURI || argstype==FASTNATIVEURI) && uri != null) //fast ocr (might be less accurate)
                                    {
                                        bitmap = decodeBitmapUri(cordova.getActivity().getBaseContext(), uri);
                                    }

                                }
                                else
                                {
                                    callbackContext.error("Image Uri or Base64 string is empty");
                                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                    callbackContext.sendPluginResult(r);
                                }
                            }
                            catch (Exception e)
                            {
                                e.printStackTrace();
                                callbackContext.error("Exception");
                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                callbackContext.sendPluginResult(r);
                            }
                        }
                        else if (argstype==BASE64)
                        {
                            if(!argimagestr.trim().equals(""))
                            {
                                byte[] decodedString = Base64.decode(argimagestr, Base64.DEFAULT);
                                bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                            }
                            else
                            {
                                callbackContext.error("Image Uri or Base64 string is empty");
                                PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                callbackContext.sendPluginResult(r);
                            }
                        }
                        else
                        {
                            callbackContext.error("Non existent argument. Use 0, 1, 2 , 3 or 4");
                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                            callbackContext.sendPluginResult(r);
                        }

                        FirebaseVisionBarcodeDetectorOptions options =
                                new FirebaseVisionBarcodeDetectorOptions.Builder()
                                        .setBarcodeFormats(
                                                FirebaseVisionBarcode.FORMAT_ALL_FORMATS)
                                        .build();

                        FirebaseVisionBarcodeDetector barcodeRecognizer = FirebaseVision.getInstance()
                                .getVisionBarcodeDetector(options);

                        if (bitmap != null)
                        {
                            FirebaseVisionImage image = FirebaseVisionImage.fromBitmap(bitmap);
                            barcodeRecognizer.detectInImage(image)
                                    .addOnSuccessListener(barcodes -> {
                                        try {
                                            JSONObject resultobj = new JSONObject();
                                            JSONArray rawValue  = new JSONArray();

                                            for (FirebaseVisionBarcode barcode: barcodes) {


                                                //rawValue.put(barcode.getRawValue());
                                                rawValue.put(barcode.getDisplayValue());
                                            }

                                            resultobj.put("blocktext", rawValue);

                                            callbackContext.success(resultobj);
                                            PluginResult r = new PluginResult(PluginResult.Status.OK);
                                            callbackContext.sendPluginResult(r);


                                        }
                                        catch (JSONException e)
                                        {
                                            callbackContext.error(String.valueOf(e));
                                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                            callbackContext.sendPluginResult(r);
                                        }
                                    })
                                    .addOnFailureListener(
                                            new OnFailureListener() {
                                                @Override
                                                public void onFailure(@NonNull Exception e) {
                                                    callbackContext.error("Error with Barcode Recognition Module");
                                                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                                                    callbackContext.sendPluginResult(r);
                                                }
                                            });

                        }
                        else
                        {
                            callbackContext.error("Error in uri or base64 data!");
                            PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                            callbackContext.sendPluginResult(r);
                        }
                    } catch (Exception e) {
                        callbackContext.error("Main loop Exception");
                        PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                        callbackContext.sendPluginResult(r);
                    }
                }
            });

            return true;

        }
            return false;
    }


    private Bitmap decodeBitmapUri(Context ctx, Uri uri) throws FileNotFoundException
    {
        int targetW = 600;
        int targetH = 600;
        BitmapFactory.Options bmOptions = new BitmapFactory.Options();
        bmOptions.inJustDecodeBounds = true;
        BitmapFactory.decodeStream(ctx.getContentResolver().openInputStream(uri), null, bmOptions);
        int photoW = bmOptions.outWidth;
        int photoH = bmOptions.outHeight;

        int scaleFactor = Math.min(photoW / targetW, photoH / targetH);
        bmOptions.inJustDecodeBounds = false;
        bmOptions.inSampleSize = scaleFactor;

        return BitmapFactory.decodeStream(ctx.getContentResolver()
                .openInputStream(uri), null, bmOptions);
    }

    /**
     * Writes Image data into a {@code ByteBuffer}.
     */
    private synchronized ByteBuffer convertBitmapToByteBuffer(
            Bitmap bitmap, int width, int height) {
        ByteBuffer imgData =
                ByteBuffer.allocateDirect(
                        DIM_BATCH_SIZE * DIM_IMG_SIZE_X * DIM_IMG_SIZE_Y * DIM_PIXEL_SIZE);
        imgData.order(ByteOrder.nativeOrder());
        Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, DIM_IMG_SIZE_X, DIM_IMG_SIZE_Y,
                true);
        imgData.rewind();
        scaledBitmap.getPixels(intValues, 0, scaledBitmap.getWidth(), 0, 0,
                scaledBitmap.getWidth(), scaledBitmap.getHeight());
        // Convert the image to int points.
        int pixel = 0;
        for (int i = 0; i < DIM_IMG_SIZE_X; ++i) {
            for (int j = 0; j < DIM_IMG_SIZE_Y; ++j) {
                final int val = intValues[pixel++];
                imgData.put((byte) ((val >> 16) & 0xFF));
                imgData.put((byte) ((val >> 8) & 0xFF));
                imgData.put((byte) (val & 0xFF));
            }
        }
        return imgData;
    }

    /**
     * Reads label list from Assets.
     */
    private List<String> loadLabelList() {
        List<String> labelList = new ArrayList<>();
        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(cordova.getActivity().getAssets().open
                             (LABEL_PATH)))) {
            String line;
            while ((line = reader.readLine()) != null) {
                labelList.add(line);
            }
        } catch (IOException e) {
            Log.e("FD", "Failed to read label list.", e);
        }
        return labelList;
    }

    private void initCustomModel() {
        mLabelList = loadLabelList();


        int[] inputDims = {DIM_BATCH_SIZE, DIM_IMG_SIZE_X, DIM_IMG_SIZE_Y, DIM_PIXEL_SIZE};
        int[] outputDims = {DIM_BATCH_SIZE, mLabelList.size()};
        try {
            mDataOptions =
                    new FirebaseModelInputOutputOptions.Builder()
                            .setInputFormat(0, FirebaseModelDataType.BYTE, inputDims)
                            .setOutputFormat(0, FirebaseModelDataType.BYTE, outputDims)
                            .build();
            FirebaseModelDownloadConditions conditions = new FirebaseModelDownloadConditions
                    .Builder()
                    .requireWifi()
                    .build();
            FirebaseCloudModelSource cloudSource = new FirebaseCloudModelSource.Builder
                    (HOSTED_MODEL_NAME)
                    .enableModelUpdates(true)
                    .setInitialDownloadConditions(conditions)
                    .setUpdatesDownloadConditions(conditions)  // You could also specify
                    // different conditions
                    // for updates
                    .build();
            FirebaseLocalModelSource localSource =
                    new FirebaseLocalModelSource.Builder("asset")
                            .setAssetFilePath(LOCAL_MODEL_ASSET).build();
            FirebaseModelManager manager = FirebaseModelManager.getInstance();
            manager.registerCloudModelSource(cloudSource);
            manager.registerLocalModelSource(localSource);
            FirebaseModelOptions modelOptions =
                    new FirebaseModelOptions.Builder()
                            .setCloudModelName(HOSTED_MODEL_NAME)
                            .setLocalModelName("asset")
                            .build();
            mInterpreter = FirebaseModelInterpreter.getInstance(modelOptions);
        } catch (FirebaseMLException e) {
            Log.e("FD", "Error while setting up the model");
            e.printStackTrace();
        }
    }

    /**
     * Gets the top labels in the results.
     */
    private synchronized List<String> getTopLabels(byte[][] labelProbArray) {
        for (int i = 0; i < mLabelList.size(); ++i) {
            sortedLabels.add(
                    new AbstractMap.SimpleEntry<>(mLabelList.get(i), (labelProbArray[0][i] &
                            0xff) / 255.0f));
            if (sortedLabels.size() > RESULTS_TO_SHOW) {
                sortedLabels.poll();
            }
        }
        List<String> result = new ArrayList<>();
        final int size = sortedLabels.size();
        for (int i = 0; i < size; ++i) {
            Map.Entry<String, Float> label = sortedLabels.poll();
            result.add(label.getKey() + ":" + label.getValue());
        }
        Log.d("FD", "labels: " + result.toString());
        return result;
    }
}
