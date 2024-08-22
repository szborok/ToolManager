package hu.euroform.Interface;


import java.util.List;

import hu.euroform.Model.Tool;

public interface IMatrix {

    public List<Tool> getFullToolList();

    public List<Tool> getFreeToolsList();

    public List<Tool> getInuseToolsList();

    public List<Tool> getMaxedToolsList();

    public List<Tool> getIndebtToolsList();

}
