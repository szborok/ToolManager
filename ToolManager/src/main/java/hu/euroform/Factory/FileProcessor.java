package hu.euroform.Factory;

import java.io.File;

import hu.euroform.Interface.IFileProcessor;
import hu.euroform.Utilities.Constants;

public class FileProcessor implements IFileProcessor{

    @Override
    public void processMatrixXLSXFile() {
        //Find the Matrix's XLSX file using the path from Constants.java
        //Deletes the first five row of the input XLSX, becouse the Matrix not just send raw data, it send other informations before it.
        //Saves the manipulated XLSX to a different directory
        //Converts the manipulated XLSX to JSON

        String originalXLSX = Constants.Paths.MATRIX_ORIGINAL_FILE;
        String fixedXLSX = Constants.Paths.MATRIX_FIXED_FILE;
        String resultJSON = Constants.Paths.MATRIX_JSON_FILE;

        // Check if input file exists
        File checkForExistingInputFile = new File(originalXLSX);
        if (!checkForExistingInputFile.exists()) {
            //TODO error for missing/ not correct name/ path of the input file
            System.out.println("Input file does not exist: " + checkForExistingInputFile);
            return;
        }

        // Ensure output directories exist
        //TODO handle error
        File outputXLSXFile = new File(fixedXLSX);
        outputXLSXFile.getParentFile().mkdirs();
        File outputJSONFile = new File(resultJSON);
        outputJSONFile.getParentFile().mkdirs();

        // Remove the first five rows from the Excel file and save it.
        FileConverter.removeFirstFiveRows(originalXLSX, fixedXLSX);
        
        // Convert the modified Excel file to JSON
        FileConverter.XLSXToJsonConverter(fixedXLSX, resultJSON);
    }
}
