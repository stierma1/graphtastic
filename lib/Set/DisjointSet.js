/**
 * @author stierm
 */

exports.CreateElement = function(key){
	return new DisjointSet.Element(key);
}

exports.CreateDisjointSet = function(element){
	return new DisjointSet(element);
}

exports.Union = function(disjointSet1, disjointSet2){
	return DisjointSet.Union(disjointSet1, disjointSet2);
}

function DisjointSet(element){
	if(element == null){
		throw Error("DisjointSet must have an element upon creation");
	}
	this.representative = element;
	this.size++;
}


DisjointSet.prototype.representative = null;
DisjointSet.prototype.size = 0;
DisjointSet.prototype.AddElement = function(element){
	element.representative = this.representative;
	this.size++;
}

DisjointSet.prototype.IsInSet = function(element){
	return this.representative.key == element.GetTopRepresentative().key;
}

/**
 * Union of 2 Disjoints Sets.  This will invalidate both sets after it is called.
 * 
 * @param {DisjointSet} disjointSet1 
 * @param {DisjointSet} disjointSet2
 * @return {DisjointSet} DisjointSet that is the merger union of both Sets
 */
DisjointSet.Union = function(disjointSet1, disjointSet2){
	if(disjointSet1.size > disjointSet2){
		disjointSet1.size += disjointSet2.size;
		disjointSet2.representative.representative = disjointSet1.representative;
		return disjointSet1;
	} else {
		disjointSet2.size += disjointSet1.size;
		disjointSet1.representative.representative = disjointSet2.representative;
		return disjointSet2;
	}
}

DisjointSet.Element = function(key){
	this.key = key;
}

DisjointSet.Element.prototype.key = null;
DisjointSet.Element.prototype.representative = null;

function GetTopRepresentative(ele){
	if(ele.representative == null){
		return ele;
	} else {
		ele.representative = GetTopRepresentative(ele.representative);
		return ele.representative;
	}
}

DisjointSet.Element.prototype.GetTopRepresentative = function(){
	return GetTopRepresentative(this);
}

/**
 * @param {DisjointSet.Element} ele1 
 * @param {DisjointSet.Element} ele2
 * @return {boolean} returns whether or not both elements are in the same set
 */
DisjointSet.Element.prototype.IsInSameSet = function(ele1, ele2){
	return ele1.GetTopRepresentative().key == ele2.GetTopRepresentative().key;
}
