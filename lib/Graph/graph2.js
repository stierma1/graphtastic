
/**
 * @author stierm
 */

/**
*   Parameter function
*   @name selectorFunc
*   @function
*   @param {Array<Graph.Edge>} edgeGroup The EdgeGroup that needs an edge selected from
*   @returns {Graph.Edge}  The selected edge;
*/

var Matrix = require('../Matrix/matrix.js');
var SplayTree = require('../Tree/SplayTree.js');
var AdjList = require('./Graphables/adjList.js');
var AdjMatrix = require('./Graphables/adjMatrix.js');
var DisjointSetMod = require('../Set/DisjointSet.js');

function versionInc(versionString){
    var parse = versionString.split('.');
    var newStr = "";
    for(var i = 0; i < parse.length - 1; i++){
        newStr += parse[i] + '.';
    }
    newStr += parseInt(parse[parse.length - 1]) + 1;
    return newStr;
}

/**
 * Creates a new Graph.
 * @constructor
 * @param {string} [version]=0 Version number of the branch of origin
 * @param {boolean} [matrix=false] Use adjaceny matrix as underlying index
 */
function Graph(version, matrix){
    this.vertexLabels = {};
	this.vertexCollection = [];
    if(version){
        this.version = version + '.0';
    } else{
        this.version = "0";
    }
	this.edgeGroups = {};
	this.graphable = matrix ? new AdjMatrix.createAdjMatrix() : new AdjList.createAdjList();
	this.edgeMasterIdx = 1;
}

Graph.prototype.isDirected = true;
Graph.prototype.edgeMasterIdx = 1;

/**
*  Add a Vertex to the Graph
* @param {string} [label] Unique label of the vertex
* @param {Object.<string, *>} [data] Satelite data attached to the vertex
*/
Graph.prototype.AddVertex = function(label, data){
    if(label){
        if(this.vertexLabels[label]){
            throw new Error("Cannot have duplicate labels: " + label);
        }
    }
	var vertex = new Graph.Vertex(label, data)
    if(label){
        this.vertexLabels[label] = vertex;
    }
	this.vertexCollection.push(vertex);
	this.graphable.AddVertex();
	vertex.idx = this.graphable.Count() - 1
	return vertex;
}

/**
*  Try adding a Vertex to the Graph
* @param {string} [label] Unique label of the vertex
* @param {Object.<string, *>} [data] Satelite data attached to the vertex
* @returns {boolean} indicates if new vertex was created
*/
Graph.prototype.tryAddVertex = function(label, data){
    if(label){
        if(this.vertexLabels[label]){
            //throw new Error("Cannot have duplicate labels: " + label);
            return false;
        }
    }
	var vertex = new Graph.Vertex(label, data)
    if(label){
        this.vertexLabels[label] = vertex;
    }
	this.vertexCollection.push(vertex);
	this.graphable.AddVertex();
	vertex.idx = this.graphable.Count() - 1
	return true;
}

/**
*   Remove Vertex from the Graph
*   @param {string|number|Graph.Vertex} vert The vertex identifier
*/
Graph.prototype.RemoveVertex = function(vert){
    var vertex = this.GetVertex(vert);
    var idx = vertex.idx;
    if(this.vertexCollection[idx].label){
        delete this.vertexLabels[this.vertexCollection[idx].label];
    }
	this.vertexCollection.splice(idx, 1);
	var edges = this.graphable.RemoveVertex(idx);

	for(var i = 0; i < this.vertexCollection.length; i++){
		if(idx < this.vertexCollection[i].idx){
			this.vertexCollection[i].idx = this.vertexCollection[i].idx - 1;
		}
	}
	for(var i = 0; i < edges.from.length; i++){
		delete this.edgeGroups[parseInt(edges.from[i])];
	}
	for(var i = 0; i < edges.to.length; i++){
		delete this.edgeGroups[parseInt(edges.to[i])];
	}
}

