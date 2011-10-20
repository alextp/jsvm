import java.io.File;

public class TestStatic {
    private static File f = new File("foo");
    public static void main(String[] args) {
	System.out.println("Hello!");
    }
}