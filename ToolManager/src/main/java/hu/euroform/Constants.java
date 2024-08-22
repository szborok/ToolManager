package hu.euroform;

import hu.euroform.Model.Employee;

//for future updates, when doing anything in database will require log in from Front End

public final class Constants {
    private Constants() {
    } // prevent instantiation

    /** Group1 constants pertain to blah blah blah... */
    public static final class Employees {
        private Employees() {
        } // prevent instantiation

        public static final Employee lszeman = new Employee("László", "Szemán", "lszeman", 12345);
        public static final Employee bkovacs = new Employee("Kovács", "Benedek", "bkovacs", 12345);
        public static final Employee jgyori = new Employee("Gyori", "Jácint", "jgyori", 12345);
        public static final Employee szborok = new Employee("Borók", "Szabolcs", "szborok", 12345);
        public static final Employee nvarga = new Employee("Varga", "Norbert", "nvarga", 12345);
        public static final Employee anti = new Employee("Anti", "Anti", "anti", 12345);
        public static final Employee ibujdoso = new Employee("Bujdosó", "Imre", "ibujdoso", 12345);
        public static final Employee anemet = new Employee("Német", "Attila", "anemet", 12345);
    }

    /** Group2 constants pertain to blah blah blah... */
    public static final class Paths {
        private Paths() {
        } // prevent instantiation

        public static final String INPUT_XLSX = "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Java/Self/ToolManager/ToolManager/src/main/resources/input/E-Cut,MFC,XF,XFeed-keszlet.xlsx";
        public static final String OUTPUT_XLSX = "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Java/Self/ToolManager/ToolManager/src/main/resources/output/fixedExcel.xlsx";
        public static final String OUTPUT_JSON = "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Java/Self/ToolManager/ToolManager/src/main/resources/output/matrix.json";
    }

}
