/**
 * @author stierm
 */


exports['test matrix construction'] = function(assert) {
  var Matrix = require('../lib/Matrix/matrix.js');
	var s = Matrix.CreateMatrix(2,2);
	assert.notEqual(s, null, "New Matrix Should Not Be Null");
	var q = Matrix.CreateZeroMatrix(2,2);
	assert.equal(s.Equal(q),true, "New Matrix without values equals zero matrix");

	var qE = 1;
	s.values[0][0] = 1;
	s.values[1][1] = 1;
	var o = Matrix.CreateIdentityMatrix(2,2);
	assert.equal(s.Equal(o), true, 'Identity Matrix should have 1\'s on diagonal and zero\'s everywhere else');
	
	o = Matrix.CreateIdentityMatrix(5,5);
	var ident = o.Clone();
	ident.Scale(2);
	o.Add(o.Clone());
	assert.equal(ident.Equal(o), true, "Scale Identity Matrix by 2, should equal adding 2 Identity Matricies together")
	
	ident.Transpose();
	
	assert.equal(ident.Equal(o), true, "Transposing a diagonal matrix should equal itself");
	
	ident.values[1][0] = 1;
	
	var ident2 = ident.Clone();
	ident.Transpose();
	assert.equal(ident.Equal(ident2), false, "NonSymmetric Matrix's Transpose will not equal the pre transposed matrix")
	ident.Transpose();
	assert.equal(ident.Equal(ident2), true, "Double Transposing gives back the initial matrix");
	
	ident.Pow(0);
	assert.equal(ident.Equal(Matrix.CreateIdentityMatrix(ident.dimM, ident.dimN)), true, "Raising Matrix to Power 0 should return Identity Matrix");
	
	ident = ident2.Clone();
	ident.Pow(1);
	assert.equal(ident.Equal(ident2), true, "Raising to Power 1 gives back the intial matrix");
	
	ident.Pow(2);
	assert.notEqual(ident.Equal(ident2), true, "A Non Zero and Non Identity Matrix will give a different Matrix if raised to Power 2")
	
	var e = Matrix.Add(ident, ident);
	e = Matrix.Multi(ident, ident);

	ident.Embed(3,3);
	ident.SubMatrix(1,0);

	var emp = Matrix.CreateMatrix(0,0);
	emp.Embed(1,1);
	emp.Embed(0,0);
	//ident.Multi(ident.Clone());

	//var fs = require('fs');
	//fs.writeFileSync('C:/matrix.json', JSON.stringify(ident, null,4, 4));
}

exports['test disjointset'] = function(assert) {
	
	var DisjointSetMod = require('../lib/Set/DisjointSet.js');
	var setArr = [];
	for(var i = 0; i < 100; i++){
		setArr.push(new DisjointSetMod.CreateDisjointSet(new DisjointSetMod.CreateElement(i)));
	}
	assert.equal(setArr[0].IsInSet(setArr[0].representative), true, "Element representing set is contained in the Set it represents");
	assert.equal(setArr[0].IsInSet(setArr[1].representative), false, "Element not in the set will return false when IsInSet is used");
	var evenSet = setArr[0];
	for(var i = 2; i < 100; i+=2){
		var evenSet = DisjointSetMod.Union(evenSet, setArr[i]);
	}
	var oddSet = setArr[1];
	for(var i = 3; i < 100; i += 2){
		var oddSet = DisjointSetMod.Union(oddSet, setArr[i]);
	}	
	
	for(var i = 0; i < 100; i+=2){
		if(!evenSet.IsInSet(setArr[i].representative)){
			throw Error("Even Number not contained in the even set")
		}
	}
	assert.equal(true, true, "Even Set contains the even Elements")
	for(var i = 1; i < 100; i+=2){
		if(!oddSet.IsInSet(setArr[i].representative)){
			throw Error("Odd Number not contained in the odd set")
		}
	}
	assert.equal(true, true, "Odd Set contains the odd Elements")
}

