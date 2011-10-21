debug:
	java -cp js.jar  org.mozilla.javascript.tools.debugger.Main parseClass.js

compilerun:
	java -cp js.jar:.  org.mozilla.javascript.tools.jsc.Main -g -package jsvm parseClass.js 
	java -cp js.jar:.:jsvm jsvm.parseClass
