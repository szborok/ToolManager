package hu.euroform.Models;

import java.util.ArrayList;
import java.util.List;

public class Matrix {

    public static List<Tool> toolList = new ArrayList<>();
    public static List<String> log = new ArrayList<>();
   
    public static void printAllTool() {
        
        for (Tool oneTool: Matrix.toolList) {
            String base = "D" + oneTool.diameter + " P" + oneTool.toolCode + " - "
                    + oneTool.toolState + " - " + oneTool.currentTime + " - ";
            
            base += " - Projects: ";
            
            if (oneTool.projectList == null) {
                base += "null";
            }
            else {
                for (Project oneProject : oneTool.projectList) {
                    base += oneProject.workNumber + oneProject.pieceNumber + "-" + oneProject.technologyNumber;
                    base += ", ";
                }
            }
            
            System.out.println(base);
        }
    }


}
