package hu.euroform.Factory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.*;

public class FileConverter {

    private static final Logger logger = LogManager.getLogger(FileConverter.class);
    private static final String COUNTER_FILE = "logs/attempt_counter.txt";
    private static final String LOG_FILE_PREFIX = "fileconverter_uploadFromJSON";

    // Method to convert the XLSX to JSON after removing the first 5 rows
    public static void XLSXToJsonConverter(String inputPathXLSX, String outputPathJSON) {
        System.out.println("----- START OF XLSX TO JSON CONVERSION -----");
        System.out.println("Converting XLSX to JSON from: " + inputPathXLSX);
        logger.info("----- START OF XLSX TO JSON CONVERSION -----");
        logger.info("Converting XLSX to JSON from: " + inputPathXLSX);

        try (FileInputStream fis = new FileInputStream(inputPathXLSX);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayNode jsonArray = objectMapper.createArrayNode(); // Create ArrayNode for JSON array

            // Process rows from the 6th row (index 5) onwards
            for (int i = 5; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    ObjectNode jsonObject = objectMapper.createObjectNode(); // Create ObjectNode for JSON object

                    // Assuming the first cell is the tool name and the second cell is the amount
                    Cell toolNameCell = row.getCell(0);
                    Cell amountCell = row.getCell(1);

                    if (toolNameCell != null) {
                        jsonObject.put("ToolName", toolNameCell.toString()); // Key for tool name
                    }

                    if (amountCell != null) {
                        jsonObject.put("Amount", amountCell.getNumericCellValue()); // Key for amount
                    }

                    jsonArray.add(jsonObject); // Add ObjectNode to ArrayNode
                }
            }

            // Ensure the output directory exists
            File outputFile = new File(outputPathJSON);
            outputFile.getParentFile().mkdirs();

            // Write JSON data to the file (overwriting if it exists)
            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(fos, jsonArray);
                System.out.println("JSON file created: " + outputPathJSON);
                logger.info("JSON file created: " + outputPathJSON);
            }

        } catch (IOException e) {
            System.err.println("Error during XLSX to JSON conversion: " + e.getMessage());
            logger.error("Error during XLSX to JSON conversion: " + e.getMessage(), e);
        }

        System.out.println("----- END OF XLSX TO JSON CONVERSION -----");
        logger.info("----- END OF XLSX TO JSON CONVERSION -----");
    }

    // Method to remove the first 5 rows from an XLSX file
    public static void removeFirstFiveRows(String inputPathXLSX, String outputPathXLSX) {
        System.out.println("----- START OF REMOVE FIRST FIVE ROWS -----");
        System.out.println("Removing first five rows from: " + inputPathXLSX);
        logger.info("----- START OF REMOVE FIRST FIVE ROWS -----");
        logger.info("Removing first five rows from: " + inputPathXLSX);

        try (FileInputStream fis = new FileInputStream(new File(inputPathXLSX));
             XSSFWorkbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Print the number of rows before removal
            int initialRowCount = sheet.getLastRowNum() + 1;
            System.out.println("Initial row count: " + initialRowCount);
            logger.info("Initial row count: " + initialRowCount);

            // Remove first 5 rows
            for (int i = 4; i >= 0; i--) { // Iterate backwards
                Row row = sheet.getRow(i);
                if (row != null) {
                    sheet.removeRow(row);
                    System.out.println("Removed row: " + i);
                    logger.info("Removed row: " + i);
                }
            }

            // Shift all the rows up by 5 to remove the empty rows
            int lastRowNum = sheet.getLastRowNum();
            if (lastRowNum > 4) {
                sheet.shiftRows(5, lastRowNum, -5);
                System.out.println("Shifted rows starting from index: 5");
                logger.info("Shifted rows starting from index: 5");
            }

            // Print the number of rows after removal
            int finalRowCount = sheet.getLastRowNum() + 1;
            System.out.println("Final row count: " + finalRowCount);
            logger.info("Final row count: " + finalRowCount);

            // Ensure the output directory exists
            File outputFile = new File(outputPathXLSX);
            outputFile.getParentFile().mkdirs();

            // Write the updated workbook to the file (overwriting if it exists)
            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                workbook.write(fos);
                System.out.println("Excel file with removed rows saved: " + outputPathXLSX);
                logger.info("Excel file with removed rows saved: " + outputPathXLSX);
            }

        } catch (IOException e) {
            System.err.println("Error during row removal: " + e.getMessage());
            logger.error("Error during row removal: " + e.getMessage(), e);
        }

        System.out.println("----- END OF REMOVE FIRST FIVE ROWS -----");
        logger.info("----- END OF REMOVE FIRST FIVE ROWS -----");
    }
    
    // Other methods as necessary
}
