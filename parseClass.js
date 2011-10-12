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


function readInterfaces(f, icount, ctable) {
    var ints = []	    
    for(var i = 0; i < icount; ++i)
	ints.push(ctable[f.readShort()])
    return ints
}

function ignoreAttribute(f) {
    var len = f.readInt() 
    for (var k = 0; k < len; ++k) f.read()
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
	for (var j = 0; j < acount; ++j) {
	    var name = constants[f.readShort()][1]
	    if (name == "ConstantValue") {
		f.readLong()
		isconst = true;
		cval = constants[f.readShort()]
	    } else {
		ignoreAttribute(f) // we only need to deal with constantvalue attributes
	    }
	}
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

function ignoreAttributes(f) {
    var acount = f.readShort()
    for(var k = 0; k < acount; ++k) {
	f.readShort()
	//f.readInt()
	ignoreAttribute(f)
    }
}

function readMethods(f, mcount, constants, cls) {
    var ms = []
    for (var i = 0; i < mcount; ++i) {
	var flags = f.readShort()
	var mname = constants[f.readShort()][1]
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
		for (var k=0; k < elen; ++k) {
		    handtable.push({
			start: f.readShort(),
			end: f.readShort(),
			handler: f.readShort(),
			type: constants[f.readShort()][1]
		    })
		}
		ignoreAttributes(f)
	    } else if (name == "Exceptions") {
		f.reatInt() // ignore length
		var elen = f.readShort()
		exceptions.push(constants[f.readShort()][1])
	    } else if (name == "Synthetic") {
		synthetic = true
		f.readInt()
	    } else if (name == "Deprecated") {
		deprecated = true
		f.readInt()
	    } else ignoreAttribute(f)
	}
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
    var methods = readMethods(f, mcount, constants, ths)
    ignoreAttributes(f)
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

var INST = []

for (var i = 0; i < 256; ++i) {
    INST[i] = function(code, position, stack, cls, locals) { 
	throw "Did not implement bytecode '"+code[position].toString(16)+"'"
    }
}

function iconst(i) { 
    return function(c,p, s, cls, l) { 
	s.push(["int", i]) 
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

function istore(i) {
    return function(c, p, s, cls, l) { l[i] = s.pop(); return p+1 }
}

INST[0x3b] = istore(0)
INST[0x3c] = istore(1)
INST[0x3d] = istore(2)
INST[0x3e] = istore(3)


INST[0x4b] = istore(0) // astore_0
INST[0x4c] = istore(1) // astore_1
INST[0x4d] = istore(2) // astore_2
INST[0x4e] = istore(3) // astore_3

function iload(i) {
    return function(c, p, s, cls, l) { s.push(l[i]); return p+1 }
}

INST[0x1a] = iload(0)
INST[0x1b] = iload(1)
INST[0x1c] = iload(2)
INST[0x1d] = iload(3)
INST[0x15] = function(c,p,s,cls,l) { s.push(l[c[p+1]]); return p+2} // iload

INST[0x19] = function(c,p,s,cls,l) { s.push(l[c[p+1]]); return p+2} // aload
INST[0x2a] = iload(0) // aload_0
INST[0x2b] = iload(1) // aload_1
INST[0x2c] = iload(2) // aload_2
INST[0x2d] = iload(3) // aload_3


INST[0x10] = function(c,p,s,cls,l) { s.push(["int",c[p+1]]); return p+2} // bipush

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

INST[0xa5] = if_cmp(function(v1,v2){return  v1[1] === v2[1] }) // if_acmpeq
INST[0xa6] = if_cmp(function(v1,v2){return  !(v1[1] === v2[1]) }) // if_acmpne
INST[0x9f] = if_cmp(function(v1,v2){return  v1[1] == v2[1] } ) // if_icmpeq
INST[0xa0] = if_cmp(function(v1,v2){return  !(v1[1] == v2[1]) } ) // if_icmpne
INST[0xa1] = if_cmp(function(v1,v2){return  v1[1] < v2[1] } ) // if_icmplt
INST[0xa2] = if_cmp(function(v1,v2){return  v1[1] >= v2[1] } ) // if_icmpge
INST[0xa3] = if_cmp(function(v1,v2){return  v1[1] > v2[1] } ) // if_icmpgt
INST[0xa4] = if_cmp(function(v1,v2){return  v1[1] <= v2[1] } ) // if_icmple

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

INST[0x99] = if_eq(function(v) {return  v[1] == 0 }) // ifeq
INST[0x9a] = if_eq(function(v) {return  v[1] != 0 }) // ifne
INST[0x9b] = if_eq(function(v) {return  v[1] < 0 }) // iflt
INST[0x9c] = if_eq(function(v) {return  v[1] >= 0 }) // ifge
INST[0x9d] = if_eq(function(v) {return  v[1] > 0 }) // ifgt
INST[0x9e] = if_eq(function(v) {return  v[1] <= 0 }) // ifle
INST[0xc7] = if_eq(function(v) {return  v[1] != null }) // ifnonnull
INST[0xc6] = if_eq(function(v) {return  v[1] == null}) // ifnull

function iop(func) {
    return function(c, p, s, cls, l) {
	var v1 = s.pop()
	var v2 = s.pop()
	s.push([v1[0], func(v1[1], v2[1])])
	print(" --- debug -- running op "+func+" with "+v1[1]+" and "+v2[1]+" res "+func(v1[1],v2[1]))
	return p+1
    }
}

INST[0x61]=INST[0x60]=INST[0x62]=INST[0x63]=iop(function(a,b){return a+b})//{ilfd}add
INST[0x64]=INST[0x65]=INST[0x66]=INST[0x67]=iop(function(a,b){return a-b})//{ilfd}sub
INST[0x68]=INST[0x69]=INST[0x6a]=INST[0x6b]=iop(function(a,b){return a*b})//{ilfd}mul
INST[0x6c]=INST[0x6d]=INST[0x6e]=INST[0x6f]=iop(function(a,b){return a/b})//{ilfd}div

INST[0x84] = function(c, p, s, cls, l) {
    var idx = c[p+1]
    var val = c[p+2]
    l[idx][1] += val
    return p+3
}


INST[0xa7] = function(c, p, s, cls, l) { // goto
    print(" --- debug -- bytes "+c[p+1]+" and "+c[p+2]+"")
    var off = signed((c[p+1] << 8) + c[p+2])
    print(" --- debug -- offset "+off)
    return off + p+1
}

INST[0xb2] = function(c,p,s,cls,l) { // getstatic
    var idx = (c[p+1] << 8) + c[p+2]
    var fref = cls.constants[idx]
    var ncls = fref[1]
    var nt = fref[2]
    if (CLASSES[ncls]) { // our class
	assert(1 == 2) // we need to have initialized this stuff
		       // before and we're not doing it right now. FIXME
    } else {
	// a JVM class
	eval("var field = "+ncls.replace("/",".")+"."+nt[1])
	s.push(["jvmobj", field])
    }
    return p+3
}

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


INST[0x59] = function(c,p,s,cls,l) { // dup
    var t = s.pop()
    s.push(t)
    s.push(t)
    return p+1
}

INST[0x12] = function(c,p,s,cls,l) { // ldc
    var idx = c[p+1]
    s.push(cls.constants[idx])
    return p+2
}

INST[0xb5] = function(c,p,s,cls,l) { // putfield
    var val = s.pop()
    var obj = s.pop()
    var fname = cls.constants[(c[p+1] << 8) + c[p+2]][2][1]
    assert(obj[0] == "obj")
    obj[1].fields[fname] = val
    return p+3
}

INST[0xb4] = function(c,p,s,cls,l) { // getfield
    var obj = s.pop()
    var fname = cls.constants[(c[p+1] << 8) + c[p+2]][2][1]
    assert(obj[0] == "obj")
    s.push(obj[1].fields[fname])
    return p+3
}

INST[0xac] = function(c,p,s,cls,l) { // ireturn
    print(" --- debug -- returning int")
    return "ireturn"
}


INST[0xb1] = function(c,p,s,cls,l) { // return
    print(" --- debug -- returning")
    return "return"
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
	if (ret != "void")
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
		return "void"
	    } else if (res == "ireturn") {
		return stack.pop()
	    } else if (res == "throw") {
		throw "jvmException" // FIXME: use the handlers
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
	if ((m.name == "main") && (m.type == "([Ljava/lang/String;)V"))
	    return runMethod(m, cls, {variables:{}})
    }
    assert(1 == 2)
}


try {
    var b = parseClass("Hello.class")
    var c = parseClass("Test1.class")
    var d = parseClass("Test2.class")
    runClass(d)
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