/**
* Add Edge to the Graph
*  @param {string|number|Graph.Vertex} from From vertex identifier
*  @param {string|number|Graph.Vertex} to To vertex identifier
*  @param {*} [data] Satelite Data attached to the edge
*/
Graph.prototype.AddEdge = function(from, to, data){

	var fromVert = this.GetVertex(from);
	var toVert = this.GetVertex(to);
	    var index = this.graphable.GetEdge(fromVert.idx, toVert.idx);
    if(index == 0){
        var edgeIdx = this.edgeMasterIdx;

        this.edgeMasterIdx++;
        this.edgeGroups[edgeIdx.toString()] = [new Graph.Edge(fromVert, toVert,data)];

   	    this.graphable.AddEdge(fromVert.idx, toVert.idx, edgeIdx);
   	    index = edgeIdx;

   	} else {

   		this.edgeGroups[index.toString()].push(new Graph.Edge(fromVert, toVert,data));

   	}
   	return index;
}

/**
* Delete EdgeGroup on the Graph
*  @param {string|number|Graph.Vertex} from From vertex identifier
*  @param {string|number|Graph.Vertex} to To vertex identifier
*/
Graph.prototype.DeleteEdgeGroup = function(from, to){
    var from = this.GetVertex(from);
    var to = this.GetVertex(to);
    var edgeIdx = this.graphable.GetEdge(from.idx, to.idx);
    this.graphable.RemoveEdge(from.idx, to.idx);
    delete this.edgeGroups[edgeIdx];
}


/**
* Delete EdgeGroup on the Graph
*  @param {number} edgeIdx Delete Edge Group by edge Idx
*
*/
Graph.prototype.RemoveEdgeGroup = function(edgeIdx){
	var edgeGroup = this.edgeGroups[edgeIdx.toString()];
	if(edgeGroup){
		this.graphable.RemoveEdge(edgeGroup[0].from.idx, edgeGroup[0].to.idx);
	}
    delete this.edgeGroups[edgeIdx.toString()]
	return edgeGroup;
}

/**
*  Get the Verticies Adjacent to the given vertex
*  @param {string|number|Graph.Vertex} vertexId To vertex identifier
*  @param {selectorFunc} [selectorFunc]
*  @returns {Array.<Graph.Vertex>} Adjancent Verticies
*/
Graph.prototype.AdjacentVerticies = function(vertexId, selectorFunc){
    var vertex = this.GetVertex(vertexId);
    var vertexIdx = vertex.idx;
	var adjVerts = [];
    var edges = this.graphable.GetAdjacentEdges(vertexIdx);

    if(selectorFunc){

    } else {
        var selectorFunc = function(group){
            return group[0];
        }
    }

	for(var i = 0; i < edges.length; i++){
        var edge = edges[i]

        var selectedEdge = selectorFunc(this.edgeGroups[edges[i].toString()]);
        if(selectedEdge){
            adjVerts.push(this.vertexCollection[selectedEdge.to.idx]);
        }

	}

	return adjVerts;
}

