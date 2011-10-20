var CONSTANT_Class = 7
var CONSTANT_Fieldref = 9
var CONSTANT_Methodref = 10
var CONSTANT_InterfaceMethodref = 11
var CONSTANT_String = 8
var CONSTANT_Integer = 3
var CONSTANT_Float = 4
var CONSTANT_Long = 5
var CONSTANT_Double = 6
var CONSTANT_NameAndType = 12
var CONSTANT_Utf8 = 1



function print(x) {
    java.lang.System.out.println(x)
}

var CLASSES = {}

function signed(x) {
    if ((x >> 15) == 1) {
	// we actually have a negative number
	return -((1 << 16) - x + 1)
    } else {
	return x
    }
}


function assert(exp, message) {
    if (!exp) {
	var f = new java.lang.Throwable()
	f.printStackTrace()
	throw "help!"
    }
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


function readConstant(f) {
    var tag = f.read()
    if (tag == CONSTANT_Class) {
	return ["class", f.readShort()]
    } else if (tag == CONSTANT_Fieldref) {
	return ["fref", f.readShort(), f.readShort()]
    } else if (tag == CONSTANT_Methodref) {
	return ["mref", f.readShort(), f.readShort()]
    } else if (tag == CONSTANT_InterfaceMethodref) {
	return ["imref", f.readShort(), f.readShort()]
    } else if (tag == CONSTANT_String) {
	return ["string", f.readShort()]
    } else if (tag == CONSTANT_Integer) {
	return ["int", f.readInt()] 
    } else if (tag == CONSTANT_Float) {
	return ["float", f.readFloat()]
    } else if (tag == CONSTANT_Long) {
	return ["long", f.readLong()]
    } else if (tag == CONSTANT_Double) {
	return ["double", f.readDouble()] 
    } else if (tag == CONSTANT_NameAndType) {
	return ["nt", f.readShort(), f.readShort()]
    } else if (tag == CONSTANT_Utf8) {
	return ["utf", f.readUTF()]
    } else {
	assert( 1 == 2)
    }
}

function validateConstants(clist) {
    for (var i = 1; i < clist.length; ++i) {
	var tag = clist[i][0]
	if (tag == "class") {
	    assert(clist[clist[i][1]][0] == "utf")
	    clist[i][1] = clist[clist[i][1]][1]
	}
    }
    for (var i = 1; i < clist.length; ++i) {
	var tag = clist[i][0]
	if (tag == "nt") {
	    assert(clist[clist[i][1]][0] == "utf")
	    clist[i][1] = clist[clist[i][1]][1]
	    assert(clist[clist[i][2]][0] == "utf")
	    clist[i][2] = clist[clist[i][2]][1]
	}
    }
    for (var i = 1; i < clist.length; ++i) {
	var tag = clist[i][0]
	if ((tag == "fref") || (tag == "mref") || (tag == "imref")) {
	    assert(clist[clist[i][1]][0] == "class")
	    clist[i][1] = clist[clist[i][1]][1]
	    assert(clist[clist[i][2]][0] == "nt")
	    clist[i][2] = clist[clist[i][2]]
	}
    }
    for (var i = 1; i < clist.length; ++i) {
	var tag = clist[i][0]
	if (tag == "string") {
	    assert(clist[clist[i][1]][0] =="utf")
	    clist[i][1] = clist[clist[i][1]][1]
	}
    }
}

var typere = /(\[)*(([BCDFIJSZ])|(L[A-Za-z0-9\/]+;))/  
var typereg = /(\[)*(([BCDFIJSZ])|(L[A-Za-z0-9\/]+;))/g
var validateTypeName = typere.test

var methodre = /\(((\[)*(([BCDFIJSZ])|(L[A-Za-z0-9\/]+;)))*\)(((\[)*(([BCDFIJSZ])|(L[A-Za-z0-9\/]+;)))|V)/  ///sdfsdf
var validateMethodName = methodre.test

var ACC_PUBLIC = 0x0001 // Declared public; may be accessed from outside its package.
var ACC_PRIVATE = 0x0002 // Declared private; usable only within the defining class.
var ACC_PROTECTED = 0x0004 // Declared protected; may be accessed within subclasses.
var ACC_STATIC = 0x0008 // Declared static.
var ACC_FINAL = 0x0010 // Declared final; no further assignment after initialization.
var ACC_VOLATILE = 0x0040 // Declared volatile; cannot be cached.
var ACC_TRANSIENT = 0x0080 // Declared transient; not written or read by a persistent object manager.


var ACC_FINAL = 0x0010 // Declared final; no subclasses allowed.
var ACC_SUPER = 0x0020 // Treat superclass methods specially when invoked by the invokespecial instruction.
var ACC_INTERFACE = 0x0200 // Is an interface, not a class.
var ACC_ABSTRACT = 0x0400 // Declared abstract; may not be instantiated.

var ATYPE_BOOLEAN	= 4
var ATYPE_CHAR	  =   5
var ATYPE_FLOAT	  =   6
var ATYPE_DOUBLE	= 7
var ATYPE_BYTE	  =   8
var ATYPE_SHORT	  =   9
var ATYPE_INT	  =  10
var ATYPE_LONG	 =   11
var ATYPE_OBJ = 12

function readInterfaces(f, icount, ctable) {
    var ints = []	    
    for(var i = 0; i < icount; ++i)
	ints.push(ctable[f.readShort()][1])
    return ints
}

function ignoreAttribute(f) {
    var len = f.readInt() 
    print(" --- debug -- ignoring attr len "+len)
    f.skipBytes(len)
}

function readFields(f, fcount, constants) {
    var fields = []
    for (var i = 0; i < fcount; ++i) {
	var flags = f.readShort()
	var name = constants[f.readShort()][1]
	var descr = constants[f.readShort()][1]
	var acount = f.readShort()
	var isconst = false;
	var cval = null;
	print(" --- debug -- field with "+acount+" attributes")
	for (var j = 0; j < acount; ++j) {
	    print(" --- debug -- reading field attrs")
	    var aname = constants[f.readShort()][1]
	    if (aname == "ConstantValue") {
		f.readInt()
		isconst = true;
		cval = constants[f.readShort()]
	    } else {
		print(" --- debug -- ignoring field attr "+name)
		ignoreAttribute(f) // we only need to deal with constantvalue attributes
	    }
	}
	print(" --- debug -- read field name "+name)
	fields.push({
	    flags: flags, // the flags, things like protected, public, etc
	    name: name, // the field name
	    descr: descr, // the field type
	    iscont: isconst, // whether we have a constant
	    cval: cval, // the constant value
	    
	})
    }
    return fields
}

function ignoreAttributes(f, constants) {
    print(" --- debug -- ignoring attributes")
    var acount = f.readShort()
    print(" --- there are "+acount+" attributes to ignore")
    for(var k = 0; k < acount; ++k) {
	var n = f.readShort()
	print(" --- debug -- ignoring attr n "+n+" name "+constants[n])
	//f.readInt()
	ignoreAttribute(f)
    }
}

function readMethods(f, mcount, constants, cls) {
    var ms = []
    print(" --- debug -- reading methods")
    for (var i = 0; i < mcount; ++i) {
	var flags = f.readShort()
	var mni = f.readShort()
	print(" --- debug -- reading index "+mni.toString(16)+" out of "+constants.length+" flags "+flags.toString(2))
	var mname = constants[mni][1]
	var type = constants[f.readShort()][1]
	var acount = f.readShort()
	var code = []
	var nlocals = null
	var synthetic = false
	var deprecated = false
	var handtable = []
	var exceptions = []
	
	for (var j = 0; j < acount; ++j) {
	    var name = constants[f.readShort()][1]
	    if (name == "Code") {
		f.readInt() // ignore length
		f.readShort() // ignore max stack depth
		nlocals = f.readShort()
		var codel = f.readInt()
		var bcode = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, codel)
		f.read(bcode)
		code = []
		for (var k = 0; k < bcode.length; ++k) {
		    code.push(bcode[k])
		    if (code[k] < 0) 
			code[k] = (1 << 8) + code[k]
		}
		var elen = f.readShort()
		print(" --- debug -- method name "+mname+" elen "+elen)
		for (var k=0; k < elen; ++k) {
		    var s = f.readShort()
		    var e = f.readShort()
		    var h = f.readShort()
		    var ti = f.readShort()
		    var t = null
		    if (ti == 0) t = "any"
		    else t = constants[ti][1]
		    handtable.push({
			start: s,
			end: e,
			handler: h,
			type: t
		    })
		}
		ignoreAttributes(f, constants)
	    } else if (name == "Exceptions") {
		f.readInt() // ignore length
		print(" --- debug -- reading exception attribute")
		var elen = f.readShort()
		for (var n = 0 ; n < elen; ++n)
		    exceptions.push(constants[f.readShort()][1])
	    } else if (name == "Synthetic") {
		synthetic = true
		print(" --- debug -- is synthetic")
		ignoreAttribute(f)
	    } else if (name == "Deprecated") {
		deprecated = true
		print(" --- debug -- is deprecated")
		ignoreAttribute(f)
	    } else {
		print(" --- debug -- ignoring method attr "+name)
		ignoreAttribute(f)
	    }
	}
	print(" --- debug -- read method name "+mname+" type "+type)
	ms.push({
	    flags: flags,
	    name: mname,
	    cls: cls,
	    type: type,
	    nlocals: nlocals,
	    code: code,
	    jsfunc: null,
	    synthetic: synthetic,
	    deprecated: deprecated,
	    handtable: handtable,
	    exceptions: exceptions
	})
    }
    return ms
}

function parseClass(fname) {
    var f = new java.io.RandomAccessFile(fname, "r")
    var cf = f.readUnsignedShort()
    assert(cf == 0xcafe)
    cf = f.readUnsignedShort()
    assert(cf == 0xbabe)
    f.readInt() // ignore the version of the format
    var cpcount = f.readShort()
    var constants = [0] // to make indexing start at 1
    for(var i = 1; i < cpcount; ++i) {
	constants.push(readConstant(f))
	var t = constants[constants.length-1]
	if ((t[0] == "long") || (t[0] == "double")) {
	    constants.push(0)
	    i += 1 // dealing with the fact that the constant pool count is wrong
	}
    }
    validateConstants(constants)
    var aflags = f.readShort()
    var ths = constants[f.readShort()][1]
    var supr = constants[f.readShort()][1]
    var icount = f.readShort()
    var interfaces = readInterfaces(f, icount, constants)
    var fcount = f.readShort()
    var fields = readFields(f, fcount, constants)
    var mcount = f.readShort()
    print(" --- debug -- reading "+mcount+" methods")
    var methods = readMethods(f, mcount, constants, ths)
    print(" --- debug -- back to the class")
    ignoreAttributes(f, constants)
    print("Read class: "+ths+" super "+supr+" ifaces "+interfaces)
    for (var f=0; f < fields.length; ++f) {
	print("  field: `"+fields[f]["name"]+"` type: `"+fields[f].descr+"`")
    }
    for (var m=0; m < methods.length; ++m) {
	print(" method: `"+methods[m].name+"` type: `"+methods[m].type+"`")
    }
    var cls = {
	name: ths,
	vtable: null,
	flags: aflags,
	superName: supr,
	stat: {},
	interfaces: interfaces,
	fields: fields,
	methods: methods,
	constants: constants
    }
    CLASSES[ths] = cls
    return cls
}

function makeJsMethod(name, type, func, cls) {
    return {name: name, type:type, jsfunc:func, cls: cls}
}

function getVTable(cls) {
    if (cls.vtable) return cls.vtable;
    var vt = {}
    if (cls.superName) {
	print(" --- debug -- getting "+cls.superName+"'s vtable")
	vt = clone(getVTable(CLASSES[cls.superName]))
    }
    print(" --- debug getting "+cls.name+"'s vtable")
    for (var i = 0; i < cls.methods.length; ++i) {
	var key = cls.methods[i].name + "||"+cls.methods[i].type
	vt[key] = cls.methods[i]
    }
    cls.vtable = vt
    return vt
}

var COUNT_OBJ = 0

CLASSES["java/lang/Object"] = {
    name:"java/lang/Object",
    flags:0,
    superName: null,
    vtable: null,
    interfaces: [],
    fields: [],
    stat: {},
    methods: [
	makeJsMethod("<init>", "()V", function(m, cls, locals) {
	    COUNT_OBJ += 1
	    locals[0].__hash_code = COUNT_OBJ
	    locals[0].__class = cls
	}, "java/lang/Object"),
	makeJsMethod("hashCode", "()I", function(m, cls, locals) {
	    return locals[0].__hash_code
	}, "java/lang/Object"),
	makeJsMethod("equals", "(Ljava/lang/Object;)I", function(m, cls, locals) {
	    return locals[0].__hash_code == locals[1].__hash_code
	}, "java/lang/Object"),
	makeJsMethod("clone", "()V", function(m, cls, locals) {
	    return clone(locals[0])
	}, "java/lang/Object"),
	makeJsMethod("getClass", "()Ljava/lang/Class;", function(m, cls, l) {cls}),
	makeJsMethod("toString", "()Ljava/lang/String;", function(m,cls,l){
	    return cls.name+"@"+locals[0].__hash_code.toStirng(16)
	}, "java/lang/Object")
	//finalize() I can get away with not using finalize
	// notify, wait, etc, not implementing because of lack of threading
	//
    ]
}

CLASSES["java/lang/Serializable"] = {
    name: "java/lang/Serializable",
    flags:0,
    superName:null,
    vtable: null,
    interfaces: [],
    fields: [],
    methods: [],
    stat: {}
}

CLASSES["java/lang/Throwable"] = {
    name: "java/lang/Throwable",
    flags:0,
    superName:"java/lang/Object",
    interfaces:["java/lang/Serializable"],
    fields: [],
    stat: {},
    methods: [
	//  Throwable	fillInStackTrace() 
	//  Throwable	getCause() 
	//  String	getLocalizedMessage() 
	//  String	getMessage() 
	//  StackTraceElement[]	getStackTrace() 
	//  Throwable	initCause(Throwable cause) 
	//  void	printStackTrace() 
	//  void	printStackTrace(PrintStream s) 
	//  void	printStackTrace(PrintWriter s) 
	//  void	setStackTrace(StackTraceElement[] stackTrace) 
	//  String	toString() 
	// Throwable() 
	// Throwable(String message) 
	// Throwable(String message, Throwable cause) 
	// Throwable(String message, Throwable cause) 
	// Now let's see how many of these we can leave blank and still work!
    ]
}

CLASSES["java/lang/Exception"] = {
    name: "java/lang/Exception",
    flags: 0,
    superName: "java/lang/Throwable",
    interfaces: [],
    stat: {},
    methods: [
	makeJsMethod("<init>", "()V", function(m, cls, locals) {
	}, "java/lang/Object"),
	// Exception(String message) 
	// Exception(String message, Throwable cause) 
	// Exception(Throwable cause) 
    ]
}

var INST = []

for (var i = 0; i < 256; ++i) {
    INST[i] = function(code, position, stack, cls, locals) { 
	print("Did not implement bytecode '"+code[position].toString(16)+"'");
	throw "Did not implement bytecode '"+code[position].toString(16)+"'"
    }
}

function iconst(i) { 
    return function(c,p, s, cls, l) { 
	s.push(["int", i]) 
	return p+1 
    }
}

function lconst(i) {
    return function(c,p,s,cls,l) {
	s.push(["long", i])
	return p+1
    }
}

function fconst(i) {
    return function(c,p,s,cls,l) {
	s.push(["float", i])
	return p+1
    }
}

function istore(i) {
    return function(c, p, s, cls, l) { l[i] = s.pop(); return p+1 }
}


function iastorecheck(c,p,s,cls,l,type)//common function to do the array store instructions
{
	//im not checking type here
	//because my example generated a short to be stored in an int array
	var val = s.pop();
	var idx = s.pop();
	var arrayref  = s.pop();
	if(arrayref[0]=="array"&& idx[1]<arrayref[1]["length"])
	{
		arrayref[1]["fields"][idx[1]] = val[1];
	}
	return p+1;
}

function iload(i) {
    return function(c, p, s, cls, l) { s.push(l[i]); return p+1 }
}

function ialoadcheck(c,p,s,cls,l,t) {//common function to do the array load instructions
    var idx = s.pop();
    var arrayref  = s.pop();
    var type= "unknown";
    switch(t) {
    case ATYPE_INT:
	type = "int"
	break;
    case ATYPE_LONG:
	type = "int"
	break;
    case ATYPE_FLOAT:
	type = "float"
	break;
    case ATYPE_DOUBLE:
	type = "double"
	break;
    case ATYPE_BOOLEAN:
	type = "boolean"
	break;
    case ATYPE_CHAR:
	type = "char"
	break;
    case ATYPE_SHORT:
	type = "short"
	break;
    case ATYPE_OBJ:
	type = "obj"
	break
    }
    if(arrayref[0]=="array"&& idx[1]<arrayref[1]["length"]) {
	var val = arrayref[1]["fields"][idx[1]];
	s.push([type,val]);
    }
    return p+1;
}

function if_cmp(func) {
    return function(c,p,s,cls,l) {
	var v1 = s.pop();
	var v2 = s.pop();
	if (!func(v1,v2)) {
	    var off = signed((c[p+1] << 8) + c[p+2])
	    print(" --- debug -- offset is " + off)
	    return p + off
	} else {
	    return p+3
	}
    }
}

function if_eq(func) {
    return function(c, p, s, cls, l) {
	var v = s.pop();
	if (func(v)) {
	    return p+signed((c[p+1] << 8) + c[p+2])
	} else {
	    return p+3
	}
    }
}

function iop(func) {
    return function(c, p, s, cls, l) {
	var v1 = s.pop()
	var v2 = s.pop()
	s.push([v1[0], func(v1[1], v2[1])])
	print(" --- debug -- running op "+func+" with "+v1[1]+" and "+v2[1]+" res "+func(v1[1],v2[1]))
	return p+1
    }
}

function uiop(func) {
    return function(c, p, s, cls, l) {
	var v = s.pop()
	s.push([v[0], func(v[1])])
	print(" --- debug -- running op "+func+" with "+v1[1]+" and "+v2[1]+" res "+func(v1[1],v2[1]))
	return p+1
    }
}


function is_subclass(s,t)
{
	if(s==t)
	{
		return true;
	}
	else
	{
		//check if T is a superclass of S
		var curclass = s;
		var found = false;
		while(curclass!=null)
		{
			var parclass = CLASSES[curclass].superName;	
			if(parclass==t)
			{
				found = true;
				break;
			}
			else
			{
				curclass = parclass;
			}
		}
		return found;
	}
}

function formatArgs(l) {
    // let's make use of the fact that all args are in the newl vector
    // in the function below
    var r = []
    for (var i = 1; i < l.length; ++i) {
	r.push("newl["+i+"][1]")
    }
    print(" --- debug -- formatting args as '"+r.join(",")+"'")
    return r.join(",")
}

function dotify(s) {
    return s.replace("/", ".")
}

function convert(type) {
    return function(c,p,s,cls,l) {
	var orig = s.pop()
	s.push([type, orig[1]]) // "cast"
	return p+1
    }
}




INST[0x02] = iconst(-1)
INST[0x03] = iconst(0)
INST[0x04] = iconst(1)
INST[0x05] = iconst(2)
INST[0x06] = iconst(3)
INST[0x07] = iconst(4)
INST[0x08] = iconst(5)
INST[0x09] = lconst(0)
INST[0x0a] = lconst(1)
INST[0x0b] = fconst(0)
INST[0x0c] = fconst(1)
INST[0x0d] = fconst(2)
INST[0x0e] = fconst(0)
INST[0x0f] = fconst(1)
INST[0x10] = function(c,p,s,cls,l) { // bipush
s.push(["int",c[p+1]]); 
return p+2
} 
INST[0x11] = function(c,p,s,cls,l) //sipush
{
var shrt = c[p+1]<<8|c[p+2]
s.push(["short",shrt])
return p+3
}
INST[0x12] = function(c,p,s,cls,l) { // ldc
    var idx = c[p+1]
    s.push(cls.constants[idx])
    return p+2
}
INST[0x13] = function(c,p,s,cls,l) { // ldc_w
    var idx = (c[p+1] << 8) + c[p+2]
    s.push(cls.constants[idx])
    return p+3
}
INST[0x14] = INST[0x13] // ldc2_w
INST[0x15] = function(c,p,s,cls,l) { s.push(l[c[p+1]]); return p+2} // iload
INST[0x16] = INST[0x15] // lload
INST[0x17] = INST[0x15] // fload
INST[0x18] = INST[0x15] // dload
INST[0x19] = INST[0x15] // aload
INST[0x1a] = iload(0)
INST[0x1b] = iload(1)
INST[0x1c] = iload(2)
INST[0x1d] = iload(3)
INST[0x1e] = iload(0) // lload_0
INST[0x1f] = iload(1) // lload_1
INST[0x20] = iload(2) // lload_2
INST[0x21] = iload(3) // lload_3
INST[0x22] = iload(0) // fload_0
INST[0x23] = iload(1) // fload_1
INST[0x24] = iload(2) // fload_2
INST[0x25] = iload(3) // fload_3
INST[0x26] = iload(0) // dload_0
INST[0x27] = iload(1) // dload_1
INST[0x28] = iload(2) // dload_2
INST[0x29] = iload(3) // dload_3
INST[0x2a] = iload(0) // aload_0
INST[0x2b] = iload(1) // aload_1
INST[0x2c] = iload(2) // aload_2
INST[0x2d] = iload(3) // aload_3
INST[0x2e] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_INT)}//iaload
INST[0x2f] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_LONG)}//laload
INST[0x30] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_FLOAT)}//faload
INST[0x31] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_DOUBLE)}//daload
INST[0x32] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_OBJ)}//aaload
INST[0x33] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_BOOLEAN)}//baload
INST[0x34] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_CHAR)}//caload
INST[0x35] = function(c,p,s,cls,l){return ialoadcheck(c,p,s,cls,l,ATYPE_SHORT)}//saload
INST[0x36] = function(c,p,s,cls,l) { // istore
    var idx = c[p+1]
    l[idx] = s.pop()
    return p+2
}
INST[0x37] = INST[0x36] // lstore
INST[0x38] = INST[0x36] // fstore
INST[0x39] = INST[0x36] // dstore
INST[0x3a] = INST[0x36] // astore
INST[0x3b] = istore(0)
INST[0x3c] = istore(1)
INST[0x3d] = istore(2)
INST[0x3e] = istore(3)
INST[0x3f] = INST[0x3b] // lstore_0
INST[0x40] = INST[0x3c] // lstore_1
INST[0x41] = INST[0x3d] // lstore_2
INST[0x42] = INST[0x3e] // lstore_3
INST[0x43] = INST[0x3b] // fstore_0
INST[0x44] = INST[0x3c] // fstore_1
INST[0x45] = INST[0x3d] // fstore_2
INST[0x46] = INST[0x3e] // fstore_3
INST[0x47] = INST[0x3b] // dstore_0
INST[0x48] = INST[0x3c] // dstore_1
INST[0x49] = INST[0x3d] // dstore_2
INST[0x4a] = INST[0x3e] // dstore_3
INST[0x4b] = INST[0x3b] // astore_0
INST[0x4c] = INST[0x3c] // astore_1
INST[0x4d] = INST[0x3d] // astore_2
INST[0x4e] = INST[0x3e] // astore_3
INST[0x4f] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_INT)}//iastore
INST[0x50] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_LONG)}//lastore
INST[0x51] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_FLOAT)}//fastore
INST[0x52] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_DOUBLE)}//dastore
INST[0x53] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_OBJ )}//aastore
INST[0x54] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_BOOLEAN)}//bastore
INST[0x55] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_CHAR)}//castore
INST[0x56] = function(c,p,s,cls,l){return iastorecheck(c,p,s,cls,l,ATYPE_SHORT)}//sastore
INST[0x57] = function(c,p,s,cls,l){ s.pop(); return p+1} // pop
INST[0x58] = function(c,p,s,cls,l){ s.pop(); s.pop(); return p+1} // pop2
INST[0x59] = function(c,p,s,cls,l) { // dup
    var t = s.pop()
    s.push(t)
    s.push(t)
    return p+1
}
INST[0x5a] = function(c,p,s,cls,l) { // dup_x1
    var v1 = s.pop()
    var v2 = s.pop()
    s.push(v1)
    s.push(v2)
    s.push(v1)
    return p+1
}
// do not implement dup_x2 because we don't want to bother with checking longness

