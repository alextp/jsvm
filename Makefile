run:
	cd classpath &&  javac -cp . *.java && cd ..
	java -cp js.jar:.  org.mozilla.javascript.tools.jsc.Main -g -package jsvm parseClass.js 
	java -cp js.jar:.:jsvm jsvm.parseClass
