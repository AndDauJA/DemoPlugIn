package lt.daujotas;
import java.io.File;
import java.io.IOException;

public class CustomCode {


    // This method will be executed during the installation
    public void execute() {
        // Define the directory and file
        File dir = new File("C:\\PSWMger");
        if (!dir.exists()) {
            dir.mkdirs(); // Create directory if it doesn't exist
        }

        File file = new File(dir, "example.txt");
        if (!file.exists()) {
            try {
                file.createNewFile(); // Create file if it doesn't exist
            } catch (IOException e) {
                e.printStackTrace(); // Handle potential IOException
            }
        }
    }
}