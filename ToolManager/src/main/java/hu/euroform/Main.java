package hu.euroform;

import hu.euroform.Factory.FileProcessor;
import hu.euroform.Factory.LogManagerConfig;
import hu.euroform.Factory.ToolFactory;
import hu.euroform.Models.Matrix;
import hu.euroform.Simulation.reserveSimulation;

public class Main {
    public static void main(String[] args) {
        // Set up file naming before any logging occurs
        LogManagerConfig.setupFileNaming();

        //Remove the first 5 row of the excel and turn it to JSON
        FileProcessor.processFiles();

        //Upload tools from JSON to the Matrix's tool list.
        ToolFactory.uploadToolsFromJSON();

        Matrix.printAllTool();

        //Run simulation
        reserveSimulation.reserveNewToolSimulation();
        System.out.println("---");
        reserveSimulation.reserveUsedToolSimulation();
        System.out.println("---");
        reserveSimulation.reserveIndebtToolSimulation();
        
    

















    }











}

