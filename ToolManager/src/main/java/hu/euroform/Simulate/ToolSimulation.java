package hu.euroform.Simulate;

import hu.euroform.Enums.MachineName;
import hu.euroform.Enums.ToolIdentity;
import hu.euroform.Logic.ToolLogic;
import hu.euroform.Models.Project;
import hu.euroform.Models.Tool;
import hu.euroform.Models.Machine;

import java.time.LocalDate;

public class ToolSimulation {
    
        public static void simulateOneTool() {
                
                //add projects where a tool is going to be used
                Project project1 = new Project("W4666RS01", "999", 100, 10, LocalDate.now());
                Project project2 = new Project("W5050NS01", "060", 70, 32, LocalDate.now());
                Project project3 = new Project("W5050NS01", "061", 80, 32, LocalDate.now());
                Project project4 = new Project("W5050NS01", "062", 90, 32, LocalDate.now());
                
                System.out.println("Siimulation started.");
                
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project1);
                System.out.println("---");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project2);
                System.out.println("---");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project3);
                System.out.println("---");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project4);
                
                System.out.println("Simulation ended.");
        }
    
}
