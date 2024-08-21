package hu.euroform.Models;

import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Enums.ToolState;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Tool {
    public UUID id;
    public Double diameter;
    public Integer toolCode;
    public ToolIdentity toolIdentity;
    public Integer maxTime;
    public Integer currentTime;
    public List<Project> projectList;
    public ToolState toolState;

    // ---

    public Tool(Double diameter, Integer toolCode) {
        this.id = UUID.randomUUID();
        this.diameter = diameter;
        this.toolCode = toolCode;
        this.toolIdentity = getToolIdentityFromDiameterAndToolCode(diameter, toolCode);
        this.maxTime = toolIdentity.maxToolTime;
        this.currentTime = 0;
        this.projectList = new ArrayList<>();
        this.toolState = ToolState.FREE;
    }

    // ----------------------------------

    @Override
    public String toString() {
        return "Tool ID: " + this.id + " - D" + this.diameter + " " + this.toolCode;
    }
    

    public ToolState getToolState() {
        return this.toolState;
    }


    public void updateToolState() {
        if (this.currentTime == 0) {
            this.toolState = ToolState.FREE;
        } else if (this.currentTime < this.maxTime) {
            this.toolState = ToolState.INUSE;
        } else if (this.currentTime > this.maxTime) {
            this.toolState = ToolState.MAXED;
        }
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




}
