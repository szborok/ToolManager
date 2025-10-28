package hu.euroform.Utilities;


public final class Constants {

    private Constants() {
    } // Prevent instantiation

    public static final class Folders {
        private Folders() {
        } // Prevent instantiation

        public static final String FILES_TO_PROCESS_FOLDER =    Config.getProperty("files.to.process.folder", "filesToProcess");
        public static final String FILES_PROCESSED_FOLDER =     Config.getProperty("files.processed.folder", "filesProcessedArchive");
        public static final String LOG_FOLDER =                 Config.getProperty("log.folder", "logs");
    }

    public static final class FileNames {
        private FileNames() {
        } // Prevent instantiation

        public static final String MATRIX_ORIGINAL_FILE_NAME =  Config.generateFileName(Config.getProperty("matrix.original.file.name.pattern", "Euroform_Matrix_{date}.xlsx"));
        public static final String MATRIX_FIXED_FILE_NAME =     Config.generateFileName(Config.getProperty("matrix.fixed.file.name.pattern", "Euroform_Matrix_FIXED_{date}.xlsx"));
        public static final String MATRIX_JSON_FILE_NAME =      Config.generateFileName(Config.getProperty("matrix.json.file.name.pattern", "Euroform_Matrix_JSON_{date}.json"));
    }

    public static final class Paths {
        private Paths() {
        } // Prevent instantiation

        public static final String MATRIX_ORIGINAL_FILE =       constructFilePath(Folders.FILES_TO_PROCESS_FOLDER, FileNames.MATRIX_ORIGINAL_FILE_NAME);
        public static final String MATRIX_FIXED_FILE =          constructFilePath(Folders.FILES_PROCESSED_FOLDER, FileNames.MATRIX_FIXED_FILE_NAME);
        public static final String MATRIX_JSON_FILE =           constructFilePath(Folders.FILES_PROCESSED_FOLDER, FileNames.MATRIX_JSON_FILE_NAME);
    }

    // Utility method to construct full file paths
    private static String constructFilePath(String folder, String fileName) {
        return folder.endsWith("/") || folder.endsWith("\\") ? folder + fileName : folder + "/" + fileName;
    }
}
