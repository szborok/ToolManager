package hu.euroform;

import hu.euroform.Factory.FileProcessor;
import hu.euroform.Factory.ToolFactory;
import hu.euroform.Logic.ToolLogic;
import hu.euroform.Model.Matrix;
import hu.euroform.Utilities.Config;
import hu.euroform.Utilities.LogManagerConfig;


public class Main {


    
    public static void main(String[] args) {

        //ERROR FIXED AND JSON file not exist when config is loading so no path for those so the program stops.

        // Initialize configuration
        Config.initialize();

        // Proceed with your application logic
        System.out.println("Application started successfully!");

        FileProcessor oneFileProcessor = new FileProcessor();
        ToolFactory oneToolFactory = new ToolFactory();
        Matrix oneMatrix = new Matrix();
        ToolLogic oneToolLogic = new ToolLogic();
        // Set up file naming before any logging occurs
        LogManagerConfig.setupFileNaming();

        //Remove the first 5 row of the excel and turn it to JSON
        oneFileProcessor.processMatrixXLSXFile();

        //Upload tools from JSON to the Matrix's tool list.
        oneToolFactory.uploadToolsFromJSON();

        Matrix.printAllTool();


        
        
    

















    }











}