Graph.prototype.IsConnected = function(from, to){
	var fromVert = this.GetVertex(from);
	var toVert = this.GetVertex(to);

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
/**
*  Whether 2 verticies are adjacent to each other
*  @param {string|number|Graph.Vertex} from From vertex identifier
*  @param {string|number|Graph.Vertex} to To vertex identifier
*  @param {selectorFunc} [selectorFunc]
*  @returns {boolean}
*/
Graph.prototype.IsAdjacent = function(from, to, selectorFunc){
	var fromVert = this.GetVertex(from);
	var toVert = this.GetVertex(to);
	return this.graphable.GetEdge(fromVert.idx,toVert.idx) != 0;
}

/**
* Gets a sub graph
* @param {Array.<string|number|Graph.Vertex>} allowedVerts Verticies allowed to be in the Sub Graph
* @param {Array.<string|number|Graph.Vertex>} deniedVerts Verticies not allowed to be in the Sub Graph
* @returns {Graph} Shallowly Cloned Sub Graph of this graph
*/
Graph.prototype.SubGraph = function(allowedVerts, deniedVerts){


	var allowVerts = null;
	if(allowedVerts){
        this.version = versionInc(this.version);
		var graph = new Graph(this.version);

        allowVerts = this._GetVerts(allowedVerts);
        var map = {};
        for(var i in allowVerts){
            map[allowVerts[i].idx] =  graph.AddVertex(allowVerts[i].label ? this.version  + ','  + allowVerts[i].label  : undefined, allowVerts[i].data);
        }
        for(var i in allowedVerts){
            for(var j in allowedVerts){
                if(parseInt(i) < parseInt(j)){
                    var edge = this.GetEdgeGroup(allowVerts[i], allowVerts[j]);
                    if(edge != null){
                        for(var k in edge){
                            graph.AddEdge(map[edge[k].from.idx], map[edge[k].to.idx], k.data)
                        }
                    }
                    edge = this.GetEdgeGroup(allowVerts[j], allowVerts[i]);
                    if(edge != null){
                        for(var k in edge){
                            graph.AddEdge(map[edge[k].from.idx], map[edge[k].to.idx], k.data)
                        }
                    }
                }
            }
        }

        /*
		for(var i = 0; i < graph.vertexCollection.length; i++){
			var found = false;
			for(var j = 0; j < allowVerts.length; j++){
				if(allowVerts[j].idx == graph.vertexCollection[i].idx){
					found = true;
                    break;
				}
			}
			if(!found){

				graph.RemoveVertex(graph.vertexCollection[i].idx);
				i--;
			}
		}*/
	}

	var denyVerts = null;
	if(deniedVerts){
        if(graph){

        } else {
            var graph = this.Clone();
        }
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

/**
* Add an existing graph to the current graph shallow clones of vertecies and edges
* @param {Graph} graph Graph to be added
*/
Graph.prototype.AddGraph = function(graph){
	var newVerts = require('../Tree/SplayTree.js').CreateSplayTree();
	for(var i = 0; i < graph.vertexCollection.length; i++){
		var vert = this.AddVertex(graph.vertexCollection[i].label ?  this.version  + ','  + graph.vertexCollection[i].label : undefined, graph.vertexCollection[i].data);
		newVerts.insert(i, vert);
	}
	for(var i = 0; i < graph.vertexCollection.length; i++){
		for(var j = 0; j < graph.vertexCollection.length; j++){
			var edgeIdx = graph.graphable.GetEdge(i, j);
			if(edgeIdx != 0){
				var edges = graph.edgeGroups[edgeIdx];
				for(var k = 0; k < edges.length; k++){
					this.AddEdge(newVerts.retrieveValue(edges[k].from.idx).idx, newVerts.retrieveValue(edges[k].to.idx).idx, edges[k].data);
				}
			}
		}
	}
}

/**
* Shallow clone of the graph with shallow clones of verticies and edges
* @params {Function(<Graph.Edge>)} [edgeFilter] will filter the edges by executing this decision funcition.
* @returns {Graph} Shallow clone
*/
Graph.prototype.Clone = function(edgeFilter){
    this.version = versionInc(this.version);
	var graph = new Graph(this.version);

    var map = {};
	this.vertexCollection.forEach(function(vert){
		map[vert.idx] = graph.AddVertex(vert.label ? this.version  + ','  +  vert.label : undefined, vert.data);
	});

	var keys = []//this.edgeGroups.exportKeys();
    for(var i in this.edgeGroups){
        keys.push(i.toString());
    }
	var t = this;
	keys.forEach(function(edgeKey){
		var edgeGroup = t.edgeGroups[edgeKey];
		edgeGroup.forEach(function(edge){
            if(edgeFilter){
                if(edgeFilter(edge)){
                    graph.AddEdge(map[edge.from.idx], map[edge.to.idx], edge.data);
                }
            } else {
                graph.AddEdge(map[edge.from.idx], map[edge.to.idx], edge.data);
            }

		});
	})

	return graph;
}

/**
* Shallow clone of the graph with the same verticies but no edges
* @returns {Graph} Clone of the graph with shallow copies of verticies.
*/
Graph.prototype.CloneWithoutEdges = function(){
    this.version = versionInc(this.version);
	var graph = new Graph(this.version);
	this.vertexCollection.forEach(function(vert){
		graph.AddVertex(vert.label ? this.version  + ','  + vert.label : undefined, vert.data);
	});

	return graph;
}

/**
* Get a vertex based on one of its keys
* @param {string|number|Graph.Vertex} vert One of the keys to fetch the vertex by.
* @returns {Graph.Vertex} The vertex with the unique key.
*/
Graph.prototype.GetVertex = function(vert){
    var vertex = null;
    var vertType = typeof(vert) ;
	if(vertType == 'number'){
		vertex = this.vertexCollection[vert];
	} else if(vertType == 'string'){
        vertex = this.vertexLabels[vert];
    } else{
		vertex = vert;
	}

    if(vertex == null || vertex == undefined){
		throw Error("From Vertex was not found in the VertexCollection: " + vert);
	}

    return vertex;
}

/**
* Try get a vertex based on one of its keys
* @param {string|number|Graph.Vertex} vert One of the keys to fetch the vertex by.
* @returns {Graph.Vertex} The vertex with the unique key.
*/
Graph.prototype.tryGetVertex = function(vert){
    var vertex = null;
    var vertType = typeof(vert) ;
	if(vertType == 'number'){
		vertex = this.vertexCollection[vert];
	} else if(vertType == 'string'){
        vertex = this.vertexLabels[vert];
    } else{
		vertex = vert;
	}

  if(vertex == null || vertex == undefined){
  		return null;
	}

    return vertex;
}

Graph.prototype._GetVerts = function(vertArr){
	var verts = [];
	for(var i = 0; i < vertArr.length; i++){
		if(typeof(vertArr[i]) == 'number'){
			verts.push(this.vertexCollection[vertArr[i]]);
		} else if(typeof(vertArr[i]) == 'string'){
            verts.push(this.vertexLabels[vertArr[i]]);
        }  else{
			verts.push(this.vertexCollection[vertArr[i].idx]);
		}
		if(verts[verts.length - 1] == null || verts[verts.length - 1]  == undefined){
			throw Error("Vertex was not found in the VertexCollection: " + verts.length - 1);
		}
	}

	return verts;
}

/**
* Gets the Edge Group associated with the from and to verticies
*  @param {string|number|Graph.Vertex} from From vertex identifier
*  @param {string|number|Graph.Vertex} to To vertex identifier
*  @returns {Array.<Graph.Edge>} The edge group associated with the verticies
*/
Graph.prototype.GetEdgeGroup = function(from, to){
	var fromVert = this.GetVertex(from);
	var toVert = this.GetVertex(to);
    var edgeIdx = this.graphable.GetEdge(fromVert.idx, toVert.idx);
        if(edgeIdx == 0){
        return [];
    }

    return this.edgeGroups[edgeIdx];
}

/**
*  Gets the out edges of the given vertex
*  @param {string|number|Graph.Vertex} to To vertex identifier
*  @param {filterFunc} [filterFunc]
*  @returns {Array.<Graph.Edge>} Edges out of the givent vertex
*/
Graph.prototype.GetEdges = function(from, filterFunc){
    var fromVert = this.GetVertex(from);

    if(filterFunc){

    } else {
        filterFunc = function(group){return group};
    }
    var edges = this.graphable.GetAdjacentEdges(fromVert.idx);
    var outEdges = [];
    for(var i in edges){
        var filteredEdges = filterFunc(this.edgeGroups[edges[i]]);
        if(filteredEdges instanceof Array){
            filteredEdges.forEach(function(edge){outEdges.push(edge)});
        } else {
            outEdges.push(filteredEdges);
        }
    }

    return outEdges;
}

/**
*  Gets an Edge from the graph
*  @param {string|number|Graph.Vertex} from From vertex identifier
*  @param {string|number|Graph.Vertex} to To vertex identifier
*  @param {selectorFunc} [selectorFunc]
*  @returns {Graph.Edge} Edge from 'from' to 'to' and passed selector
*/
Graph.prototype.GetEdge = function(from, to, selectorFunc){
    var edgeGroup = this.GetEdgeGroup(from, to);
    if(selectorFunc){
        return selectorFunc(edgeGroup);
    }
    return edgeGroup[0];
}

/**
*  Get the path between 2 verticies
* @param {string|number|Graph.Vertex} from From Vertex identifier
* @param {string|number|Graph.Vertex} to To Vertex identifier
* @param {selectorFunc} [selectorFunc]
* @returns {Array.<Graph.Edge>} The edges in sorted order of path transitions
*/
Graph.prototype.GetPath = function(from, to, selectorFunc){
	var fromVert = this.GetVertex(from);
	var toVert = this.GetVertex(to);
    var treaded = {};

    for(var i in this.vertexCollection){
        treaded[this.vertexCollection[i].idx] = false;
    }

    var pathStack = [];

    if(selectorFunc){

    } else {
        var selectorFunc = function(group){return group[0]};
    }

    this._PathBuilder(fromVert, toVert, treaded, pathStack, selectorFunc);

    return pathStack.reverse();
}

/**
*  Helper Function for Get path
* @private
* @param {string|number|Graph.Vertex} vert Current Vertex identifier
* @param {string|number|Graph.Vertex} to To Vertex identifier
* @param {Object.<number, boolean>} treaded Hash map of the previously traversed verticies number is the Graph.Vertex.idx
* @param {Array.<Graph.Edge>} pathStack Array of edges leading from the 'to' vertex to the 'from' vertex.  Filled iff path has been found.
* @param {selectorFunc} [selectorFunc]
* @returns {boolean} Whether the 'to' node has been located
*/
Graph.prototype._PathBuilder = function(vert, to, treaded, pathStack, selectorFunc){
    if(vert.idx == to.idx){
        return true;
    }
    if(treaded[vert.idx]){
        return false;
    }
    treaded[vert.idx] = true;
    var adjVerts = this.AdjacentVerticies(vert.idx, selectorFunc);
    for(var i in adjVerts){
        if(this._PathBuilder(adjVerts[i], to, treaded, pathStack, selectorFunc)){
            pathStack.push(this.GetEdge(vert, adjVerts[i], selectorFunc));
            return true;
        }
    }

    return false;
}

Graph.prototype.Dijkstra = function(from, to, comparatorFunc, selectorFunc){
    var seed = from == null ? this.vertexCollection[0] : from;
	seed = seed.idx != null ? seed.idx : seed
    if(to){
        var to = to.idx ? to : this.vertexCollection[to];
    }

	var tentativeQ = require('../Tree/SplayTree.js').CreateSplayTree();

	var graph = this.CloneWithoutEdges();
    var edges = [];
    var elements = {};
    var selectionCandidate = null;
    var vertexScores = {};

	for(var i = 0; i < this.edgeGroups.length; i++){
        if(selectorFunc){
            edges.push(selectorFunc(this.edgeGroups[i]));
        } else {
            edges.push(this.edgeGroups[i][0]);
        }
    }

    tentativeQ.insert(Infinity, {});
	for(var i = 0; i < this.vertexCollection.length; i++){
        var vert = this.vertexCollection[i];
        tentativeQ.find(Infinity).value[vert.idx.toString()] = vert;
        vertexScores[this.vertexCollection[i].idx] = {score:Infinity};
	}

    delete tentativeQ.find(Infinity).value[seed]
    var obj = {};
    obj[seed] = this.vertexCollection[seed];
    tentativeQ.insert(0, obj);
    selectionCandidate = seed;
    vertexScores[seed] = {score:0, edge:null};
    while(true){
        var adjVerticies = this.AdjacentVerticies(selectionCandidate, selectorFunc);
        for(var i in adjVerticies){
            var vertex = adjVerticies[i];
            var edge = this.GetEdgeGroup(selectionCandidate, vertex.idx)[0]
            var edgeScore = edge.data.weight

            if(vertexScores[vertex.idx].score > parseFloat(vertexScores[selectionCandidate].score) + parseFloat(edgeScore)){
                var val = tentativeQ.find(vertexScores[vertex.idx].score).value;
                delete val[vertex.idx];
                var empty = true;
                for(var i in val){
                    empty = false;
                    break;
                }
                if(empty){
                    tentativeQ.remove(vertexScores[vertex.idx].score);
                }
                var f = tentativeQ.find(vertexScores[selectionCandidate].score + edgeScore)
                if(f){
                        f.value[vertex.idx] = vertex;
                } else {
                      var obj = {};
                      obj[vertex.idx] = vertex;
                      tentativeQ.insert(vertexScores[selectionCandidate].score + edgeScore, obj);
                }
                vertexScores[vertex.idx] = {score: vertexScores[selectionCandidate].score + edgeScore, edge: edge};
            }
        }

        if(vertexScores[selectionCandidate].edge){
            edges.push(vertexScores[selectionCandidate].edge);
            if(to){
                if(selectionCandidate == to.idx){
                    break;
                }
            }
        }
        var val = tentativeQ.findMin().value;
        var key = tentativeQ.findMin().key;
        var end = false;
        for(var i in val){
            selectionCandidate = val[i].idx;
            if(key == Infinity){
                end = true;
                if(to){
                    throw new Error("There is path between from, to verticies");
                }
            }
            delete val[i];
            break;
        }

        if(end){
            break;
        }
        var empty = true;
        for(var i in val){
            empty = false;
            break;
        }
        if(empty){
            tentativeQ.remove(key);
        }
        if(tentativeQ.isEmpty()){
            edges.push(vertexScores[selectionCandidate].edge);
            break;
        }
        val = tentativeQ.findMin().value;

    }

    for(var i in edges){
        graph.AddEdge(edges[i].from, edges[i].to, edges[i].data);
    }
    return graph;
}



/**
* Topological Sort of the verticies in the graph
* @param {selectorFunc} [selectorFunc] Edge SelectorFunction
* @returns {Array.<Graph.Vertex>} Array containing the Graph verticies in a topologically sorted order
*/
Graph.prototype.TopologicalSort = function(selectorFunc){
    if(selectorFunc){

    } else {
        var selectorFunc = function(group){return group[0]};
    }


    var treaded = {};
    var topSort = [];

    for(var i in this.vertexCollection){
        treaded[this.vertexCollection[i].idx] = 0;
    }

    var visit = function(n, graph){
        if(treaded[n.idx] == 1){
            throw new Error('Cycle Found');
        } else if(treaded[n.idx] == 0) {
            treaded[n.idx] = 1;
            var adjList = graph.AdjacentVerticies(n.idx, selectorFunc);
            for(var i in adjList){
                visit(adjList[i], graph);
            }
            treaded[n.idx] = 2;
            topSort.unshift(n);
        }

    }

    for(var i in this.vertexCollection){
        if(treaded[this.vertexCollection[i].idx] == 0){
            visit(this.vertexCollection[i], this);
        }
    }

    return topSort;
}

/**
*  Checks whether the graph contains a cycle
*  @param {selectorFunc} [selectorFunc] Selector Function
*  @returns {boolean|Array.<Graph.Vertex>} Returns false if no cycle exists else will return an array of verticies in order of an existing cycle
*/
Graph.prototype.HasCycle = function(selectorFunc){
    if(selectorFunc){

    } else {
        var selectorFunc = function(group){return group[0]};
    }

    var treaded = {};

    for(var i in this.vertexCollection){
        treaded[this.vertexCollection[i].idx] = 0;
    }

    var visit = function(n, graph){
        if(treaded[n.idx] == 1){
            return [n.idx];
        } else if(treaded[n.idx] == 0) {
            treaded[n.idx] = 1;
            var adjList = graph.AdjacentVerticies(n.idx, selectorFunc);
            var containedCycle = false;
            for(var i in adjList){
               containedCycle = visit(adjList[i], graph);
               if(containedCycle){
                   containedCycle.push(n.idx);
                   return containedCycle;
               }
            }
            treaded[n.idx] = 2;
        }
        return false;
    }

    var containedCycle =false;
    for(var i in this.vertexCollection){
        if(treaded[this.vertexCollection[i].idx] == 0){
            containedCycle = visit(this.vertexCollection[i], this);
        }
        if(containedCycle){
            containedCycle.push(this.vertexCollection[i].idx);
            break;
        }
    }

    if(containedCycle){
        var idx = 0;
        for(var i = 1; i < containedCycle.length; i++){
            if(containedCycle[0] == containedCycle[i]){
                idx = i;
                break;
            }
        }

        containedCycle.splice(i + 1, containedCycle.length - (i + 1))
        containedCycle.shift();
        containedCycle.reverse();

         for(var i = 0; i < containedCycle.length; i++){
            containedCycle[i] = this.vertexCollection[containedCycle[i]];
         }

         return containedCycle;
    }

    return false;
}

/**
* Topological Sort of the verticies in the graph but grouped by indegree.
* @param {selectorFunc} [selectorFunc] Edge SelectorFunction
* @returns {Array.<Array<Graph.Vertex>>} Array containing arrays of the Graph verticies in a topologically sorted order grouped by indegree
*/
Graph.prototype.TopologicalGrouping = function(selectorFunc){
    if(selectorFunc){

    } else {
        var selectorFunc = function(group){return group[0]};
    }

    var degrees = {};

    for(var i in this.vertexCollection){
        if(degrees[this.vertexCollection[i].idx] == null){
            degrees[this.vertexCollection[i].idx] = 0;
        }
        var adjVerts = this.AdjacentVerticies(this.vertexCollection[i].idx, selectorFunc);
        for(var j in adjVerts){
            if(degrees[adjVerts[j].idx] == null){
                degrees[adjVerts[j].idx] = 0;
            }
            degrees[adjVerts[j].idx]++;
        }

    }


    var groups = [];
    while(true){
        var workQueue = [];
        groups.push([]);
        for(var i in degrees){
            if(degrees[i] == 0){
                workQueue.push(parseInt(i));
                groups[groups.length - 1].push(this.vertexCollection[i]);
                delete degrees[i]
            }
        }

        while(workQueue.length != 0){
            var vert = workQueue.pop();
            var adjVerts = this.AdjacentVerticies(vert, selectorFunc);
            for(var j in adjVerts){
                degrees[adjVerts[j].idx]--;
            }
        }

        var allDone = true;
        for(var i in degrees){
            if(degrees[i] != null){
                allDone = false;
                break;
            }
        }

        if(allDone){
            break;
        }

    }

    return groups;
}

/**
* Get the weakly connected components of the Graph
* @returns {Array.<Graph>} Array of SubGraphs that are connected (maybe weakly connected).
*/
Graph.prototype.GetComponents = function(){
    /*index of vertex.idx -> colorIdx */
    var verticies = {};
    var colorIdx = 0;
    for(var i in this.vertexCollection){
        verticies[this.vertexCollection[i].idx] = 0;
    }

    var paint = function(start, graph){
	    var queue = [];
	    queue.push(start);
        var vert = queue.shift();
        var neighbors = graph.AdjacentVerticies(vert);
		    for(var i = 0; i < neighbors.length; i++){
			    queue.push(neighbors[i]);
		    }
	    while(queue.length != 0){
		    vert = queue.shift();
            if(verticies[vert.idx] != verticies[start.idx]){
                verticies[vert.idx] = verticies[start.idx]
		        neighbors = graph.AdjacentVerticies(vert);
		        for(var i = 0; i < neighbors.length; i++){
			        queue.push(neighbors[i]);
		        }
	        }
        }
    }

    for(var i in this.vertexCollection){
        if(verticies[this.vertexCollection[i].idx] == 0){
            colorIdx++;
            verticies[this.vertexCollection[i].idx] = colorIdx;
            var adjVerts = this.AdjacentVerticies(this.vertexCollection[i]);
            for(var j in adjVerts){
                if(verticies[adjVerts[j].idx] != 0 ){
                    var color = verticies[adjVerts[j].idx];
                    for(var k in verticies){
                        if(verticies[k] == color){
                            verticies[k] = colorIdx;
                        }
                    }
                }
            }
            paint(this.vertexCollection[i],this);
        }
    }

    /*invert the color index*/
    var components = {};
    for(var i in verticies){
        if(!components[verticies[i]]){
            components[verticies[i]] = [];
        }
        components[verticies[i]].push(this.GetVertex(parseInt(i)));
    }

    var graphComponents = [];

    for(var i in components){
        graphComponents.push(this.SubGraph(components[i]));
    }

    return graphComponents;
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

Graph.prototype.CliqueOut = function(){
	for(var i = 0; i < this.vertexCollection.length; i++){
		for(var j = 0; j < this.vertexCollection.length; j++){
			if(i < j){
				this.AddEdge(this.vertexCollection[i],this.vertexCollection[j], null);
                this.AddEdge(this.vertexCollection[j],this.vertexCollection[i], null);
			}
		}
	}
}

Graph.prototype.Serialize = function(){
    return {vertices: this.vertexCollection, edgeGroups: this.edgeGroups};
}

exports.CreateGraph = function(useMatrix){
	return new Graph(null, useMatrix);
}

/**
 * Creates a new Vertex
 * @constructor
 * @param {string} label Label used to uniquely identify the vertex
 * @param {*} data Satelite Data attached to the Vertex
 */
Graph.Vertex = function(label, data){
    this.label = label;
	this.data = data;
	this.idx = -1;
}

Graph.Vertex.prototype.data = null;
Graph.Vertex.prototype.idx = -1
Graph.Vertex.prototype.color = null;

/**
 * Creates a new Edge
 * @constructor
 * @param {Graph.Vertex} from From vertex
 * @param {Graph.Vertex} to To vertex
 * @param {*} data Satelite sata attached to the Edge
 */
Graph.Edge = function(from, to, data){
	this.from = from;
	this.to = to;
	this.data  = data;
}

Graph.Edge.prototype.from = null;
Graph.Edge.prototype.to = null;
Graph.Edge.prototype.data = null;

Graph.prototype.toDot = function(name, vertFunc, edgeFunc){

    var str = "";
    if(this.isDirected){
        str += 'digraph ';
    } else {
        str += 'graph ';
    }

    str += name + " {\n";

    for(var vert in this.vertexCollection){
        if(vertFunc){
            str += vertFunc(this.vertexCollection[vert].data, this.vertexCollection[vert].idx);
        } else {
            str += "\t_" + this.vertexCollection[vert].idx + " [label=\"" + (this.vertexCollection[vert].label ? this.vertexCollection[vert].label : this.vertexCollection[vert].idx) + "\"];\n";
        }
    }

    for(var edge in this.edgeGroups){

        if(edgeFunc){
            str += edgeFunc(this.edgeGroups[edge]);
        } else {
            var label = this.edgeGroups[edge][0].data;
            if(label){
                if(label.label){
                    label = label.label;
                } else if(label.weight){
                    label = label.weight;
                } else {
                    label = 'Idx: ' + edge;
               }
            } else {
                    label = 'Idx: ' + edge;
            }
            str += "\t_" + this.edgeGroups[edge][0].from.idx + " -> _" + this.edgeGroups[edge][0].to.idx + (label ? " [label=\"" + label + "\"]"  : "");
            str += ';\n';
        }
    }

    str += '}';

    return str;
}
