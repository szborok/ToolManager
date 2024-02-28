package hu.euroform.Factory;

import hu.euroform.Enums.ToolState;
import hu.euroform.Models.Tool;

public class ToolFactory {
    public static Integer setMaxToolTime(Integer toolTypeCode) {
        switch (toolTypeCode) {
            case 8420:
                return 60;
            case 8410:
                return 60;
            case 8400:
                return 60;
            default:
                return 60;
        }
    }
    
}
