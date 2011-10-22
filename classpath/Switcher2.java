
public class Switcher2 {
	public static void main(String args[])
	{
		int sum=0;
		int rem=0;
		int three=3;
		int two= 2;
		rem = 2101%2100;
		++rem;
		switch (rem)
		{
		case 0:
		case 1:
			sum = sum+1;
			break;
		case 2:
		case 3:
		case 4:
			sum = sum-1;
			break;
		}
		System.out.println(sum);
	}
	
}
