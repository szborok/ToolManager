package hu.euroform.Factory;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;

import static hu.euroform.Factory.ToolFactory.processRow;

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
}
