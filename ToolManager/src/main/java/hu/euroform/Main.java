package hu.euroform;

import hu.euroform.Factory.FileManager;
import hu.euroform.Models.Machine;
import hu.euroform.Models.Tool;
import hu.euroform.Simulate.ToolSimulation;

public class Main {
    public static void main(String[] args) {
        
        Machine.machineGenerator(); //generate machines
        
//        Converter.XLSXToJsonConverter(
//                "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Java/Self/ToolManager/dataToProcess/E-Cut,MFC,XF,XFeed-keszlet.xlsx",
//                "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Java/Self/ToolManager/dataProcessed/processed.json");
        
        FileManager.uploadToolsFromJSON("/Users/sovi/Downloads/E-Cut,MFC,XF,XFeed-keszlet.json");
        
        Tool.printAllTool();
    
    
        
        
        
        
        
        
        
        
        
        
        
    
    
    
    
    }
}