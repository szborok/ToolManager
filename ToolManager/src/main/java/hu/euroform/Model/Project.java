package hu.euroform.Model;

import java.time.LocalDate;

public class Project {
    public String workNumber;
    public String version;
    public Integer pieceNumber;
    public String technologyNumber;
    public Integer cuttingTime;
    public LocalDate manufactureDate;

    //W5154NS01005T80
    
    public Project(Integer workNumber, String version, Integer pieceNumber, Integer technologyNumber, Integer cuttingTime, LocalDate manufactureDate) {
        this.workNumber = "W" + workNumber;
        this.version = version.toUpperCase();
        this.pieceNumber = pieceNumber;
        this.technologyNumber = "T" + technologyNumber;
        this.cuttingTime = cuttingTime;
        this.manufactureDate = manufactureDate;
    }

    @Override
    public String toString() {
        return this.workNumber + this.version + this.pieceNumber + this.technologyNumber 
        + " - Work time: " + this.cuttingTime + " minutes, Date of use: " + this.manufactureDate;
    }

    
}
