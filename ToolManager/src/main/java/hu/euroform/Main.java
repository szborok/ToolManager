package hu.euroform;

import hu.euroform.Factory.FileProcessor;
import hu.euroform.Factory.LogManagerConfig;
import hu.euroform.Factory.ToolFactory;
import hu.euroform.Models.Matrix;

public class Main {
    public static void main(String[] args) {
        // Set up file naming before any logging occurs
        LogManagerConfig.setupFileNaming();

        FileProcessor.processFiles();
        ToolFactory.uploadToolsFromJSON();

        Matrix.printAllTool();
    

















    }











}

