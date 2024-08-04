package hu.euroform.Logic;

import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Enums.ToolState;
import hu.euroform.Models.Matrix;
import hu.euroform.Models.Project;
import hu.euroform.Models.Tool;

public class ToolLogic {

    static Integer workTime = null;

    public static void setWorkTime(Integer workTime) {
        ToolLogic.workTime = workTime;
    }

    
    public static void reserveTool(Double diameter, Integer toolCode, Project project, Integer workTime) {
        ToolIdentity toolIdentity = getToolIdentityFromDiameterAndToolCode(diameter, toolCode);
        Tool theChoosenOne = null;

        theChoosenOne = getUsedTool(toolIdentity, workTime);

        if (theChoosenOne.equals(null)) {
            theChoosenOne = getNewTool(toolIdentity);
        }

        addProjectToTool(theChoosenOne, project);
        //reset the classes work time, to dont make error with the next tool reservation
        setWorkTime(null);
    }
    
    public static ToolIdentity getToolIdentityFromDiameterAndToolCode(Double diameter, Integer toolCode) {
        
        for (ToolIdentity oneToolIdentity : ToolIdentity.values()) {
            if (oneToolIdentity.diameter.equals(diameter) && oneToolIdentity.toolCode.equals(toolCode)) {
                return oneToolIdentity;
            }
        }
        // if there is no match
        System.out.println("There is no tool with D " + diameter + " with this toolcode " + toolCode + ".");
        return null;
    }
    
    
    
    public static Tool getNewTool(ToolIdentity toolIdentity) {
        Tool returnTool = null;
        
        for (Tool oneTool:Matrix.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.FREE)) {
                returnTool = oneTool;
            }
        }
        return returnTool;
    }

    public static Tool getUsedTool(ToolIdentity toolIdentity, Integer workTime) {
        Double toolMaxTimeMultiplier = 1.2;
        Tool returnTool = null;
        
        for (Tool oneTool:Matrix.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.INUSE)) {
                if (oneTool.currentTime + workTime < oneTool.maxTime * toolMaxTimeMultiplier ) {
                    returnTool = oneTool;
                }
            }
        }
        return returnTool;
    }

    public static Tool getDeptTool(ToolIdentity toolIdentity) {
        Tool deptTool = new Tool(toolIdentity.diameter, toolIdentity.toolCode);
        deptTool.toolState = ToolState.INDEPT;
        Matrix.toolList.add(deptTool);

        return deptTool;
        
    }

    
    public static void addProjectToTool(Tool tool, Project project) {

        if (tool.projectList.contains(project)) {
            // TODO throw error, the tool already contains the project.
            System.out.println("The tool already contains the project. Tool UUID: " + tool.id);
        }
    
        if (!tool.projectList.contains(project)  && !tool.toolState.equals(ToolState.MAXED)) {
            tool.projectList.add(project);                  //add project to tool
            tool.currentTime += project.runtimeOfTheTool;   //add programme time to tool
            tool.updateToolState();                         //update tool state
            
            
            System.out.println("The " + tool.toolIdentity +"'s UUID is " + tool.id + ".");
            System.out.println("The " + tool.toolIdentity + " is added to "
                    + project.workNumber + project.version + project.pieceNumber + " - TechnologyNumber: " + project.technologyNumber
                    + project.runtimeOfTheTool + " minutes of worktime.");
        }
    }
    
    
    
    
    
    
}
