package hu.euroform;

import hu.euroform.Models.Employee;

public final class Constants {
    private Constants() {} // prevent instantiation
    
    /** Group1 constants pertain to blah blah blah... */
    public static final class Employees {
        private Employees() {} // prevent instantiation
        
        public static final Employee lszeman = new Employee("László","Szemán","lszeman",12345);
        public static final Employee bkovacs = new Employee("Kovács","Benedek","bkovacs",12345);
        public static final Employee jgyori = new Employee("Gyori","Jácint","jgyori",12345);
        public static final Employee szborok = new Employee("Borók", "Szabolcs","szborok",12345);
        public static final Employee nvarga = new Employee("Varga", "Norbert", "nvarga",12345);
        public static final Employee anti = new Employee("Anti", "Anti","anti",12345);
        public static final Employee ibujdoso = new Employee("Bujdosó", "Imre", "ibujdoso",12345);
        public static final Employee anemet = new Employee("Német","Attila","anemet",12345);
    }
    
    /** Group2 constants pertain to blah blah blah... */
    public static final class Group2 {
        private Group2() {} // prevent instantiation
        
        public static final String MY_ALPHA_VAL = "A";
        public static final String MY_ALPHA_VAL1 = "B";
    }
    
}
