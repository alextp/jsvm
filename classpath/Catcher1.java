
public class Catcher1 {
	 public static void main(String[] args) {
		 try
		 {
			 make_error(1);
		 }
		 catch(AnException e)
		 {
			 e.print();
		 }
		 catch(AnotherException e)
		 {
			 e.print();
		 }
		 finally{
			 System.out.println("in the finally block");
		 }
	 }
	 
	 private static void make_error(int i) throws AnException,AnotherException
	 {
		 if(i==1)
		 {
			 throw new AnException();
		 }
		 else if(i==2)
		 {
			 throw new AnotherException();
		 }
		
	 }
}
