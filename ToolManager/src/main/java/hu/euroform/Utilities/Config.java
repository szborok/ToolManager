package hu.euroform.Utilities;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

public final class Config {

    private static final Properties properties = new Properties();

    private Config() {
    } // Prevent instantiation

    /**
     * Initializes the configuration by loading the config.properties file
     * from the companyConfig folder.
     */
    public static void initialize() {
        String configPath = locateConfigFile();

        try (FileInputStream input = new FileInputStream(configPath)) {
            properties.load(input);
            System.out.println("Configuration successfully loaded from: " + configPath); // Optional log
        } catch (IOException e) {
            throw new RuntimeException("Failed to load configuration file from: " + configPath, e);
        }
    }

    // Locate the config.properties file in the companyConfig folder
    private static String locateConfigFile() {
        // Get the current working directory
        String workingDir = System.getProperty("user.dir");

        // Construct the expected path to the config file
        File configFile = new File(workingDir, "companyConfig/config.properties");

        // Validate that the config file exists
        if (!configFile.exists() || !configFile.isFile()) {
            throw new RuntimeException("Configuration file not found at: " + configFile.getAbsolutePath());
        }

        return configFile.getAbsolutePath();
    }

    // Method to get a property with a default value
    public static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    // Method to generate file names dynamically
    public static String generateFileName(String pattern) {
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmm"));
        return pattern.replace("{date}", currentDate);
    }
}

