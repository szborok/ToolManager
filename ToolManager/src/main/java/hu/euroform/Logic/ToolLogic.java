package hu.euroform.Logic;

import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Enums.ToolState;
import hu.euroform.Models.Machine;
import hu.euroform.Models.Project;
import hu.euroform.Models.Tool;

public class ToolLogic {
    
    public static void reserveTool(Double diameter, Integer toolCode, Machine machine, Project project) {
        ToolIdentity toolIdentity = ToolLogic.getToolIdentityFromDiameterAndToolCode(diameter,toolCode);
        Tool theTool = null;
        
        //get tool, used or new.
        if (checkIfAvailable(diameter, toolCode)) {
            if (getInUseToolFromMachine(diameter, toolCode, machine) != null) {
                theTool = getInUseToolFromMachine(diameter, toolCode, machine);
            }
            else {
                theTool = getFreeTool(diameter, toolCode);
            }
        }
        else {
            //TODO throw error, there is no tool can be taken
            System.out.println("There is no " + toolIdentity + " can be taken for "
                    + project.workNumber + project.pieceNumber + "-" + project.technologyNumber
                    + " to " + machine.machineName + ".");
        }
        
        //reserve the chosen tool
        if (theTool != null){
            addProjectToTool(theTool, machine, project);
            //update tool time
            theTool.currentTime += project.runtimeOfTheTool;
            //update tool state
            theTool.updateToolState();
        }
    }
    
    public static ToolIdentity getToolIdentityFromDiameterAndToolCode(Double diameter, Integer toolCode) {
        
        for (ToolIdentity oneToolIdentity : ToolIdentity.values()) {
            if (oneToolIdentity.diameter.equals(diameter) && oneToolIdentity.toolCode.equals(toolCode)) {
                return oneToolIdentity;
            }
        }
        // if there is no match
        System.out.println("There is no tool with this diameter " + diameter + " and with this toolcode " + toolCode + ".");
        return null;
    }
    
    public static Boolean checkIfAvailable(Double diameter, Integer toolCode) {
        ToolIdentity toolIdentity = ToolLogic.getToolIdentityFromDiameterAndToolCode(diameter,toolCode);
        for (Tool oneTool:Tool.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState != ToolState.MAXED) {
                return true;
            }
        }
        return false;
    }
    
    public static Tool getInUseToolFromMachine(Double diameter, Integer toolCode, Machine machine) {
        ToolIdentity toolIdentity = ToolLogic.getToolIdentityFromDiameterAndToolCode(diameter,toolCode);
        Tool returnTool = null;
        
        for (Machine oneMachine:Machine.machineList) {
            if (oneMachine.machineName.equals(machine.machineName)) {
                for (Tool oneTool: oneMachine.toolList) {
                    if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState != ToolState.MAXED) {
                        returnTool = oneTool;
                    }
                }
            }
        }
        return returnTool;
    }
    
    public static Tool getFreeTool(Double diameter, Integer toolCode) {
        ToolIdentity toolIdentity = ToolLogic.getToolIdentityFromDiameterAndToolCode(diameter,toolCode);
        Tool returnTool = null;
        
        for (Tool oneTool:Tool.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.FREE)) {
                returnTool = oneTool;
            }
        }
        return returnTool;
    }
    
    public static void addProjectToTool(Tool tool, Machine machine, Project project) {
        if (tool.toolState.equals(ToolState.FREE)) {
            tool.toolState = ToolState.INUSE;
        }
        if (tool.projectList.contains(project)) {
            //TODO throw error, the tool already contains the project.
            System.out.println("The tool already contains the project. Tool UUID: " + tool.id);
        }
        if (tool.toolState.equals(ToolState.MAXED)) {
            //TODO throw error, the tool already maxed out.
            System.out.println("The tool already maxed out. Tool UUID: " + tool.id);
        }
        if (tool.machine != null) {
            if (!tool.machine.equals(machine)) {
                //TODO throw error, the tool is already assigned to another machine.
                System.out.println("The tool is already assigned to another machine.");
            }
        }
        
        //if it passes all test, add the project and machine to the tool, and tool to the machine
        if (!tool.projectList.contains(project) && (tool.machine == null || tool.machine.equals(machine)) && !tool.toolState.equals(ToolState.MAXED)) {
            tool.machine = machine;                 //add machine to tool
            tool.projectList.add(project);          //add project to tool
            machine.toolList.add(tool);             //add tool to machine's tool list
            
            System.out.println("The " + tool.toolIdentity +"'s UUID is " + tool.id + ".");
            System.out.println("The " + tool.toolIdentity + " is added to "
                    + project.workNumber + project.pieceNumber + "-" + project.technologyNumber
                    + " for " + machine.machineName + " with " + project.runtimeOfTheTool + " minutes of worktime.");
            System.out.println("The " + tool.toolIdentity + " is added to " + machine.machineName + "'s tool list.");
        }
    }
    
    
    
    
    
    
}
