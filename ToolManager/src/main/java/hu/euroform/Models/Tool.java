package hu.euroform.Models;

import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Enums.ToolState;
import hu.euroform.Factory.ToolFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Tool {
    public UUID id;
    public ToolIdentity toolIdentity;
    public Double diameter;
    public Integer toolCode;
    public Integer maxTime;
    public Integer currentTime;
    public Machine machine;
    public List<Project> projectList;
    public ToolState toolState;
    
    //---
    public static List<Tool> toolList = new ArrayList<>();
    
    public Tool(ToolIdentity toolIdentity) {
        this.id = UUID.randomUUID();
        this.toolIdentity = toolIdentity;
        this.diameter = toolIdentity.diameter;
        this.toolCode = toolIdentity.toolCode;
        this.maxTime = ToolFactory.setMaxToolTime(this.toolCode);
        this.currentTime = 0;
        this.machine = null;
        this.projectList = new ArrayList<>();
        this.toolState = ToolState.FREE;
    }
    
    //----------------------------------
    
    public ToolState getToolState() {
        return this.toolState;
    }
    
    public void updateToolState() {
        if (this.currentTime == 0) {
            this.toolState = ToolState.FREE;
        }
        else if (this.currentTime < this.maxTime) {
            this.toolState = ToolState.INUSE;
        }
        if (this.currentTime > this.maxTime) {
            this.toolState = ToolState.MAXED;
        }
    }
    
    public static void printAllTool() {
        int n = 0;
        for (Tool oneTool:Tool.toolList) {
            String base = "D" + oneTool.diameter + " P" + oneTool.toolCode + " - "
                    + oneTool.toolState + " - " + oneTool.currentTime + " - ";
            
            base += oneTool.machine == null ? "null" : oneTool.machine.machineName;
            
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
