package hu.euroform.Models;

import java.time.LocalDate;

public class Project {
    public String workNumber;
    public String version;
    public Integer pieceNumber;
    public String technologyNumber;
    public Integer runtimeOfTheTool;
    public LocalDate manufactureDate;

    //W5154NS01005T80
    
    public Project(Integer workNumber, String version, Integer pieceNumber, Integer technologyNumber, Integer runtimeOfTheTool, LocalDate manufactureDate) {
        this.workNumber = "W" + workNumber;
        this.version = version.toUpperCase();
        this.pieceNumber = pieceNumber;
        this.technologyNumber = "T" + technologyNumber;
        this.runtimeOfTheTool = runtimeOfTheTool;
        this.manufactureDate = manufactureDate;
    }
}
