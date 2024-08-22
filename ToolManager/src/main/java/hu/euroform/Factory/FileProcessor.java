package hu.euroform.Factory;

import java.io.File;

import hu.euroform.Constants;
import hu.euroform.Interface.IFileProcessor;

public class FileProcessor implements IFileProcessor{

    @Override
    public void processFiles() {
        String inputFilePath = Constants.Paths.INPUT_XLSX;
        String outputFilePathXLSX = Constants.Paths.OUTPUT_XLSX;
        String outputFilePathJSON = Constants.Paths.OUTPUT_JSON;

        // Check if input file exists
        File inputFile = new File(inputFilePath);
        if (!inputFile.exists()) {
            System.out.println("Input file does not exist: " + inputFilePath);
            return;
        }

        // Ensure output directories exist
        File outputXLSXFile = new File(outputFilePathXLSX);
        outputXLSXFile.getParentFile().mkdirs();
        File outputJSONFile = new File(outputFilePathJSON);
        outputJSONFile.getParentFile().mkdirs();

        // Remove the first five rows from the Excel file and save it
        FileConverter.removeFirstFiveRows(inputFilePath, outputFilePathXLSX);
        
        // Convert the modified Excel file to JSON
        FileConverter.XLSXToJsonConverter(outputFilePathXLSX, outputFilePathJSON);
    }
}
