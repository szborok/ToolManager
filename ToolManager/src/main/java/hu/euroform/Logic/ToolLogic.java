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


    @SuppressWarnings("null")
    public static Tool findTool(Double diameter, Integer toolCode, Project project, Integer workTime) {
        ToolIdentity toolIdentity = Tool.getToolIdentityFromDiameterAndToolCode(diameter, toolCode);
        Tool theChoosenOne = null;

        try {
            // look for a used tool
            //i know if does not required here, but it seems more readable for me.
            if (theChoosenOne.equals(null)) {
                theChoosenOne = findUsedTool(toolIdentity, workTime); 
            }
            //if no used tool then we go for a new one.
            if (theChoosenOne.equals(null)) {
                System.out.println("No used tool in the matrix. Looking for a new tool.");
                theChoosenOne = findNewTool(toolIdentity);
            }

            //if no used or new tool, that means we have to make a fake one, to not run on error, and to show we overused that type.
            if (theChoosenOne.equals(null)) {
                System.out.println("No used or new tool in matrix. Creating an in dept tool.");
                theChoosenOne = createInDeptTool(toolIdentity);
                System.out.println("In dept tool has been created.");
            }
            
        } catch (Exception e) {
            System.out.println("Something went wrong while looking for a tool.");
        }
        return theChoosenOne;
    }

    
    public static Tool findNewTool(ToolIdentity toolIdentity) {
        Tool returnTool = null;
        
        for (Tool oneTool:Matrix.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.FREE)) {
                returnTool = oneTool;
            }
        }
        return returnTool;
    }


    public static Tool findUsedTool(ToolIdentity toolIdentity, Integer workTime) {
        Double toolMaxTimeMultiplier = 1.2;
        Tool returnTool = null;
        
        for (Tool oneTool:Matrix.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.INUSE)) {
                if (oneTool.currentTime + workTime < oneTool.maxTime * toolMaxTimeMultiplier ) {
                    returnTool = oneTool;
                    return returnTool;
                    // if we find used tool return that
                }
            }
        }
        //if we dont find used tool return null, so we can move to get a new/free tool
        return null;
    }


    public static Tool createInDeptTool(ToolIdentity toolIdentity) {
        Tool inDeptTool = new Tool(toolIdentity.diameter, toolIdentity.toolCode);
        inDeptTool.toolState = ToolState.INDEPT;
        Matrix.toolList.add(inDeptTool);

        return inDeptTool;
        
    }

    
    public static void addProjectToTool(Tool tool, Project project) {

        if (!Tool.checkIfToolAlreadyContainsTheProject(tool, project))   {
            tool.projectList.add(project);                  //add project to tool
            tool.currentTime += project.runtimeOfTheTool;   //add programme time to tool
            tool.updateToolState();                     //update tool state
            
            
            System.out.println("The " + tool.toolIdentity +"'s UUID is " + tool.id + ".");
            System.out.println("The " + tool.toolIdentity + " is added to "
                    + project.workNumber + project.version + project.pieceNumber + " - TechnologyNumber: " + project.technologyNumber
                    + project.runtimeOfTheTool + " minutes of worktime.");
        }
    }
    
    
    
    
    
    
}
