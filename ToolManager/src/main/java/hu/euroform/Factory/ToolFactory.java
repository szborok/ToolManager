package hu.euroform.Factory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Models.Matrix;
import hu.euroform.Models.Tool;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class ToolFactory {
    
    public static void uploadToolsFromJSON(String jsonFilePath) {
        
        try {
            // Create ObjectMapper instance
            ObjectMapper objectMapper = new ObjectMapper();
            
            // Read JSON file into JsonNode (assuming it's an array)
            JsonNode jsonArray = objectMapper.readTree(new File(jsonFilePath));
            
            // Iterate through each object in the array
            for (JsonNode jsonObject : jsonArray) {
                // Extract values using field names
                String toolName = jsonObject.get("E-Cut, MFC, XF,XFeed szerszámok").asText();
                
                try {
                    int amount = jsonObject.get("Column2").asInt();
                    
                    for (ToolIdentity oneToolIdentity : ToolIdentity.values()) {
                        if (oneToolIdentity.fullName.equals(toolName)) {
                            for (int i = 0; i < amount - 1; i++) {
                                Matrix.toolList.add(new Tool(oneToolIdentity));
                                
                                //print of successful tool adding
                                //TODO log the successfully added tools each day in a different file.
                                //System.out.println("FileManager.uploadToolsFromJSON: " + "Tool Name: " + toolName + " successfully added.");
                            }
                        }
                    }
                    
                } catch (Exception e) {
                    //System.out.println(toolName + " does not have 'Column2'.");;
                }
            }
            
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    // You may need to implement a method to retrieve the header name based on the column index
    static String getHeaderName(int columnIndex) {
        // Customize this method based on your actual column headers
        // For example, you might have a predefined list of header names
        return "Column" + (columnIndex + 1);
    }
    
    // You need to implement a method to process each row based on your data structure
    static Map<String, String> processRow(Row row) {
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
    
}
