/**
 * @author stierm
 */
var Matrix = require('../Matrix/matrix.js');
var SplayTree = require('../Tree/SplayTree.js')

function Graph(){
	this.vertexCollection = [];
	this.edgeGroups = SplayTree.CreateSplayTree();
	this.adjMatrix = new Graph.AdjMatrix();
	this.edgeMasterIdx = 1;
}

Graph.prototype.isDirected = true;
Graph.prototype.edgeMasterIdx = 1;

Graph.prototype.AddVertex = function(data){
	var vertex = new Graph.Vertex(data)
	this.vertexCollection.push(vertex);
	this.adjMatrix.AddVertex();
	vertex.idx = this.adjMatrix.matrix.dimM - 1;
	return vertex;
}

Graph.prototype.RemoveVertex = function(idx){
	this.vertexCollection.splice(idx, 1);
	var edges = this.adjMatrix.RemoveVertex(idx);
	for(var i = 0; i < this.vertexCollection.length; i++){
		if(i != this.vertexCollection[i].idx){
			this.vertexCollection[i].idx = i;
		}
	}
	for(var i = 0; i < edges.fromEdges; i++){
		this.edgeGroups.remove(edges.fromEdges[i]);
	}
	for(var i = 0; i < edges.toEdges; i++){
		this.edgeGroups.remove(edges.toEdges[i]);
	}
}

Graph.prototype.AddEdge = function(from, to, data){


	var ftVert = this._FromToVerts(from, to);
	var fromVert = ftVert.fromVert;
	var toVert = ftVert.toVert;
	    var index = this.adjMatrix.matrix.values[fromVert.idx][toVert.idx];
    if(index == 0){
    var edgeIdx = this.edgeMasterIdx;

    this.edgeMasterIdx++;
    this.edgeGroups.insert(edgeIdx, [new Graph.Edge(fromVert, toVert,data)]);

   	this.adjMatrix.AddEdge(fromVert.idx, toVert.idx, edgeIdx);
   	index = edgeIdx;
   	
   	} else {

   		this.edgeGroups.find(index).value.push(new Graph.Edge(fromVert, toVert,data));
   		
   	}
   	return index;
}

Graph.prototype.RemoveEdgeGroup = function(edgeIdx){
	var edgeGroup = this.edgeGroups.find(edgeIdx).value;
	if(edgeGroup.length != 0){
		this.adjMatrix.RemoveEdge(edgeGroup[0].from.idx, edgeGroup[0].to.idx);
	}
	return edgeGroup;
}

Graph.prototype.AdjacentVerticies = function(vertexIdx){
	var adjVerts = [];

	for(var i = 0; i < this.adjMatrix.matrix.dimM; i++){
		if(this.adjMatrix.matrix.values[vertexIdx][i] != 0){
			adjVerts.push(this.vertexCollection[i]);
		}
	}
	
	return adjVerts;
}

Graph.prototype.IsConnected = function(from, to){
	var DisjointSetMod = require('../Set/DisjointSet.js');
	var ftVerts = this._FromToVerts(from, to);
	var fromVert = ftVerts.fromVert;
	var toVert = ftVerts.toVert;
	
	var elements = require('../Tree/SplayTree.js').CreateSplayTree();
	
	this.vertexCollection.forEach(function(vertex){
		elements.insert(vertex.idx, DisjointSetMod.CreateElement(vertex.idx));
	})
	
	var connected = DisjointSetMod.CreateDisjointSet(elements.retrieveValue(fromVert.idx));
	var connectedArr = this.AdjacentVerticies(fromVert.idx);
	while(connectedArr.length != 0){
		var popped = connectedArr.pop();
		if(!connected.IsInSet(elements.retrieveValue(popped.idx))){
			var adjacent = this.AdjacentVerticies(popped.idx);

			for(var i = 0; i < adjacent.length; i++){
				if(adjacent[i].idx == toVert.idx){
					return true;
				}
				
				if(!connected.IsInSet(elements.retrieveValue(adjacent[i].idx))){
					connectedArr.push(adjacent[i]);
				}
			}
			connected.AddElement(elements.retrieveValue(popped.idx));
		}
	}
	
	return false;
}

