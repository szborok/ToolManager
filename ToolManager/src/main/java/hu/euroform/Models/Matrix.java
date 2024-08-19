package hu.euroform.Models;

import java.util.ArrayList;
import java.util.List;

import hu.euroform.Enums.ToolState;

public class Matrix {

    public static List<Tool> toolList = new ArrayList<>();
    

    public static void printAllTool() {

        for (Tool oneTool : Matrix.toolList) {
            String base = "D" + oneTool.diameter + " P" + oneTool.toolCode + " - "
                    + oneTool.toolState + " - " + oneTool.currentTime + " - ";

            base += " - Projects: ";

            if (oneTool.projectList == null) {
                base += "null";
            } else {
                for (Project oneProject : oneTool.projectList) {
                    base += oneProject.workNumber + oneProject.pieceNumber + "-" + oneProject.technologyNumber;
                    base += ", ";
                }
            }

            System.out.println(base);
        }
    }

    public void updateAllToolState() {
        for (Tool oneTool : Matrix.toolList) {
            if (oneTool.currentTime == 0) {
                oneTool.toolState = ToolState.FREE;
            } else if (oneTool.currentTime < oneTool.maxTime) {
                oneTool.toolState = ToolState.INUSE;
            } else if (oneTool.currentTime > oneTool.maxTime) {
                oneTool.toolState = ToolState.MAXED;
            }
        }
    }

    public static List<Tool> freeToolsList() {
        List<Tool> freeTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.FREE)) {
                freeTools.add(oneTool);
            }
        }
        return freeTools;
    }
    public static List<Tool> inuseToolsList() {
        List<Tool> inuseTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.INUSE)) {
                inuseTools.add(oneTool);
            }
        }
        return inuseTools;
    }
    public static List<Tool> maxedToolsList() {
        List<Tool> maxedTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.MAXED)) {
                maxedTools.add(oneTool);
            }
        }
        return maxedTools;
    }
    public static List<Tool> indeptToolsList() {
        List<Tool> indeptTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.INDEPT)) {
                indeptTools.add(oneTool);
            }
        }
        return indeptTools;
    }


}