INST[0x5c] = function(c,p,s,cls,l) { // dup2
    var v1 = s.pop()
    var v2 = s.pop()
    s.push(v2); s.push(v1); s.push(v2); s.push(v1)
    return p+1
}
INST[0x5d] = function(c,p,s,cls,l) { // dup2_x1
    var v1 = s.pop()
    var v2 = s.pop()
    var v3 = s.pop()
    s.push(v2); s.push(v1); s.push(v3); s.push(v2); s.push(v1)
    return p+1
}
// likewise with dup2_x2 as with dup_x2

INST[0x5f] = function(c,p,s,cls,l) { // swap
    var v1 = s.pop()
    var v2 = s.pop()
    s.push(v1); s.push(v2)
    return p+1
}
INST[0x60]=INST[0x61]=INST[0x62]=INST[0x63]=iop(function(a,b){return a+b})//{ilfd}add
INST[0x64]=INST[0x65]=INST[0x66]=INST[0x67]=iop(function(a,b){return a-b})//{ilfd}sub
INST[0x68]=INST[0x69]=INST[0x6a]=INST[0x6b]=iop(function(a,b){return a*b})//{ilfd}mul
INST[0x6c]=INST[0x6d]=INST[0x6e]=INST[0x6f]=iop(function(a,b){return a/b})//{ilfd}div
INST[0x70]=INST[0x71]=INST[0x72]=INST[0x73]=iop(function(a,b){return b%a})//{ilfd}rem
INST[0x74]=INST[0x75]=INST[0x76]=INST[0x77]=uiop(function(a){return -a}) // {ilfd}neg
INST[0x78]=INST[0x79]=iop(function(a,b){return b << a})//{il}shl
INST[0x7a]=INST[0x7b]=iop(function(a,b){return b >> a})//{il}shr
INST[0x7c]=INST[0x7d]=iop(function(a,b){return b << a})// u{il}shl FIXME: deal with overflow???
INST[0x7e]=INST[0x7f]=iop(function(a,b){return a & b})// {il}and 
INST[0x80]=INST[0x81]=iop(function(a,b){return a | b})// {il}or
INST[0x82]=INST[0x83]=iop(function(a,b){return a ^ b})// {il}or
INST[0x84] = function(c, p, s, cls, l) { // iinc
    var idx = c[p+1]
    var val = c[p+2]
    l[idx][1] += val
    return p+3
}
INST[0x85] = convert("long") // i2l
INST[0x86] = convert("float") // i2f
INST[0x87] = convert("double") // i2d
INST[0x88] = convert("int") // l2i
INST[0x89] = convert("float") // l2f
INST[0x8a] = convert("double") // l2d
INST[0x8b] = convert("int") // f2i
INST[0x8c] = convert("long") // f2l
INST[0x8d] = convert("double") // f2d
INST[0x8e] = convert("int") // d2i
INST[0x8f] = convert("long") // d2l
INST[0x90] = convert("float") // d2f
INST[0x91] = convert("byte") // i2b
INST[0x92] = convert("char") // i2c
INST[0x93] = convert("int") // i2s
INST[0x94] = function(c,p,s,cls,l) { // lcmp
    var v2 = s.pop()[1];
    var v1 = s.pop()[1];
    if (v1 > v2) s.push(["int", 1])
    else if (v1 == v2) s.push(["int", 0])
    else s.push(["int", -1])
    return p+1;
}
INST[0x95] = INST[0x94] // fcmpl FIXME: ignoring NaNs
INST[0x96] = INST[0x94] // fcmpg 
INST[0x97] = INST[0x94] // dcmpl
INST[0x98] = INST[0x94] // dcmpg
INST[0x99] = if_eq(function(v) {return  v[1] == 0 }) // ifeq
INST[0x9a] = if_eq(function(v) {return  v[1] != 0 }) // ifne
INST[0x9b] = if_eq(function(v) {return  v[1] < 0 }) // iflt
INST[0x9c] = if_eq(function(v) {return  v[1] >= 0 }) // ifge
INST[0x9d] = if_eq(function(v) {return  v[1] > 0 }) // ifgt
INST[0x9e] = if_eq(function(v) {return  v[1] <= 0 }) // ifle
INST[0x9f] = if_cmp(function(v1,v2){return  v1[1] == v2[1] } ) // if_icmpeq
INST[0xa0] = if_cmp(function(v1,v2){return  !(v1[1] == v2[1]) } ) // if_icmpne
INST[0xa1] = if_cmp(function(v1,v2){return  v1[1] < v2[1] } ) // if_icmplt
INST[0xa2] = if_cmp(function(v1,v2){return  v1[1] >= v2[1] } ) // if_icmpge
INST[0xa3] = if_cmp(function(v1,v2){return  v1[1] > v2[1] } ) // if_icmpgt
INST[0xa4] = if_cmp(function(v1,v2){return  v1[1] <= v2[1] } ) // if_icmple
INST[0xa5] = if_cmp(function(v1,v2){return  v1[1] === v2[1] }) // if_acmpeq
INST[0xa6] = if_cmp(function(v1,v2){return  !(v1[1] === v2[1]) }) // if_acmpne
INST[0xa7] = function(c, p, s, cls, l) { // goto
    print(" --- debug -- bytes "+c[p+1]+" and "+c[p+2]+"")
    var off = signed((c[p+1] << 8) + c[p+2])
    print(" --- debug -- offset "+off)
    return off + p+1
}
INST[0xa8] = function(c,p,s,cls,l) { // jsr
    print(" --- debug -- bytes "+c[p+1]+" and "+c[p+2]+"")
    var off = signed((c[p+1] << 8) + c[p+2])
    print(" --- debug -- offset "+off)
    s.push(["int", p+1])
    return off + p + 1
}
INST[0xa9] = function(c,p,s,cls,l) { // ret
    var idx = c[p+1]
    return l[idx]+1
}
INST[0xaa] =function(c,p,s,cls,l) { //tableswitch
    var ctr=1;
    while((p+ctr)%4) {
	++ctr;
    }
    var bctr=0;
    var bites=[];
    for(bctr=0;bctr<12;++bctr) {
	bites[bctr]=c[p+ctr+bctr];
    }	
    var def = ((bites[0] << 24) | (bites[1] << 16) | (bites[2] << 8) | bites[3]);
    var low = ((bites[4] << 24) | (bites[5]<< 16) | (bites[6] << 8) | bites[7]);
    var high = ((bites[8] << 24) | (bites[9] << 16) | (bites[10] << 8) | bites[11]);
    ctr = ctr+bctr;
    var jmptblesize = high-low+1;
    var jmptbl = [];
    var acc = 0;
    for(bctr=0;bctr<jmptblesize*4;++bctr) {
	if(bctr%4==0&&bctr>1) {
	    jmptbl[(bctr/4)-1] = acc;
	    acc=0;
	} else {
	    acc = (acc<<8|c[p+ctr+bctr]);
	}
    }
    jmptbl[(bctr/4)-1] = acc;
    var idx = s.pop();
    var offset = 0;
    if(idx[1]<low||idx[1]>high) {
	offset = def;
    } else {
	offset = jmptbl[idx[1]-low];
    }
    print("--tbleswitch result"+(p+offset));
    return p+offset;
}
INST[0xab] =function(c,p,s,cls,l) { //lookupswitch
    var ctr=1;
    while((p+ctr)%4) {
	++ctr;
    }
    var bctr=0;
    var bites=[];
    for(bctr=0;bctr<8;++bctr) {
	bites[bctr]=c[p+ctr+bctr];
    }	
    var def = ((bites[0] << 24) | (bites[1] << 16) | (bites[2] << 8) | bites[3]);
    var npairs = ((bites[4] << 24) | (bites[5]<< 16) | (bites[6] << 8) | bites[7]);
    ctr = ctr+bctr;
    var jmptblesize = npairs*2;//store key and val in i,i+1
    var jmptbl = [];
    var acc = 0;
    for(bctr=0;bctr<jmptblesize*4;++bctr) {
	if(bctr%4==0&&bctr>1) {
	    jmptbl[(bctr/4)-1] = acc;
	    acc=0;
	} else {
	    acc = (acc<<8|c[p+ctr+bctr]);
	}
    }
    jmptbl[(bctr/4)-1] = acc;
    var idx = s.pop();
    var offset = 0;
    var found= false;
    for(bctr=0;bctr<2*npairs;bctr+=2) {
	if(jmptbl[bctr]==idx[1]) {
	    offset = jmptbl[bctr+1];
	    found = true;
	}
    }
    if(!found) {
	offset = def;
    }
    print("--lookupswitch result"+(p+offset));
    return p+offset;
}
INST[0xac] = function(c,p,s,cls,l) { // ireturn
    print(" --- debug -- returning int")
    return "ireturn"
}
INST[0xad] = INST[0xac] // lreturn
INST[0xae] = INST[0xac] // freturn
INST[0xaf] = INST[0xac] // dreturn
INST[0xb0] = INST[0xac] // areturn
INST[0xb1] = function(c,p,s,cls,l) { // return
    print(" --- debug -- returning")
    return "return"
}
INST[0xb2] = function(c,p,s,cls,l) { // getstatic
    var idx = (c[p+1] << 8) + c[p+2]
    var fref = cls.constants[idx]
    var ncls = fref[1]
    var nt = fref[2]
    if (CLASSES[ncls]) { // our class
	s.push(CLASSES[ncls].stat[nt])
    } else {
	// a JVM class
	eval("var field = "+ncls.replace("/",".")+"."+nt[1])
	s.push(["jvmobj", field])
    }
    return p+3
}
INST[0xb3] = function(c,p,s,cls,l) { // putstatic
    var idx = (c[p+1] << 8) + c[p+2]
    var fref = cls.constants[idx]
    var ncls = fref[1]
    var nt = fref[2]
    var val = s.pop()
    if (CLASSES[ncls]) { // our class
	CLASSES[ncls].stat[nt] = val
    } else {
	// a JVM class
	eval(ncls.replace("/",".")+"."+nt[1] + " = " + val[1])
    }
    return p+3
}
INST[0xb4] = function(c,p,s,cls,l) { // getfield
    var obj = s.pop()
    var fname = cls.constants[(c[p+1] << 8) + c[p+2]][2][1]
    assert(obj[0] == "obj")
    s.push(obj[1].fields[fname])
    return p+3
}
INST[0xb5] = function(c,p,s,cls,l) { // putfield
    var val = s.pop()
    var obj = s.pop()
    var fname = cls.constants[(c[p+1] << 8) + c[p+2]][2][1]
    assert(obj[0] == "obj")
    obj[1].fields[fname] = val
    return p+3
}
INST[0xb6] = function(c,p,s,cls,l) { // invokevirtual
    var idx = (c[p+1] << 8) + c[p+2]
    var m = cls.constants[idx]
    print(" --- debug -- this is "+m)
    var mname = m[2][1]
    var mtype = m[2][2]
    print(" --- debug -- mname is "+mname+" mtype is "+mtype+" ")
    var argst = mtype.match(/(\(.*\))/)[0]
    var nargs = argst.match(typereg)
    if (!nargs) nargs = 0
    else nargs = nargs.length
    print(" --- debug --- passing "+nargs+" args")
    var newl = []
    for (var i = nargs; i >= 0; --i) {
	newl.push(s.pop())
    }
    newl.reverse()
    var o = newl[0]
    if (o[0] == "obj") { // as far as I know there is no difference
			 // here with invokespecial as far as not
			 // checking for permission is concerned
	var obj = o[1]
	var clsname = obj.cls
	var method = obj.vtable[mname + "||"+mtype]
	var ret = null
	if (method.jscode)
	    ret = method.jscode(method, CLASSES[method.cls], newl)
	else
	    ret = runMethod(method, CLASSES[method.cls], newl)
	if (ret == "throw") {
	    s.push(newl[0])
	    return ret
	} else if (ret != "void") 
	    s.push(ret)
	return p+3
    } else {
	// we're in JVM-land, but now with no constructors
	print(" --- debug -- args are "+newl+" formatted as "+formatArgs(newl))
	var code = " var ret = newl[0][1]."+mname+"("+formatArgs(newl)+")"
	print(" --- debug the code is '"+code+"'")
	print(" ----")
	eval(code)
	s.push(["jvmobj", ret])
	return p+3
    }
}
INST[0xb7] = function(c,p,s,cls,l) { // invokespecial
    var idx = (c[p+1] << 8) + c[p+2]
    var m = cls.constants[idx]
    print(" --- debug -- this is "+m)
    var mcls = m[1]
    print(" --- debug -- method class is "+mcls)
    var mname = m[2][1]
    var mtype = m[2][2]
    print(" --- debug -- mname is "+mname+" mtype is "+mtype+" ")
    var argst = mtype.match(/(\(.*\))/)[0]
    var nargs = argst.match(typereg)
    if (!nargs) nargs = 0
    else nargs = nargs.length
    print(" --- debug --- passing "+nargs+" args")
    var newl = []
    for (var i = nargs; i >= 0; --i) {
	newl.push(s.pop())
    }
    newl.reverse()
    var o = newl[0]
    if (o[0] == "obj") {
	var obj = o[1]
	var clsname = obj.cls
	var method = getVTable(CLASSES[mcls])[mname + "||"+mtype]
	var ret = null
	if (method.jsfunc)
	    ret = method.jsfunc(method, CLASSES[method.cls], newl)
	else
	    ret = runMethod(method, CLASSES[method.cls], newl)
	if (ret == "throw") {
	    s.push(newl[0])
	    return ret
	} else if (ret != "void")
	    s.push(ret)
	return p+3
    } else {
	// we're in JVM-land, so we need to actually create the object now
	// if it's a constructor, and it should always be if we're in this situation
	s.pop() // this is so we can push the real object
	print(" --- debug -- args are "+newl+" formatted as "+formatArgs(newl))
	var code = " var newObj = new "+dotify(o[1])+"("+formatArgs(newl)+")"
	print(" --- debug the code is '"+code+"'")
	print(" ----")
	eval(code)
	s.push(["jvmobj", newObj])
	return p+3
    }
}
INST[0xb8] = function(c,p,s,cls,l) { // invokestatic
    var idx = (c[p+1] << 8) + c[p+2]
    var m = cls.constants[idx]
    print(" --- debug -- this is "+m)
    var mcls = m[1]
    print(" --- debug -- method class is "+mcls)
    var mname = m[2][1]
    var mtype = m[2][2]
    print(" --- debug -- mname is "+mname+" mtype is "+mtype+" ")
    var argst = mtype.match(/(\(.*\))/)[0]
    var nargs = argst.match(typereg)
    if (!nargs) nargs = 0
    else nargs = nargs.length
    print(" --- debug --- passing "+nargs+" args")
    var newl = []
    for (var i = nargs-1; i >= 0; --i) {
	newl.push(s.pop())
    }
    newl.reverse()
    if (CLASSES[mcls]) { // we're in our land
	var method = getVTable(CLASSES[mcls])[mname + "||"+mtype]
	var ret = null
	if (method.jsfunc)
	    ret = method.jsfunc(method, CLASSES[method.cls], newl)
	else
	    ret = runMethod(method, CLASSES[method.cls], newl)
	if (ret == "throw") {
	    s.push(newl[0])
	    return "throw"
	} else if (ret != "void")
	    s.push(ret)
	return p+3
    } else {
	// we're in jvm-land, so who knows what to do. FIXME
	assert(1==2)
    }
}
INST[0xb9] = INST[0xb6] // invokeinterface should be equal to invokevirtual
INST[0xba] // unused
INST[0xbb] = function(c,p,s,cls,l) { // new
    var idx = (c[p+1] << 8) + c[p+2]
    var clsname = cls.constants[idx][1]
    if (CLASSES[clsname]) {
	// this means we know which class it is
 	print(" ---- debug ---- creating object "+clsname)
	var obj = {type: clsname}
	var newcls = CLASSES[clsname]
	s.push(["obj", {cls: clsname, fields: {}, vtable: getVTable(newcls)}])
    } else {
	// since we haven't loaded this class we fall back to the JVM
	// classes this is harder than it looks, as JVM classes are
	// initialized and constructed in one shot. The solution then
	// is, I believe, to just push now an empty symbol onto the
	// stack and only create the object when we come to
	// invokespecial
	print(" ---- debug ---- loading jvm class "+clsname)
	s.push(["NEWjvmobj", clsname])
    }
    return p+3
}
INST[0xbc] = function(c,p,s,cls,l) { // newarray
	var arr_type = c[p+1]
	var arr_count = s.pop()
	s.push(["array", {type: arr_type,length:arr_count[1], fields: {} }])
	return p+2
}
INST[0xbd] = function(c,p,s,cls,l) { // anewarray
	var idx = (c[p+1]<<8)+c[p+2]
	var arr_count = s.pop();
	var m = cls.constants[idx];
	var obj_type = m[0];
	var obj_name = m[1];
	s.push(["array", {type: obj_name,length:arr_count[1], fields: {} }])
	return p+3
}
INST[0xbe] = function(c,p,s,cls,l) { // arraylength
    var arr = s.pop()
    s.push(["int", arr.length])
    return p+1
}
INST[0xbf] = function(c,p,s,cls,l) { // athrow
    var ex = s.pop()
    s.length = 0
    s.push(ex)
    return "throw"
}
INST[0xc0] = function(c,p,s,cls,l) {  //checkcast
	var idx = (c[p+1]<<8)|c[p+2];
	var m = cls.constants[idx];
	var tgttype = m[0];
	var tgtname = m[1];
	var src = s.pop();
	var srcname = src[1].cls;
	print("--debug casting to--"+m);
	var convertible = is_subclass(srcname,tgtname);
	if(!convertible)
	{
		print("error! ClassCastException");
		throw "ClassCastException"	
	}
	return p+3;
}
INST[0xc1] = function(c,p,s,cls,l) {  //instanceof
	var idx = (c[p+1]<<8)|c[p+2];
	var m = cls.constants[idx];
	var tgttype = m[0];
	var tgtname = m[1];
	var src = s.pop();
	var srcname = src[1].cls;
	print("--debug casting to--"+m);
	var convertible = is_subclass(srcname,tgtname);
	if(convertible)
	{
		s.push(1);
	}
	else{
		s.push(0);
	}
	return p+3;
}
INST[0xc2] // monitorenter
INST[0xc3] // monitorexit

