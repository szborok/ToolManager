package hu.euroform.Interface;

import hu.euroform.Exception.ToolAlreadyContainsProjectException;
import hu.euroform.Model.Project;

public interface IToolLogic {

    public void reserveATool(Double diameter, Integer toolCode, Project project) throws ToolAlreadyContainsProjectException;

}
