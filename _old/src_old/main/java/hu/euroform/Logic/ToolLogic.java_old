package hu.euroform.Logic;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import hu.euroform.Enum.ToolIdentity;
import hu.euroform.Enum.ToolState;
import hu.euroform.Exception.ToolAlreadyContainsProjectException;
import hu.euroform.Interface.IToolLogic;
import hu.euroform.Model.Matrix;
import hu.euroform.Model.Project;
import hu.euroform.Model.Tool;

import java.util.List;

public class ToolLogic implements IToolLogic{

    private static final Logger logger = LogManager.getLogger(ToolLogic.class);

    @Override
    public void reserveATool(Double diameter, Integer toolCode, Project project) throws ToolAlreadyContainsProjectException {
        // log and print to terminal are in the called methods.

        Tool theChoosenOne = findTool(diameter, toolCode, project);
        addProjectToTool(theChoosenOne, project);
    }

    //no private or public, becouse it is have to be seen just in this package.
    static Tool findTool(Double diameter, Integer toolCode, Project project) {
        ToolIdentity toolIdentity = Tool.getToolIdentityFromDiameterAndToolCode(diameter, toolCode);
        Tool theChoosenOne = null;

        try {
            // look for a used tool
            // i know 'if' does not required here, but it seems more readable for me.
            if (theChoosenOne == null) {
                logger.info("Looking for a used tool.");
                System.out.println("Looking for a used tool");
                theChoosenOne = findUsedTool(toolIdentity, project);
            }
            // if no used tool then we go for a new one.
            if (theChoosenOne == null) {
                logger.info("Looking for new tool.");
                System.out.println("Looking for new tool.");
                theChoosenOne = findNewTool(toolIdentity);
            }

            // if no used or new tool, that means we have to make a fake one, to not run on
            // error, and to show we overused that type.
            if (theChoosenOne == null) {
                logger.info("No used or new tool in matrix. Creating an in debt tool.");
                System.out.println("No used or new tool in matrix. Creating an in debt tool.");
                theChoosenOne = createInDebtTool(toolIdentity);
            }

        } catch (Exception e) {
            logger.warn("Something went wrong while looking for a tool.");
            System.out.println("Something went wrong while looking for a tool.");
        }
        return theChoosenOne;
    }

    //no private or public, becouse it is have to be seen just in this package.
    static Tool findNewTool(ToolIdentity toolIdentity) {
        Tool returnTool = null;

        for (Tool oneTool : Matrix.toolList) {
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.FREE)) {
                returnTool = oneTool;

                logger.info("New tool has been succesfully find.");
                System.out.println("New tool has been succesfully find.");
                // if we find new tool return that
                return returnTool;
            }
        }
        logger.info("There is no new tool");
        System.out.println("There is no new tool.");
        // if we dont find new tool return null, so we can move to get a used tool
        return null;
    }

    //no private or public, becouse it is have to be seen just in this package.
    static Tool findUsedTool(ToolIdentity toolIdentity, Project project) {
        Double toolMaxTimeMultiplier = 1.2;
        Tool returnTool = null;

        for (Tool oneTool : Matrix.toolList) {
            //find the same type tool, the tool have to be inuse, and the tool can not contain the same project, so cant work on the same thing twice.
            if (oneTool.toolIdentity.equals(toolIdentity) && oneTool.toolState.equals(ToolState.INUSE) && !checkIfToolAlreadyContainsTheProject(oneTool, project)) {
                if (oneTool.currentTime + project.cuttingTime < oneTool.maxTime * toolMaxTimeMultiplier) {
                    returnTool = oneTool;

                    logger.info("Used tool has been succesfully find.");
                    System.out.println("Used tool has been succesfully find.");
                    // if we find used tool return that
                    return returnTool;
                }
            }
        }
        logger.info("There is no used tool");
        System.out.println("There is no used tool.");
        // if we dont find used tool return null, so we can move to get an indebt tool
        return null;
    }

    //no private or public, becouse it is have to be seen just in this package.
    static Tool createInDebtTool(ToolIdentity toolIdentity) {
        Tool inDebtTool = new Tool(toolIdentity.diameter, toolIdentity.toolCode);
        inDebtTool.toolState = ToolState.INDEBT;
        logger.info("Indebt tool created. " + inDebtTool.toString());
        System.out.println("Indebt tool created. " + inDebtTool.toString());

        Matrix.toolList.add(inDebtTool);
        logger.info("Indebt tool added to matrix's tool list.");
        System.out.println("Indebt tool added to matrix's tool list.");

        return inDebtTool;
    }

    public static Boolean checkIfToolAlreadyContainsTheProject(Tool oneTool, Project project) {
        if (oneTool.projectList.contains(project)) {
            // TODO throw error, the tool already contains the project.
            System.out.println("The tool already contains the project. Tool UUID: " + oneTool.id);
            return true;
        }
        return false;
    }

    //no private or public, becouse it is have to be seen just in this package.
    static void addProjectToTool(Tool tool, Project project) throws ToolAlreadyContainsProjectException {

        try {
            tool.projectList.add(project); // add project to tool
            tool.currentTime += project.cuttingTime; // add programme time to tool
            tool.updateToolState(); // update tool state

            logger.info(project.toString() + " has been added to " + tool.toString());
            System.out.println(project.toString() + " has been added to " + tool.toString());
        } catch (Exception e) {
            logger.warn("Project has NOT been added to tool.");
            System.out.println("Project has NOT been added to tool.");
        }

    }

    //no private or public, becouse it is have to be seen just in this package.
    static void removeProjectFromTool(List<Tool> toolList, Project project) {
        //TODO make removeProojectFromTool method, when a project has finished, remove it from tool.
        //Maybe remove the whole tool, becouse if there is one project in it, and constantly one adding and removing one, it will generate fake usage.

    }

}
