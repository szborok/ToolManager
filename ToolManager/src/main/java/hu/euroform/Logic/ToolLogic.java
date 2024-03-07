package hu.euroform.Logic;

import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Enums.ToolState;
import hu.euroform.Models.Machine;
import hu.euroform.Models.Project;
import hu.euroform.Models.Tool;
import hu.euroform.Simulate.ToolSimulation;

public class ToolLogic {
    
    public static void reserveTool(Double diameter, Integer toolCode, Machine machine, Project project) {
        Double toolMaxTimeMultiplier = 1.2;
        
        ToolIdentity toolIdentity = ToolLogic.getToolIdentityFromDiameterAndToolCode(diameter,toolCode);
        Tool theTool = null;
        
        //get tool, used or new.
        if (checkIfAvailable(diameter, toolCode)) {
            //check if the machine already have that kind of tool
            if (getInUseToolFromMachine(diameter, toolCode, machine) != null) {
                Tool tmp = getInUseToolFromMachine(diameter, toolCode, machine);
                //check if the tool would not run too much over the max time with this project
                if (project.runtimeOfTheTool + tmp.currentTime < tmp.maxTime * toolMaxTimeMultiplier) {
                    theTool = tmp;
                }
            }
            // if no tool match on machine then get a new one
            else {
                theTool = getFreeTool(diameter, toolCode);
            }
        }
        if (theTool == null){
            //if there is no tool what can be officially take, we run over our pool limit and the tool state will be INDEBT
            theTool = new Tool(toolIdentity);
            theTool.toolState = ToolState.INDEBT;
            Tool.toolList.add(theTool);
        }
        
        //reserve the chosen tool
        addProjectToTool(theTool, machine, project);    //add the time, and project and machine to tool, add tool to machine, NO STATUS UPDATE
        if (theTool.toolState != ToolState.INDEBT) {
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
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState != ToolState.MAXED && oneTool.toolState != ToolState.INDEBT) {
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
            tool.machine = machine;                         //add machine to tool
            tool.projectList.add(project);                  //add project to tool
            machine.toolList.add(tool);                     //add tool to machine's tool list
            tool.currentTime += project.runtimeOfTheTool;   //add programme time to tool
            tool.updateToolState();                         //update tool state
            
            
            System.out.println("The " + tool.toolIdentity +"'s UUID is " + tool.id + ".");
            System.out.println("The " + tool.toolIdentity + " is added to "
                    + project.workNumber + project.pieceNumber + "-" + project.technologyNumber
                    + " for " + machine.machineName + " with " + project.runtimeOfTheTool + " minutes of worktime.");
            System.out.println("The " + tool.toolIdentity + " is added to " + machine.machineName + "'s tool list.");
        }
    }
    
    
    
    
    
    
}