Graph.prototype.IsAdjacent = function(from, to){
	var ftVert = this._FromToVerts(from, to);
	var fromVert = ftVert.fromVert;
	var toVert = ft.Vert.toVert;
	return this.adjMatrix.matrix.values[fromVert.idx][toVert.idx] != 0;
}

Graph.prototype.SubGraph = function(allowedVerts, deniedVerts){
	var graph = this.Clone();
	
	var allowVerts = null;
	if(allowedVerts){
		allowVerts = graph._GetVerts(allowedVerts);
		for(var i = 0; i < graph.vertexCollection.length; i++){
			var found = false;
			for(var j = 0; j < allowVerts.length; j++){
				if(allowVerts[j].idx == graph.vertexCollection[i].idx){
					found = true;
				}
			}
			if(!found){
				graph.RemoveVertex(graph.vertexCollection[i].idx);
				i--;
			}
		}
	}
	
	var denyVerts = null;
	if(deniedVerts){
		denyVerts = graph._GetVerts(deniedVerts);
		for(var i = 0; i < graph.vertexCollection.length; i++){
			var found = false;
			for(var j = 0; j < denyVerts.length; j++){
				if(denyVerts[j].idx == graph.vertexCollection[i].idx){
					found = true;
				}
			}
			if(found){
				graph.RemoveVertex(graph.vertexCollection[i]);
				i--;
			}
		}
	}
	
	return graph;
}

Graph.prototype.AddGraph = function(graph){
	var newVerts = require('../Tree/SplayTree.js').CreateSplayTree();
	for(var i = 0; i < graph.vertexCollection.length; i++){
		var vert = this.AddVertex(graph.vertexCollection[i].data);
		newVerts.insert(i, vert);
	}
	for(var i = 0; i < graph.vertexCollection.length; i++){
		for(var j = 0; j < graph.vertexCollection.length; j++){
			var edgeIdx = graph.adjMatrix.matrix.values[i][j];
			if(edgeIdx != 0){
				var edges = graph.edgeGroups.retrieveValue(edgeIdx);
				for(var k = 0; k < edges.length; k++){
					this.AddEdge(newVerts.retrieveValue(edges[k].from.idx).idx, newVerts.retrieveValue(edges[k].to.idx).idx, edges[k].data);
				}
			}
		}
	}
}

Graph.prototype.Clone = function(){
	var graph = new Graph();
	this.vertexCollection.forEach(function(vert){
		graph.AddVertex(vert.data);
	});

	var keys = this.edgeGroups.exportKeys();
	var t = this;
	keys.forEach(function(edgeKey){
		var edgeGroup = t.edgeGroups.retrieveValue(edgeKey);
		edgeGroup.forEach(function(edge){

			graph.AddEdge(edge.from, edge.to, edge.data);
		});
	})
	
	return graph;
}

Graph.prototype.CloneWithoutEdges = function(){
	var graph = new Graph();
	this.vertexCollection.forEach(function(vert){
		graph.AddVertex(vert.data);
	});
	
	return graph;
}

Graph.prototype._FromToVerts = function(from, to){
	var fromVert = null;
	if(typeof(from) == 'number'){
		fromVert = this.vertexCollection[from];
	}else{
		fromVert = from;
	}
	var toVert = null;
	if(typeof(to) == 'number'){
		toVert = this.vertexCollection[to];
		
	} else {
		toVert = to;
	}
	if(fromVert == null || fromVert == undefined){
		throw Error("From Vertex was not found in the VertexCollection: " + from);
	}
	if(toVert == null || toVert == undefined){
		throw Error("To Vertex was not found in the VertexCollection: " + to);
	}
	
	return {fromVert: fromVert, toVert: toVert};
}

Graph.prototype._GetVerts = function(vertArr){
	var verts = [];
	for(var i = 0; i < vertArr.length; i++){
		if(typeof(vertArr[i]) == 'number'){
			verts.push(this.vertexCollection[vertArr[i]]);
		} else{
			verts.push(this.vertexCollection[vertArr[i].idx]);
		}
		if(verts[verts.length - 1] == null || verts[verts.length - 1]  == undefined){
			throw Error("Vertex was not found in the VertexCollection: " + verts.length - 1);
		}
	}
	
	return verts;
}

