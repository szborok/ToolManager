package hu.euroform.Models;

import java.util.ArrayList;
import java.util.List;

public class Employee {
    String firstName;
    String lastName;
    String logInName;
    Integer logInPassword;
    List<Tool> toolList;
    
    public Employee(String firstName, String lastName, String logInName, Integer logInPassword) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.logInName = logInName;
        this.logInPassword = logInPassword;
        this.toolList = new ArrayList<>();
    }
}
