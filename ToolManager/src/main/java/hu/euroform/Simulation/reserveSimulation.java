package hu.euroform.Simulation;

import hu.euroform.Exception.ToolAlreadyContainsProjectException;
import hu.euroform.Logic.ToolLogic;
import hu.euroform.Model.Project;

import java.time.LocalDate;

public class reserveSimulation {

    static ToolLogic oneToolLogic = new ToolLogic();

    static LocalDate today = LocalDate.now();

    static Project project30min = new Project(5001, "NS01", 060, 120, 30, today);
    static Project project10min = new Project(5002, "NS01", 060, 120, 10, today);
    static Project project60min = new Project(5003, "NS01", 060, 120, 60, today);
    static Project project90min = new Project(5003, "NS01", 060, 120, 90, today);

    public static void reserveNewToolSimulation() {
        System.out.println("START --- reserveNewToolSimulation");

        //use '.' for double
        try {
            oneToolLogic.reserveATool(5.7,8400, project30min);
        } catch (ToolAlreadyContainsProjectException e) {
            e.printStackTrace();
        }
        System.out.println("Reserve a new tool test was successful.");
        System.out.println("END --- reserveNewToolSimulation");
    }

    public static void reserveUsedToolSimulation() {
        System.out.println("START --- reserveUsedToolSimulation");

        //use '.' for double
        try {
            //on first run it makes a new tool, on the second run it will find the used one and add to that.
            oneToolLogic.reserveATool(7.7,8201, project30min);
            oneToolLogic.reserveATool(7.7, 8201, project10min);
        } catch (ToolAlreadyContainsProjectException e) {
            e.printStackTrace();
        }
        System.out.println("Reserve an used tool test was successful.");
        System.out.println("END --- reserveUsedToolSimulation");
    }

    public static void reserveIndebtToolSimulation() {
        //check for RT-8410610 becouse 0 is in the matrix/file
        //RT-8410610 = D15.6 8410610
        System.out.println("START --- reserveIndebtToolSimulation");

        //use '.' for double
        try {
            // max tool time is 60 we add 90 so we can not find any used one even if there is any by accident.
            oneToolLogic.reserveATool(15.6, 8410, project90min);
        } catch (ToolAlreadyContainsProjectException e) {
            e.printStackTrace();
        }
        System.out.println("Reserve an indebt tool test was successful.");
        System.out.println("END --- reserveIndebtToolSimulation");
    }

}
