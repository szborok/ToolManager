package hu.euroform.Models;

import java.time.LocalDate;

public class Project {
    public String workNumber;
    public String pieceNumber;
    public Integer technologyNumber;
    public Integer runtimeOfTheTool;
    LocalDate manufactureDate;
    
    public Project(String workNumber, String pieceNumber, Integer technologyNumber, Integer runtimeOfTheTool, LocalDate manufactureDate) {
        this.workNumber = workNumber;
        this.pieceNumber = pieceNumber;
        this.technologyNumber = technologyNumber;
        this.runtimeOfTheTool = runtimeOfTheTool;
        this.manufactureDate = manufactureDate;
    }
}
