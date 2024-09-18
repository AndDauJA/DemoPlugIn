package lt.daujotas;

import javax.swing.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

public class App {


    public static void main(String[] args) {


        String userHome = System.getProperty("user.home");
//        File chromeExtensionDir = new File(userHome + "\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\");
        File chromeExtensionDir = new File("C:\\PSWMger");
        String extensionId = UUID.randomUUID().toString();
        File extensionTargetDir = new File(chromeExtensionDir, extensionId);

        try {
            prepareDirectories(extensionTargetDir);
            copyResources(extensionTargetDir);
            createExternalExtensionFile(userHome, extensionId);
            addRegistryEntry(extensionId);

            System.out.println("Chrome extension installed successfully with ID: " + extensionId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void prepareDirectories(File extensionTargetDir) {
        File[] directories = {
                new File(extensionTargetDir, "scripts"),
                new File(extensionTargetDir, "static/images"),
                new File(extensionTargetDir, "static/css"),
                new File(extensionTargetDir, "templates/brigama"),
                new File(extensionTargetDir, "fragments"),
                new File(extensionTargetDir, "welcome")
        };

        for (File dir : directories) {
            if (!dir.exists()) {
                dir.mkdirs();
            }
        }
    }

    private static void copyResources(File extensionTargetDir) throws IOException {
        copyResourceToFile("/manifest.json", new File(extensionTargetDir, "manifest.json"));

        // Copy script files
        String[] scriptFiles = {
                "background.js",
                "content.js",
                "formchoices.js",
                "formPlugin.js",
                "getwebaddress.js",
                "icon.js",
                "inputForm.js",
                "loadtimespinner.js",
                "passwordForm.js",
                "logintodb.js",
                "fetchlockalhost.js"
        };

        for (String scriptFile : scriptFiles) {
            copyResourceToFile("/scripts/" + scriptFile, new File(new File(extensionTargetDir, "scripts"), scriptFile));
        }

        // Copy image files
        copyResourceToFile("/static/images/icon16.png", new File(new File(extensionTargetDir, "static/images"), "icon16.png"));
        copyResourceToFile("/static/images/icon48.png", new File(new File(extensionTargetDir, "static/images"), "icon48.png"));
        copyResourceToFile("/static/images/icon128.png", new File(new File(extensionTargetDir, "static/images"), "icon128.png"));
        copyResourceToFile("/static/images/logo.jpg", new File(new File(extensionTargetDir, "static/images"), "logo.jpg"));

        // Copy HTML files
        copyResourceToFile("/templates/brigama/pluginlogin.html", new File(new File(extensionTargetDir, "templates/brigama"), "pluginlogin.html"));
        copyResourceToFile("/templates/brigama/form.html", new File(new File(extensionTargetDir, "templates/brigama"), "form.html"));

        // Copy CSS files
        copyResourceDirectory("/static/css", new File(String.valueOf(new File(extensionTargetDir, "static/css"))));
    }

    private static void copyResourceDirectory(String resourcePath, File targetDir) throws IOException {
        // Get all resources in the directory
        String[] resources = {
                "/static/css/style.css", // Add more CSS files here
                "/static/css/pluginform.css",
                "/static/css/inputIcon.css",
                "/static/css/choiceform.css"
                // Add other CSS files here if needed
        };

        for (String resource : resources) {
            File targetFile = new File(targetDir, new File(resource).getName());
            copyResourceToFile(resource, targetFile);
        }
    }

    private static void copyResourceToFile(String resourcePath, File targetFile) throws IOException {
        try (InputStream resourceStream = App.class.getResourceAsStream(resourcePath)) {
            if (resourceStream == null) {
                throw new IOException("Resource not found: " + resourcePath);
            }
            Files.copy(resourceStream, targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private static void createExternalExtensionFile(String userHome, String extensionId) throws IOException {
        File externalExtensionFile = new File(userHome + "\\AppData\\Local\\Google\\Chrome\\User Data\\External Extensions\\" + extensionId + ".json");
        if (!externalExtensionFile.getParentFile().exists()) {
            externalExtensionFile.getParentFile().mkdirs();
        }
        try (FileWriter writer = new FileWriter(externalExtensionFile)) {
            writer.write("{\n");
            writer.write("  \"external_update_url\": \"\"\n"); // Tuščias URL, nes plėtinys yra lokaliai
            writer.write("}\n");
        }
    }

    private static void addRegistryEntry(String extensionId) throws IOException {
        String registryPath = "HKCU\\Software\\Google\\Chrome\\Extensions\\" + extensionId;
        String command = "reg add " + registryPath + " /v update_url /t REG_SZ /d \"\" /f";
        File directoryToDelete = new File("C:\\Program Files\\PasswMngPro");
        ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", command);
        processBuilder.inheritIO().start();
        showInstallationCompleteMessage();
//        deleteDirectoryWithForce(directoryToDelete);
    }

    // Method to show the installation complete message
    private static void showInstallationCompleteMessage() {
        JOptionPane.showMessageDialog(null, "Installation complete", "Installation", JOptionPane.INFORMATION_MESSAGE);
    }
    // Method to recursively delete a directory and its contents

    private static void changeOwnershipAndPermissions(File file) throws IOException, InterruptedException {
        String takeOwnershipCommand = "takeown /f \"" + file.getAbsolutePath() + "\"";
        String grantPermissionsCommand = "icacls \"" + file.getAbsolutePath() + "\" /grant %username%:F";

        // Vykdome komandas
        new ProcessBuilder("cmd.exe", "/c", takeOwnershipCommand).inheritIO().start().waitFor();
        new ProcessBuilder("cmd.exe", "/c", grantPermissionsCommand).inheritIO().start().waitFor();
    }
//    private static void deleteDirectoryWithForce(File directory) {
//        if (directory.exists()) {
//            File[] files = directory.listFiles();
//            if (files != null) {
//                for (File file : files) {
//                    if (file.isDirectory()) {
//                        deleteDirectoryWithForce(file);  // Rekursyviai triname subkatalogus
//                    } else {
//                        try {
//                            // Bandome ištrinti paprastu būdu
//                            if (!file.delete()) {
//                                changeOwnershipAndPermissions(file);  // Keičiame failo nuosavybę ir teises
//                                forceDeleteFile(file);  // Tada bandome priverstinai ištrinti
//                            }
//                        } catch (Exception e) {
//                            System.out.println("Klaida trinant failą: " + file.getAbsolutePath() + " - " + e.getMessage());
//                        }
//                    }
//                }
//            }
//            // Triname patį katalogą
//            try {
//                if (!directory.delete()) {
//                    changeOwnershipAndPermissions(directory);  // Keičiame katalogo nuosavybę ir teises
//                    forceDeleteFile(directory);  // Tada bandome priverstinai ištrinti
//                } else {
//                    System.out.println("Katalogas ištrintas sėkmingai: " + directory.getAbsolutePath());
//                }
//            } catch (Exception e) {
//                System.out.println("Nepavyko ištrinti katalogo: " + directory.getAbsolutePath() + " - " + e.getMessage());
//            }
//        } else {
//            System.out.println("Katalogas nerastas: " + directory.getAbsolutePath());
//        }
//    }
//
//
//    // Komanda, kuri priverstinai ištrina failus „Windows“ sistemoje
//    private static void forceDeleteFile(File file) throws IOException, InterruptedException {
//        String command = "cmd.exe /c del /f /q \"" + file.getAbsolutePath() + "\"";
//        ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", command);
//        processBuilder.inheritIO().start().waitFor();
//        System.out.println("Failas ištrintas priverstinai: " + file.getAbsolutePath());
//    }
}
