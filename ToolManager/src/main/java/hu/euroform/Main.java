package hu.euroform;

import hu.euroform.Factory.FileProcessor;
import hu.euroform.Factory.LogManagerConfig;
import hu.euroform.Factory.ToolFactory;
import hu.euroform.Logic.ToolLogic;
import hu.euroform.Model.Matrix;
import hu.euroform.Simulation.reserveSimulation;


public class Main {
    //Database wont be coded till the program fully complete for version one.
    //Custom exception is made/used.
    //User input test is included in my simulation as written data. Who does not work in manufacturing profession can not do a user imput test, so no reason for that. Sorry.
    //I have a project which is a hangman game what you can play through terminal, below you can see the Github repo link. 
    //It even use external library to send back the definition of the guessed word.
    //https://github.com/szborok/Hangman.git

    public static void main(String[] args) {

        FileProcessor oneFileProcessor = new FileProcessor();
        ToolFactory oneToolFactory = new ToolFactory();
        Matrix oneMatrix = new Matrix();
        ToolLogic oneToolLogic = new ToolLogic();
        // Set up file naming before any logging occurs
        LogManagerConfig.setupFileNaming();

        //Remove the first 5 row of the excel and turn it to JSON
        oneFileProcessor.processFiles();

        //Upload tools from JSON to the Matrix's tool list.
        oneToolFactory.uploadToolsFromJSON();

        //Matrix.printAllTool();

        //Run simulation
        reserveSimulation.reserveNewToolSimulation();
        System.out.println("---");
        reserveSimulation.reserveUsedToolSimulation();
        System.out.println("---");
        reserveSimulation.reserveIndebtToolSimulation();

        
        
    

















    }











}

