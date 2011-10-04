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



function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
    return 'AssertException: ' + this.message;
}

function assert(exp, message) {
    if (!exp) {
	throw new AssertException(message);
    }
}


function readConstant(f) {
    var tag = f.read()
    if (tag == CONSTANT_Class) {
	return ["class", readShort(f)]
    } else if (tag == CONSTANT_Fieldref) {
	return ["fref", readShort(f), readShort(f)]
    } else if (tag == CONSTANT_Methodref) {
	return ["mref", readShort(f), readShort(f)]
    } else if (tag == CONSTANT_InterfaceMethodref) {
	return ["imref", readShort(f), readShort(f)]
    } else if (tag == CONSTANT_String) {
	return ["string", readShort(f)]
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
    
}

function parseClass(fname) {
    var f = new java.io.RandomAccessFile(fname, "r")
    assert(f.readInt() == 0xcafebabe)
    f.readInt() // ignore the version of the format
    var cpcount = readShort(f)
    var constants = [0] // to make indexing start at 1
    for(var i = 1; i < cpcount; ++i) {
	constants.push(readConstant(f))
    }
    validateConstants(constants)
    
    
}