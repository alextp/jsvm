public class Test2 {

    private int i = 1;

    public Test2() {}
    
    public int multAdd(int j) {
	i += 1;
	j *= i;
	return j;
    }
	    
    
    public static void main(String[] args) {
	Test2 f = new Test2();
	System.out.println(f.multAdd(10));
    }
}