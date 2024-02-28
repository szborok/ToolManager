package hu.euroform.Factory;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;

public class FileConverter {
    
    public static void XLSXToJsonConverter(String excelFilePath, String jsonFilePath) {
        
        try {
            Workbook workbook = new XSSFWorkbook(new FileInputStream(excelFilePath));
            Sheet sheet = workbook.getSheetAt(0); // Assuming you want the first sheet
            
            ObjectMapper objectMapper = new ObjectMapper();
            File jsonFile = new File(jsonFilePath);
            
            // Create a list to store JSON objects representing each row
            List<Map<String, String>> jsonDataList = new ArrayList<>();
            
            // Iterate over rows and columns to build JSON structure
            Iterator<Row> rowIterator = sheet.iterator();
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                
                // Process each row and convert to JSON
                Map<String, String> rowData = processRow(row);
                jsonDataList.add(rowData);
            }
            
            // Write the list of JSON objects to the output JSON file
            objectMapper.writeValue(jsonFile, jsonDataList);
            
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    // You need to implement a method to process each row based on your data structure
    private static Map<String, String> processRow(Row row) {
        Map<String, String> rowData = new HashMap<>();
        
        // Iterate over cells in the row
        Iterator<Cell> cellIterator = row.cellIterator();
        while (cellIterator.hasNext()) {
            Cell cell = cellIterator.next();
            
            // Check the cell type and retrieve the value accordingly
            switch (cell.getCellType()) {
                case STRING:
                    rowData.put(getHeaderName(cell.getColumnIndex()), cell.getStringCellValue());
                    break;
                case NUMERIC:
                    rowData.put(getHeaderName(cell.getColumnIndex()), String.valueOf(cell.getNumericCellValue()));
                    break;
                // Add more cases for other cell types if necessary
                
                default:
                    // Handle other cell types as needed
                    break;
            }
        }
        
        return rowData;
    }
    
    // You may need to implement a method to retrieve the header name based on the column index
    private static String getHeaderName(int columnIndex) {
        // Customize this method based on your actual column headers
        // For example, you might have a predefined list of header names
        return "Column" + (columnIndex + 1);
    }
}
