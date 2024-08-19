package hu.euroform.Factory;

import java.io.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class LogManagerConfig {

    private static final String LOG_FILE_PREFIX = "uploadFromJSON";
    private static final String LOG_DIRECTORY = "logs";

    private static int getNextFileNumber() {
        File logDir = new File(LOG_DIRECTORY);
        if (!logDir.exists()) {
            logDir.mkdirs();
        }

        // Get list of files with the correct prefix and date
        String dateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(new Date());
        FilenameFilter filter = (dir, name) -> name.matches(LOG_FILE_PREFIX + "-" + dateStr + "-\\d+\\.log");
        File[] files = logDir.listFiles(filter);

        int highestNumber = 0;
        if (files != null) {
            for (File file : files) {
                String fileName = file.getName();
                String numberPart = fileName.substring(fileName.lastIndexOf('-') + 1, fileName.lastIndexOf('.'));
                try {
                    int number = Integer.parseInt(numberPart);
                    if (number > highestNumber) {
                        highestNumber = number;
                    }
                } catch (NumberFormatException e) {
                    // Ignore files that don't match the pattern
                }
            }
        }

        // Return the next number
        return highestNumber + 1;
    }

    public static void setupFileNaming() {
        int attemptNumber = getNextFileNumber();
        String dateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(new Date());
        String logFileName = String.format("%s/%s-%s-%d.log", LOG_DIRECTORY, LOG_FILE_PREFIX, dateStr, attemptNumber);

        // Set the system property for log file name
        System.setProperty("logFilename", logFileName);

        // Log to confirm property is set correctly
        System.out.println("Log file name set to: " + logFileName);
    }
}
