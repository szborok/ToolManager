package hu.euroform.Factory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Models.Tool;

import java.io.File;
import java.io.IOException;

public class FileManager {
    
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
                                Tool.toolList.add(new Tool(oneToolIdentity));
                                
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


    
}
