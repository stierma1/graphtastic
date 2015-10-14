
exports.CreateMatrix = function(m,n,values){
	return new Matrix(m,n,values);
}

exports.CreateZeroMatrix = function(m, n){
	return Matrix.ZeroMatrix(m,n);
}

exports.CreateIdentityMatrix = function(m,n){
	return Matrix.IdentityMatrix(m,n);
}



function Matrix(m, n, values) {

    if (m != null && n == null && values == null) {
        this.dimM = m.dimM;
        this.dimN = m.dimN;

        this.values = m.values;
    } else {

        this.dimM = m;
        this.dimN = n;

        this.values = null;

        if (values != null || (m == 0 ||  n==0)) {
            for (var i = 0; i < this.dimM; i++) {
            	if(i == 0){
            		this.values = [];
            	}
                this.values[i] = new Array();
                for (var j = 0; j < this.dimN; j++) {
                    this.values[i][j] = values[i][j];
                }
            }
        } else {
           	this.values = Matrix.ZeroMatrix(m, n).values;
        }
    }
    
}

Matrix.prototype.GetValue = function(idxM, idxN){
	return this.values[idxM][idxN];
}

Matrix.prototype.Clone = function(){
	var vals = null;
	for(var i = 0; i < this.dimM; i++){
		if(i == 0){
			vals = [];
		}
		vals.push([]);
		for(var j = 0; j < this.dimN; j++){
			vals[i][j] = this.values[i][j];
		}
	}
	
	return new Matrix(this.dimM, this.dimN, vals);
}

Matrix.prototype.Scale = function(scalar){
    for (var i = 0; i < this.dimM; i++) {
        for (var j = 0; j < this.dimN; j++) {
            this.values[i][j]	*=	scalar
        }
    }
    
    return this;
}

Matrix.prototype.Add = function (otherMatrix) {
    if (this.dimM != otherMatrix.dimM || this.dimN != otherMatrix.dimN) {
        throw  "Matrix dims do not agree! this:(" + this.dimM + ',' + this.dimN + ") OtherMatrix:(" + otherMatrix.dimM + ',' + otherMatrix.dimN + ")" ;
    }

    for (var i = 0; i < this.dimM; i++) {
        for (var j = 0; j < this.dimN; j++) {
            this.values[i][j] += otherMatrix.values[i][j]
        }
    }
    
    return this;
}

Matrix.prototype.Multi = function (otherMatrix) {
    if (otherMatrix.dimM != this.dimN) {
        throw "Matrix dims do not agree! M1:(" + this.dimM + ',' + this.dimN + ") M2:(" + otherMatrix.dimM + ',' + otherMatrix.dimN + ")" ;
    }

    var newArr = Matrix.ZeroMatrix(this.dimM, otherMatrix.dimN);

    for (var i = 0; i < this.dimM; i++) {
        for (var j = 0; j < otherMatrix.dimN; j++) {
            for (var k = 0; k < this.dimN; k++) {
            	var clone = this.values[i][k];
            	clone *= otherMatrix.values[k][j]
                newArr.values[i][j] += clone;
            }
        }
    }
	
	this.dimM = newArr.dimM;
	this.dimN = newArr.dimN;
	this.values = newArr.values;
	
	return this;
}


Matrix.prototype.Pow = function(exponent){
    var newArr = Matrix.IdentityMatrix(this.dimM, this.dimN);

    for(var i = 0; i < exponent; i++){
        newArr.Multi(this);
    }

	this.values = newArr.values;
	
	return this;
}


Matrix.prototype.Transpose = function (){
    var newArr = Matrix.ZeroMatrix(this.dimN, this.dimM);
    for(var i = 0; i < newArr.dimM; i++){
        for(var j = 0; j < newArr.dimN; j++){
            newArr.values[i][j] = this.values[j][i];
        }
    }
   
	this.values = newArr.values;
	
	return this;
}

Matrix.prototype.Embed = function (m, n, start1, start2) {
    var M2 = Matrix.ZeroMatrix(m, n);
    if (start1 == null) {
        var start1 = 0;
    }
    if (start2 == null) {
        var start2 = 0;
    }

    for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
            if (i - start1 >= 0 && j - start2 >= 0 && i - start1 < this.dimM && j - start2 < this.dimN) {
            	if(this.values){
                	M2.values[i][j] = this.values[i - start1][j - start2];
               }
            }
        }
    }

    this.dimM = m;
    this.dimN = n;
    this.values = M2.values;
    
    return this;
}


Matrix.prototype.SubMatrix = function (m, n) {
    var values = [];
    var rowPast = 0;
    var colPast = 0;
    for (var i = 0; i < this.dimM; i++) {
        if (i == m) {
            rowPast = 1;
            i++;
        }
        if (i >= this.dimM) {
            break;
        }
        if (values[i - rowPast] == null) {
            values[i - rowPast] = [];
        }
        for (var j = 0; j < this.dimN; j++) {
            if (j == n) {
                colPast = 1;
                j++;
            }
            if (j >= this.dimN) {
                break;
            }
            values[i - rowPast][j - colPast] = this.values[i][j];
        }
        colPast = 0;
    }
		
	this.dimM = this.dimM - 1;
	this.dimN = this.dimN - 1;
	this.values = values;
	
	return this;
}

Matrix.prototype.Trace = function () {
    if (this.dimM == this.dimN) {
        var sum = 0;
        for (var i = 0; i < M1.dimM; i++) {
            sum += this.values[i][i];
        }
        return sum.value;
    }
    throw "Cant Trace Non square matrices";
}

Matrix.prototype.Equal = function (otherMatrix) {
    if (this.dimM != otherMatrix.dimM || this.dimN != otherMatrix.dimN) {
		return false
    }
    for (var i = 0; i < this.dimM; i++) {
        for (var j = 0; j < this.dimN; j++) {
            if (this.values[i][j] != otherMatrix.values[i][j]) {
                return false;
            }
        }
    }

    return true;
}

Matrix.ZeroMatrix = function(m, n){
 
    var zeros = null;
    for(var i = 0; i < m; i++){
      if(i == 0){
      	zeros = [];
      }
      zeros.push([]);
      for(var j = 0; j < n; j++){
        	zeros[i].push(0);
       
      }
    }
    return new Matrix(m, n,zeros);
}

Matrix.IdentityMatrix = function(m, n){

	var zeros = null;
    for(var i = 0; i < m; i++){
      if(i == 0){
      	zeros = [];
      }
      zeros.push([]);
      for(var j = 0; j < n; j++){

      		if(i != j){
        		zeros[i].push(0);
       	 	} else {
        		zeros[i].push(1);
        	}
       
      }
    }

    return new Matrix(m, n,zeros);
}

Matrix.Add = function(matrix1, matrix2){
	var retMatrix = matrix1.Clone();
	
	retMatrix.Add(matrix2);
	
	return retMatrix;
}

Matrix.Multi = function(matrix1, matrix2){
	var retMatrix = matrix1.Clone();
	
	retMatrix.Multi(matrix2);
	
	return retMatrix;
}

Matrix.Pow = function(matrix, power){
	var retMatrix = Matrix.IdentityMatrix(matrix.dimM, matrix.dimN,matrix.elementPrototype)
	
	for(var i = 0; i < power; i++){
		retMatrix.Multi(matrix);
	}
	
	return retMatrix;
}

exports.Add = function(matrix1, matrix2){
	return Matrix.Add(matrix1, matrix2);
}

exports.Multi = function(matrix1, matrix2){
	return Matrix.Multi(matrix1, matrix2);
}

exports.Pow = function(matrix, power){
	return Matrix.Pow(matrix, power);
}