exports['test graph'] = function(assert) {
	var Graph = require('../lib/Graph/graph2.js');
	
    var petersonGraph = function(){
        var graph = Graph.CreateGraph();
        var verticies = [];
        for(var i = 0; i < 10; i++){
            verticies.push(graph.AddVertex());
        }

        graph.AddEdge(0,1,{weight:1}); //0
        graph.AddEdge(1,0,{weight:1});
        graph.AddEdge(0,4,{weight:1});
        graph.AddEdge(4,0,{weight:1});
        graph.AddEdge(0,5,{weight:1});
        graph.AddEdge(5,0,{weight:1});
        graph.AddEdge(1,2,{weight:1}); //1
        graph.AddEdge(2,1,{weight:1});
        graph.AddEdge(1,6,{weight:1});
        graph.AddEdge(6,1,{weight:1});
        graph.AddEdge(2,3,{weight:1});//2
        graph.AddEdge(3,2,{weight:1});
        graph.AddEdge(2,7,{weight:1});
        graph.AddEdge(7,2,{weight:1});
        graph.AddEdge(3,8,{weight:1});//3
        graph.AddEdge(8,3,{weight:1});
        graph.AddEdge(3,4,{weight:1});
        graph.AddEdge(4,3,{weight:1});
        graph.AddEdge(4,9,{weight:1});//4
        graph.AddEdge(9,4,{weight:1});
        graph.AddEdge(9,6,{weight:1});//9
        graph.AddEdge(6,9,{weight:1});
        graph.AddEdge(9,7,{weight:1});
        graph.AddEdge(7,9,{weight:1});
        graph.AddEdge(5,7,{weight:1});//5
        graph.AddEdge(7,5,{weight:1});
        graph.AddEdge(5,8,{weight:1});
        graph.AddEdge(8,5,{weight:1});
        graph.AddEdge(6,8,{weight:1});//6
        graph.AddEdge(8,6,{weight:1});

        return graph;
    }

    var cayleyS4 = function(){
        var graph = Graph.CreateGraph();
        var verticies = [];
        for(var i = 0; i < 24; i++){
            verticies.push(graph.AddVertex());
        }

        graph.AddEdge(0,4,{weight:1}); //0
        graph.AddEdge(3,0,{weight:1});
        graph.AddEdge(0,9,{weight:1});
        graph.AddEdge(18,0,{weight:1});
        graph.AddEdge(9,6,{weight:1});
        graph.AddEdge(10,9,{weight:1});
        graph.AddEdge(9,16,{weight:1}); //1
        graph.AddEdge(16,15,{weight:1});
        graph.AddEdge(12,16,{weight:1});
        graph.AddEdge(16,18,{weight:1});
        graph.AddEdge(18,22,{weight:1});//2
        graph.AddEdge(21,18,{weight:1});
        graph.AddEdge(4,3,{weight:1});
        graph.AddEdge(6,3,{weight:1});
        graph.AddEdge(6,10,{weight:1});//3
        graph.AddEdge(15,10,{weight:1});
        graph.AddEdge(15,12,{weight:1});
        graph.AddEdge(12,22,{weight:1});
        graph.AddEdge(22,21,{weight:1});//4
        graph.AddEdge(4,21,{weight:1});
        graph.AddEdge(13,4,{weight:1});//9
        graph.AddEdge(21,8,{weight:1});
        graph.AddEdge(11,22,{weight:1});
        graph.AddEdge(12,1,{weight:1});
        graph.AddEdge(2,15,{weight:1});//5
        graph.AddEdge(10,19,{weight:1});
        graph.AddEdge(20,6,{weight:1});
        graph.AddEdge(3,17,{weight:1});
        graph.AddEdge(17,13,{weight:1});//6
        graph.AddEdge(8,13,{weight:1});
        graph.AddEdge(8,11,{weight:1});//6
        graph.AddEdge(1,11,{weight:1});
        graph.AddEdge(1,2,{weight:1});//6
        graph.AddEdge(19,2,{weight:1});
        graph.AddEdge(19,20,{weight:1});//6
        graph.AddEdge(17,20,{weight:1});
        graph.AddEdge(14,17,{weight:1});//6
        graph.AddEdge(13,14,{weight:1});
        graph.AddEdge(14,7,{weight:1});//6
        graph.AddEdge(7,8,{weight:1});
        graph.AddEdge(11,7,{weight:1});//6
        graph.AddEdge(7,5,{weight:1});
        graph.AddEdge(5,1,{weight:1});//6
        graph.AddEdge(2,5,{weight:1});
        graph.AddEdge(5,23,{weight:1});//6
        graph.AddEdge(23,19,{weight:1});
        graph.AddEdge(20,23,{weight:1});//6
        graph.AddEdge(23,14,{weight:1});
        return graph;
    } 

    var addVertexAndEdgeTest = function(){
        var graph = Graph.CreateGraph();

        var a = graph.AddVertex();
        var b = graph.AddVertex();
        
        graph.AddEdge(a, b, "Edge 1");
        graph.AddEdge(a, b, "Edge 2");
        assert.equal(true, graph.vertexCollection[a.idx].idx == a.idx && graph.vertexCollection[b.idx].idx == b.idx, "Simple Vertex Inclusion Passed");
        assert.equal(true, graph.edgeGroups[1][0].from.idx == a.idx && graph.edgeGroups[1][0].to.idx == b.idx, "Simple Edge Inclusion Passed");   
        assert.equal(true, graph.edgeGroups[1][1].data == "Edge 2" && graph.edgeGroups[1][0].data == "Edge 1", "Simple MultiEdge Inclusion Passed");   
    }

    var adjEdgeTest = function(){
        var graph = Graph.CreateGraph();

        var a = graph.AddVertex();
        var b = graph.AddVertex();
        
        graph.AddEdge(a, b, "Edge 1");
        graph.AddEdge(a, b, "Edge 2");

        assert.equal(true, graph.IsAdjacent(a,b), "Simple Adjacent directed positve assertion Passed");
        assert.equal(false, graph.IsAdjacent(b,a), "Simple Adjacent directed negative assertion Passed");
        var c = graph.AddVertex();

        graph.AddEdge(b,c, "Edge 3");
        assert.equal(false, graph.IsAdjacent(a,c), "Simple Adjacent directed depth 2 negative assertion Passed");
        assert.equal(true, graph.IsConnected(a,c), "Simple Connected directed depth 2 negative assertion Passed");
    }

    var petersonTests = function(){
        var peterson = petersonGraph();

        peterson.vertexCollection.forEach(function(vert1){
             peterson.vertexCollection.forEach(function(vert2){
                 if(vert1.idx != vert2.idx){
                     assert.equal(true, peterson.IsConnected(vert1, vert2), "Peterson Verticies " + vert1.idx + " " + vert2.idx + " are connected");
                 }
            });
        });

        var fs = require('fs');
        fs.writeFileSync('C:\\gr.dot', peterson.Dijkstra(1).toDot());
        //peterson.DeleteEdgeGroup(0, 1);
        //peterson.DeleteEdgeGroup(1, 2);
        //console.log(peterson.toDot());
    }

    var nameTest = function(){
        var graph = Graph.CreateGraph();
        graph.AddVertex('7');
        graph.AddVertex('5');
        graph.AddVertex('3');
        graph.AddVertex('11');
        graph.AddVertex('8');
        graph.AddVertex('2');
        graph.AddVertex('9');
        graph.AddVertex('10');
        graph.AddEdge('7','11', {key:1});
        graph.AddEdge('7', '8', {key:1});
        graph.AddEdge('5', '11', {key:1});
        graph.AddEdge('3', '8', {key:1});
        graph.AddEdge('3', '10', {key:1});
        graph.AddEdge('11', '2', {key:1});
        graph.AddEdge('11', '9', {key:1});
        graph.AddEdge('8', '9', {key:1});
        graph.AddEdge('11', '10', {key:1});

        console.log(graph.TopologicalSort());
        console.log(graph.HasCycle());
        console.log(graph.GetComponents());
        
        var g = Graph.CreateGraph();

        g.AddVertex("A");
        g.AddVertex("B");
        console.log(g.GetComponents());
        g.AddEdge("B","A",{weight:1});
        console.log(g.GetComponents());
    }

    nameTest();
    console.log(cayleyS4().HasCycle());
    //console.log(cayleyS4().Dijkstra(0,22).toDot());
    addVertexAndEdgeTest();
    adjEdgeTest();
    petersonTests();
	var graph = Graph.CreateGraph();    

	var a = graph.AddVertex(null);

	var b = graph.AddVertex(null);
	
	graph.AddEdge(a.idx,b.idx, null);
	graph.AddEdge(a.idx,b.idx, 2);
	
	var c = graph.AddVertex(null);

	var d = graph.AddVertex(null);
	//console.log(graph.RemoveEdgeGroup(1));
	graph.CliqueOut();

	graph.RemoveVertex(a.idx);
	var graph2 = graph.Clone();
	graph2.AddVertex(1);
	
	var g3 = Graph.CreateGraph();
	for(var i = 0; i < 200; i++){
		g3.AddVertex(i);
	}
	for(var i = 0; i < 10; i++){
		for(var j = 0; j < 10; j++){
			if(i != j){
				assert.equal(g3.IsConnected(i,j), false, "No Verticies in a Graph without edges are connected");
			}
		}
	}


	g3.CliqueOut();

	for(var i = 0; i < 10; i++){
		for(var j = 0; j < 10; j++){
			if(i != j){
				assert.equal(g3.IsConnected(i,j), true, "All elements in a Clique are connected to each other");
			}
		}
	}
    
	g3.AddVertex();
	var e = g3.AddEdge(9, 200, null);
	assert.equal(g3.IsConnected(1,200), true, "Adding a directed edge to a vertex from a clique means any vertex in that clique is connected to that vertex");
	assert.equal(g3.IsConnected(200,1), false, "Adding a directed edge to a vertex from a clique does not neccessarily mean that vertex is connected to the clique");
	g3.DeleteEdgeGroup(9,10);

	var g4 = g3.SubGraph([0,1,2]);
            var fs = require('fs');
        fs.writeFileSync('C:\\gr.dot', g4.toDot());
    g4.IsConnected(1,2)
    console.log(g4.GetEdges(1));
	g4.AddGraph(g3);
	g4.AddEdge(2,3, null)
    console.log(g4.IsConnected(1,101));
    console.log(g4.IsConnected(101,1));
	assert.equal(g4.IsConnected(1,101) && !g4.IsConnected(101,1), true, "Directed Connection between cliques will allow traversal from one clique to the other, but not other way around");
    //console.log(g4.Serialize()) // fs.writeFileSync('C:\\gr.json', g4.Serialize());    
   
}


if (module == require.main) require('test').run(exports)