INST[0xc4] // wide FIXME -- not implementing wide
INST[0xc5] = function(c,p,s,cls,l) { // multianewarray
    var idx = (c[p+1]<<8)+c[p+2]
    var dim = c[p+3]
    var counts = []
    for (var i = 0; i < dim; ++i) {
	counts.push(c[p+4+i])
    }
    var arr_count = s.pop();
    var m = cls.constants[idx];
    var obj_type = m[0];
    var obj_name = m[1];
    var c2 = clone(counts)
    var arr = {type: obj_name,length:c2.pop(), fields: {} }
    while (c2) {
	var dim = counts.pop()
	var new_arr = {type: obj_name, length: dim, fields: {}}
	for (var i = 0; i < dim; ++i) {
	    new_arr.fields[i] = clone(arr)
	}
	arr = new_arr
    }
    s.push(["array", ])
    return p+3+dim
}
INST[0xc6] = if_eq(function(v) {return  v[1] == null}) // ifnull
INST[0xc7] = if_eq(function(v) {return  v[1] != null }) // ifnonnull

// the other instructions are boring or implementation-defined

function matchType(extype, handler) {
    print(" --- debug -- matching "+extype+" with "+handler)
    if (handler == "any") return true
    if (extype == handler) return true
    for (var i = 0; i < CLASSES[extype].interfaces.length; ++i)
	if (CLASSES[extype].interfaces[i] == handler) return true
    if (CLASSES[extype].superName) return matchType(CLASSES[extype].superName,handler)
    return false
}

