package hu.euroform.Model;

import java.util.ArrayList;
import java.util.List;

import hu.euroform.Enum.ToolState;
import hu.euroform.Interface.IMatrix;

public class Matrix implements IMatrix{

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
    @Override
    public List<Tool> getFullToolList() {
        return toolList;
    }

    @Override
    public List<Tool> getFreeToolsList() {
        List<Tool> freeTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.FREE)) {
                freeTools.add(oneTool);
            }
        }
        return freeTools;
    }

    @Override
    public List<Tool> getInuseToolsList() {
        List<Tool> inuseTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.INUSE)) {
                inuseTools.add(oneTool);
            }
        }
        return inuseTools;
    }

    @Override
    public List<Tool> getMaxedToolsList() {
        List<Tool> maxedTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.MAXED)) {
                maxedTools.add(oneTool);
            }
        }
        return maxedTools;
    }

    @Override
    public List<Tool> getIndebtToolsList() {
        List<Tool> indebtTools = new ArrayList<>();
        for (Tool oneTool : toolList) {
            if (oneTool.toolState.equals(ToolState.INDEBT)) {
                indebtTools.add(oneTool);
            }
        }
        return indebtTools;
    }


}
