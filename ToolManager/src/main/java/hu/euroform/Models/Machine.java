package hu.euroform.Models;

import hu.euroform.Enums.MachineName;

import java.util.ArrayList;
import java.util.List;

public class Machine {
    public MachineName machineName;
    public List<Tool> toolList;
    
    //---
    public static List<Machine> machineList = new ArrayList<>();
    
    public Machine(MachineName machineName) {
        this.machineName = machineName;
        this.toolList = new ArrayList<>();
    }
    
    public static void machineGenerator() {
        for (MachineName oneMachine: MachineName.values()) {
            Machine newMachine = new Machine(oneMachine);
            Machine.machineList.add(newMachine);
        }
    }
    
    public static Machine getMachineByName(MachineName machineName) {
        Machine returnMachine = null;
        for (Machine oneMachine:Machine.machineList) {
            if (oneMachine.machineName.equals(machineName)) {
                returnMachine = oneMachine;
            }
        }
        return returnMachine;
    }
    
    
    
    
    
    
}
