public class Hello {
    public static void main(String[] args) {
	int j = 1;
	for(int i = 1; i < 10; ++i) {
	    j = j*i;
	}
	System.out.println("Hello, World! "+j);
    }
}