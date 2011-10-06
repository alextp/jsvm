//vijay was here

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




function assert(exp, message) {
    if (!exp) {
	var f = new java.lang.Throwable()
	f.printStackTrace()
	throw "help!"
    }
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
	    clist[i][1] = clist[clist[i][1]][1] // directly associating a class with its name
	} else if ((tag == "fref") || (tag == "mref") || (tag == "imref")) {
	    assert(clist[clist[i][1]][0] == "class")
	    clist[i][1] = clist[clist[i][1]][1]
	    assert(clist[clist[i][2]][0] == "nt")
	} else if (tag == "string") {
	    assert(clist[clist[i][1]][0] =="utf")
	    clist[i][1] = clist[clist[i][1]][1]
	} else if (tag == "nt") {
	    assert(clist[clist[i][1]][0] == "utf")
	    clist[i][1] = clist[clist[i][1]][1]
	    assert(clist[clist[i][2]][0] == "utf")
	    clist[i][2] = clist[clist[i][2]][1]
	}
    }
    for (var i = 1; i < clist.length; ++i) {
	var tag = clist[i][0]
	//if (tag == "fref")
	//    validateTypeName(clist[i][1])
	//else if ((tag == "mref") || (tag == "imref"))
	//    validateMethodName(clist[i][1])  // TODO: fix this validation
    }
}

var typere = /(\[)*(([BCDFIJSZ])|(L[A-Za-z0-9\/]+;))/  ///sdfsdf
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

function readMethods(f, mcount, constants) {
    var ms = []
    for (var i = 0; i < mcount; ++i) {
	var flags = f.readShort()
	var mname = constants[f.readShort()][1]
	var type = constants[f.readShort()][1]
	var acount = f.readShort()
	var code = null
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
		core = bcode
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
	    type: type,
	    nlocals: nlocals,
	    code: code,
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
    var methods = readMethods(f, mcount, constants)
    ignoreAttributes(f)
    java.lang.System.out.println("Read class: "+ths+" super "+supr+" ifaces "+interfaces)
    for (var f=0; f < fields.length; ++f) {
	java.lang.System.out.println("  field: `"+fields[f]["name"]+"` type: `"+fields[f].descr+"`")
    }
    for (var m=0; m < methods.length; ++m) {
	java.lang.System.out.println(" method: `"+methods[m].name+"` type: `"+methods[m].type+"`")
    }
    return {
	name: ths,
	superName: supr,
	interfaces: interfaces,
	fields: fields,
	methods: methods
    }
}

var INST = []

for (var i = 0; i < 256; ++i) {
    INST[i] = function(code, position, stack, cls, global) { 
	throw "Did not implement bytecode '"+code[position].toString(16)+"'"
    }
}

function iconst(i) { function(c, p, s, cls, g) { s.push(["int", i]) }; return p+1 }

INST[0x02] = iconst(-1)
INST[0x03] = iconst(0)
INST[0x04] = iconst(1)
INST[0x05] = iconst(2)
INST[0x06] = iconst(3)
INST[0x07] = iconst(4)
INST[0x08] = iconst(5)

function istore(i) {
    function(c, p, s, cls, g) { g.variables[i] = s.pop(); return p+1 }
}

INST[0x3b] = istore(0)
INST[0x3c] = istore(1)
INST[0x3d] = istore(2)
INST[0x3e] = istore(3)

function iload(i) {
    function(c, p, s, cls, g) { s.push(g.variables[i]); return p+1 }
}

INST[0x1a] = iload(0)
INST[0x1b] = iload(1)
INST[0x1c] = iload(2)
INST[0x1d] = iload(3)
INST[0x15] = function(c,p,s,cls,g) { s.push(g.variables[c[p+1]]); return p+2} // iload

INST[0x10] = function(c,p,s,cls,g) { s.push(["int",c[p+1]]); return p+2} // bipush

function if_cmp(func) {
    function(c,p,s,cls,g) {
	var v1 = s.pop();
	var v2 = s.pop();
	if (func(v1,v2)) {
	    return p + ((c[p+1] << 8) + c[p+2]) // make sure this is a relative offset
	} else {
	    return p+3
	}
    }
}

INST[0xa5] = if_cmp(function(v1,v2){ v1[1] === v2[1] }) // if_acmpeq
INST[0xa6] = if_cmp(function(v1,v2){ !(v1[1] === v2[1]) }) // if_acmpne
INST[0x9f] = if_cmp(function(v1,v2){ v1[1] == v2[1] } ) // if_icmpeq
INST[0xa0] = if_cmp(function(v1,v2){ !(v1[1] == v2[1]) } ) // if_icmpne
INST[0xa1] = if_cmp(function(v1,v2){ v1[1] < v2[1] } ) // if_icmplt
INST[0xa2] = if_cmp(function(v1,v2){ v1[1] >= v2[1] } ) // if_icmpge
INST[0xa3] = if_cmp(function(v1,v2){ v1[1] > v2[1] } ) // if_icmpgt
INST[0xa4] = if_cmp(function(v1,v2){ v1[1] <= v2[1] } ) // if_icmple

function if_eq(func) {
    function(c, p, s, cls, g) {
	var v = s.pop();
	if (func(v)) {
	    return p+((c[p+1] << 8) + c[p+2])
	} else {
	    return p+3
	}
    }
}

INST[0x99] = if_eq(function(v) { v[1] == 0 }) // ifeq
INST[0x9a] = if_eq(function(v) { v[1] != 0 }) // ifne
INST[0x9b] = if_eq(function(v) { v[1] < 0 }) // iflt
INST[0x9c] = if_eq(function(v) { v[1] >= 0 }) // ifge
INST[0x9d] = if_eq(function(v) { v[1] > 0 }) // ifgt
INST[0x9e] = if_eq(function(v) { v[1] <= 0 }) // ifle
INST[0xc7] = if_eq(function(v) { v[1] != null }) // ifnonnull
INST[0xc6] = if_eq(function(v) { v[1] == null}) // ifnull

function iop(func) {
    function(c, p, s, cls, g) {
	var v1 = s.pop()
	var v2 = s.pop()
	s.push(func(v1, v2))
	return p+1
    }
}

INST[0x68] = iop(function(a,b) { a*b}) // imul
// TODO: add other integer ops



function runMethod(method, cls, global) {
    var stack = []
    var code = method.code
    var ip = 0
    while (1) {
	var res = INST[code[ip]](code, ip, stack, cls, global)
	if (res == "return") {
	    return stack.pop()
	} else if (res == "throw") {
	    throw "jvmException" // FIXME: use the handlers
	} else {
	    ip = res
	}
    }
}

function runClass(cls, global) {
    // to run a class we need to find the public method Main with type
    //   ([Ljava/lang/String;)V
    // and run it
    for (var m = 0; m < cls.methods.length; ++m) {
	if ((m.name == "Main") && (m.type == "([Ljava/lang/String;)V"))
	    return runMethod(m, cls, global)
    }
    assert(1 == 2)
}


try {
    parseClass("Model.class")
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
