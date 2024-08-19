package hu.euroform.Factory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.euroform.Constants;
import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Models.Matrix;
import hu.euroform.Models.Tool;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.IOException;

public class ToolFactory {

    private static final Logger logger = LogManager.getLogger(ToolFactory.class);

    public static void uploadToolsFromJSON() {
        logger.info("Starting upload from JSON...");

        try {
            String jsonFilePath = Constants.Paths.OUTPUT_JSON;
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonArray = objectMapper.readTree(new File(jsonFilePath));
            
            for (JsonNode jsonObject : jsonArray) {
                String toolName = jsonObject.path("ToolName").asText(null);
                int amount = jsonObject.path("Amount").asInt(0);
                
                if (toolName == null || toolName.isEmpty()) {
                    logger.warn("ToolName is missing or empty");
                    continue;
                }
                
                ToolIdentity matchingToolIdentity = null;
                for (ToolIdentity oneToolIdentity : ToolIdentity.values()) {
                    if (oneToolIdentity.fullName.equals(toolName)) {
                        matchingToolIdentity = oneToolIdentity;
                        break;
                    }
                }
                
                if (matchingToolIdentity != null) {
                    for (int i = 0; i < amount; i++) {
                        Double diameter = matchingToolIdentity.diameter;
                        Integer toolCode = matchingToolIdentity.toolCode;

                        Matrix.toolList.add(new Tool(diameter, toolCode));
                        logger.info("Tool Name: " + toolName + " successfully added. Amount: " + (i + 1));
                    }
                    logger.info(amount + " DB " + toolName + " has been added to Matrix.");
                } else {
                    logger.warn("No matching tool identity found for: " + toolName);
                }
                
            }
            
        } catch (IOException e) {
            logger.error("Error reading JSON file: " + e.getMessage(), e);
        }
    }
}