Graph.prototype.GetMST = function(from, to){
	var ftVerts = this._FromToVerts(from, to);
	var fromVert = ftVerts.fromVert;
	var toVert = ft.toVerts;
	
	var edgeQueue = require('../Tree/SplayTree.js').CreateSplayTree();
	var graph = this.CloneWithoutEdges();
	
	graph.edgeGroups.exportKeys
	for(var i = 0; i < this.vertexCollection; i++){

	}
	
}


Graph.prototype.TraverseDepthFirst = function(start, f){
	var startVert = null;
	if(typeof(start) == number){
		startVert = this.vertexCollection[start];
	} else {
		startVert = start;
	}
	
	var stack = [];
	stack.push(start);
	while(stack.length != 0){
		var vert = stack.pop();
		if(f(start, vert)){
			return;
		}
		var neighbors = this.AdjacentVerticies(vert);
		for(var i = 0; i < neighbors.length; i++){
			stack.push(neighbors[i]);
		}
	}
	
}

Graph.prototype.TraverseBreadthFirst = function(start, f){
	var startVert = null;
	if(typeof(start) == number){
		startVert = this.vertexCollection[start];
	} else {
		startVert = start;
	}
	
	var queue = [];
	queue.push(start);
	while(queue.length != 0){
		var vert = queue.shift();
		if(f(start, vert)){
			return;
		}
		var neighbors = this.AdjacentVerticies(vert);
		for(var i = 0; i < neighbors.length; i++){
			queue.push(neighbors[i]);
		}
	}
	
}

/**
*
*/
Graph.prototype.CliqueOut = function(){
	for(var i = 0; i < this.adjMatrix.matrix.dimM; i++){
		for(var j = 0; j < this.adjMatrix.matrix.dimN; j++){
			if(i != j && this.adjMatrix.matrix.values[i][j] == 0){
				this.AddEdge(i,j,null);
			}
		}
	}
}

exports.CreateGraph = function(){
	return new Graph();
}

Graph.Vertex = function(data){
	this.data = data;
	this.idx = -1;
}

Graph.Vertex.prototype.data = null;
Graph.Vertex.prototype.idx = -1
Graph.Vertex.prototype.color = null;

Graph.Edge = function(from, to, data){
	this.from = from;
	this.to = to;
	this.data  = data;
}

Graph.Edge.prototype.from = null;
Graph.Edge.prototype.to = null;
Graph.Edge.prototype.data = null;

Graph.AdjMatrix = function(){
	this.matrix = Matrix.CreateMatrix(0,0);
}

Graph.AdjMatrix.prototype.matrix = Matrix.CreateMatrix(0,0);
Graph.AdjMatrix.prototype.AddVertex = function(){
	this.matrix.Embed(this.matrix.dimM + 1, this.matrix.dimN + 1);
}

Graph.AdjMatrix.prototype.RemoveVertex = function(vertexIdx){
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

Graph.AdjMatrix.prototype.AddEdge = function(from, to, edgeIdx, isDirected){
	this.matrix.values[from][to] = edgeIdx;
}

Graph.AdjMatrix.prototype.RemoveEdge = function(from, to){
	if(arguments.length == 2 && from != null && to != null){
		var removedEdges = this.matrix.values[from][to] ;
		this.matrix.values[from][to] = 0;
		return removedEdges;
	}
	if(arguments.length == 1){
		var edgeIdx = from 
		for(var i = 0; i< this.matrix.dimM; i++){
			for(var j = 0; j < this.matrix.dimN; j++){
					if(this.matrix.values[i][j] == edgeIdx){
						this.matrix.values[i][j] = 0;
						return edgeIdx
					}
				
			}
		}
		return null;
	}

	return null;
}

Graph.prototype.vertexCollection = [];
Graph.prototype.edgeGroups = SplayTree.CreateSplayTree();
Graph.prototype.adjMatrix = new Graph.AdjMatrix();
