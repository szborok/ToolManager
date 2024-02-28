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
                
                //add a tool to the pool
                //Tool.toolList.add(new Tool(ToolIdentity.RT8400300)); //D5.7, P8400
                Tool.toolList.add(new Tool(ToolIdentity.RT8400300)); //D5.7, P8400
                
                //add projects where a tool is going to be used
                Project project1 = new Project("W4666RS01", "999", 100, 10, LocalDate.now());
                Project project2 = new Project("W5050NS01", "060", 70, 32, LocalDate.now());
                Project project3 = new Project("W5050NS01", "061", 80, 32, LocalDate.now());
                Project project4 = new Project("W5050NS01", "062", 90, 32, LocalDate.now());
                
                System.out.println("TEST: Trying to get/rent a tool, when the pool is does not contain that tool.");
                ToolLogic.reserveTool(6.0,8400, Machine.getMachineByName(MachineName.DMC105), project1);
                System.out.println("---");
                System.out.println("TEST: Add 32 min to a tool what exist!");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project2);
                System.out.println("---");
                System.out.println("TEST: Add another 32 min to the tool, so it will be maxed out.");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project3);
                System.out.println("---");
                System.out.println("TEST: Add another 30 min to tool, the only what can be found is maxed, so we cant add it.");
                ToolLogic.reserveTool(5.7,8400, Machine.getMachineByName(MachineName.DMC105), project4);
        }
    
}
