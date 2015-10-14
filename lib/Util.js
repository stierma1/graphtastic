/**
 * @author stierm
 */

exports.DeepCopy = function(proto, JSONval){
	return Object.create(proto, objectTraverse(JSONval));
}

function objectTraverse(obj){
	if(typeOf(obj) != "Object" && typeOf(obj) != "Array"){
		return obj;
	}
	if(typeOf(obj) == "Object"){
		var properties = {};
		for(var prop in obj){
			properties[prop] = {value: objectTraverse(obj[prop]), writable: true, enumerable: true, configurable: true}
		}
		return properties
	} else {
		var ret = [];
		for(var idx in obj){
			ret.push(objectTraverse(obj[idx]));
		}
		return ret
	}
	
}
