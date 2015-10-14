exports.createAdjMatrix = function(){
    return new AdjMatrix();
}

var Matrix = require('../../Matrix/matrix.js');

AdjMatrix = function(){
	this.matrix = Matrix.CreateMatrix(0,0);
}

AdjMatrix.prototype.AddVertex = function(){
	this.matrix.Embed(this.matrix.dimM + 1, this.matrix.dimN + 1);
}

AdjMatrix.prototype.RemoveVertex = function(vertexIdx){
	var toEdges = [];
	for(var i = 0; i < this.matrix.dimM; i++){
		toEdges.push(this.matrix.values[i][vertexIdx]);
	}
	var fromEdges = [];
	for(var i = 0; i < this.matrix.dimN; i++){
		fromEdges.push(this.matrix.values[vertexIdx][i]);
	}
	
	this.matrix.SubMatrix(vertexIdx, vertexIdx);
	
	return {to: toEdges, from: fromEdges};
}

AdjMatrix.prototype.AddEdge = function(from, to, edgeIdx, isDirected){
	this.matrix.values[from][to] = edgeIdx;
}

AdjMatrix.prototype.RemoveEdge = function(from, to){
	if(arguments.length == 2 && from != null && to != null){
		var removedEdges = this.matrix.values[from][to] ;
		this.matrix.values[from][to] = 0;
		return removedEdges;
	}

	return null;
}


AdjMatrix.prototype.GetEdge = function(from, to){
   var f = from.idx != undefined ? from.idx : from;
   var t = to.idx != undefined ? to.idx : to;
    return this.matrix.values[f][t];
}

AdjMatrix.prototype.GetAdjacentEdges = function(from){

    var edges = [];

    for(var i = 0; i < this.matrix.dimM; i++){
        if(this.matrix.values[from][i] != 0){
            edges.push(this.matrix.values[from][i]);
        }
    }

    return edges;
}


AdjMatrix.prototype.Count = function(){
    return this.matrix.dimM;
}