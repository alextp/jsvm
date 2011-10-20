
public class ModTest {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int i = 1;
		int sum1 = 0;
		int sum2 = 0;
		for(i=0;i<9;++i)
		{
			sum1+=i;
		}
		System.out.println("sum1 is " + sum1);
		for(i=0;i<13;++i)
		{
			sum2+=i;
		}
		System.out.println("sum2 is " + sum2);
		int mod = sum2%sum1;
		System.out.println(mod);
	}

}