function runMethod(method, cls, locals) {
    var stack = []
    print(" --- debug -- running class "+cls.name+" method "+method.name)
    if (method.jscode) {
	// call a js version of the method, if exists
	return method.jscode(method, cls, locals)
    } else {
	var code = method.code
	var ip = 0
	while (1) {
	    print(" --- debug -- running inst "+code[ip].toString(16)+" in pos "+ip+" with stack "+stack);
	    var res = INST[code[ip]](code, ip, stack, cls, locals)
	    print(" --- debug -- got "+res+" back")
	    if (res == "return") {
		print("--exiting -- class"+cls.name+"  method  "+method.name)
		return "void"
	    } else if (res == "ireturn") {
		print("--exiting -- class"+cls.name+"  method  "+method.name)
		return stack.pop()
	    } else if (res == "throw") {
		// all-righty, let's implement this thing
		var ex = stack.pop()
		print(" --- debug -- someone threw "+ex)
		// we first need to go through the handlers matching
		// the types of all catches with our exception's type
		var handlers = method.handtable
		var found = false
		for (var i = 0; i < handlers.length; ++i) {
		    if (!((ip > handlers[i].start)&&(ip < handlers[i].end))) continue
		    if (! matchType(ex[1].cls, handlers[i].type)) continue
		    ip = handlers[i].handler
		    stack.push(ex)
		    print(" --- debug -- going to handler at instr "+ip)
		    found = true
		    break
		}
		if (found) continue
		// all else failing we throw it one level up
		locals[0] = ex
		return "throw"
	    } else {
		ip = res
	    }
	}
    }
}

function runClass(cls) {
    // to run a class we need to find the public method Main with type
    //   ([Ljava/lang/String;)V
    // and run it
    print(" --- debug -- running class "+cls.name)
    for (var i = 0; i < cls.methods.length; ++i) {
	var m = cls.methods[i]
	var locals = {0: ["array", {length: 0}]}
	if ((m.name == "main") && (m.type == "([Ljava/lang/String;)V"))
	    return runMethod(m, cls, locals)
    }
    assert(1 == 2)
}

try {
   // var c = parseClass("Test2.class")
    var names = ["ModTest"]
    for (var c =0; c < names.length; ++c ) {
	parseClass(names[c]+".class")
    }
    runClass(CLASSES["ModTest"])
} catch(e) {
    if(e.rhinoException != null)
    {
        e.rhinoException.printStackTrace();
    }
    else if(e.javaException != null)
    {
        e. javaException.printStackTrace();
    }

}
