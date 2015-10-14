
exports.createAdjList = function(){
    return new AdjList();
}

function AdjList(){
    this.vertList = [];
}

function AdjVert (vertIdx, prevNode, nextNode, edgeIdx){
    this.vertIdx = vertIdx;
    this.prev = prevNode;
    this.next = nextNode;
    this.edgeIdx = edgeIdx;
}

AdjList.prototype.AddVertex = function(){
	this.vertList.push(null);
}

AdjList.prototype._removeVertexReferences = function(vertexIdx){
    for(var i = 0; i < this.vertList.length; i++){
        curVert = this.vertList[i];
        while(curVert != null){
            if(curVert.vertIdx > vertexIdx){
                curVert.vertIdx--;
            } else if(curVert.vertIdx == vertexIdx){
                if(curVert.prev !== null){
                    curVert.prev.next = curVert.next;
                } else {
                    this.vertList[vertexIdx] = curVert.next;
                }
            }
            curVert = curVert.next;
            
        }
    }

    this.vertList.splice(vertexIdx, 1);
}

AdjList.prototype.RemoveVertex = function(vertexIdx){
	var toEdges = [];
    var fromEdges = [];
    var curVert = this.vertList[vertexIdx];
    while(curVert != null){
        toEdges.push(curVert.edgeIdx);
        curVert = curVert.next;
    }
    for(var i = 0; i < this.vertList.length; i++){
        if(i != vertexIdx){
            curVert = this.vertList[i];
        }
        while(curVert != null){
            if(curVert.vertIdx == vertexIdx){
                fromEdges.push(curVert.edgeIdx);
            }
            curVert = curVert.next;
        }
    }

	this._removeVertexReferences(vertexIdx);
	return {to: toEdges, from: fromEdges};
}

AdjList.prototype.AddEdge = function(from, to, edgeIdx){
    var curVert = this.vertList[from];

    while(curVert !== null){
        if(curVert.vertIdx == to){
            curVert.edgeIdx = edgeIdx;
            return;
        }
        curVert = curVert.next;
    }

    var vert = new AdjVert(to, null, this.vertList[from], edgeIdx);
    if(this.vertList[from]){
        this.vertList[from].prev = vert;
    }
    this.vertList[from] = vert;

}

AdjList.prototype.GetEdge = function(from, to){
    var curVert = this.vertList[from];

    while(curVert){
        if(curVert.vertIdx == to){
            return curVert.edgeIdx;
        }
        curVert = curVert.next;
    }

    return 0;
}

AdjList.prototype.GetAdjacentEdges = function(from){

    var curVert = this.vertList[from];

    var edges = [];

    while(curVert){
        edges.push(curVert.edgeIdx);
        curVert = curVert.next;
    }

    return edges;
}

AdjList.prototype._removeEdge = function(from, to){
    var curVert = this.vertList[from];

    while(curVert){
        if(curVert.vertIdx == to){
            if(curVert.next){
                curVert.next.prev = curVert.prev;
            }
            if(curVert.prev){
                curVert.prev.next = curVert.next;
            }
            curVert.next = void 0;
            curVert.prev = void 0;
            curVert.vertIdx = void 0;
            curVert.edgeIdx = void 0;
        }
        curVert = curVert.next;
    }
}

AdjList.prototype.RemoveEdge = function(from, to){
	if(arguments.length == 2 && from != null && to != null){
		var removedEdges = this.GetEdge(from,to);
		this._removeEdge(from, to);
		return removedEdges;
	}

	return null;
}

AdjList.prototype.HasOutEdges = function(from){
    return this.vertList[from][0] != null;
}

AdjList.prototype.Count = function(){
    return this.vertList.length;
}