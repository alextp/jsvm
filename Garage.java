
public class Garage {

	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Car car= new Car();
		Plane pl = new Plane();
		FlyingVehicle fv = (FlyingVehicle)pl;
		Vehicle v1 = (Vehicle)car;
		Vehicle v2 = (Vehicle)fv;
		Car c2 = (Car)v1;
		FlyingVehicle fv2 = (FlyingVehicle)v2;
		fv2.fly();
		c2.run();
	}

}
