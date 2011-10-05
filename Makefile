debug:
	java -cp /opt/local/share/java/rhino/js.jar  org.mozilla.javascript.tools.debugger.Main parseClass.js

compilerun:
	java -cp /opt/local/share/java/rhino/js.jar:.  org.mozilla.javascript.tools.jsc.Main -g -package jsvm parseClass.js 
	java -cp /opt/local/share/java/rhino/js.jar:.:jsvm jsvm.parseClass
