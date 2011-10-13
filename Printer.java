
public class Printer {
	 public static void main(String[] args) {
		 Caller a = new Caller();
		 HelloWriter h = new HelloWriter();
		 WorldWriter w = new WorldWriter();
		 a.call(h);
		 a.call(w);
	 }
}
