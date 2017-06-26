var canvas_3dcg;
var gl;

function init3d() {
	canvas_3dcg = document.getElementById("canvas_3dcg");
	gl = canvas_3dcg.getContext("webgl");
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var v_shader = create_shader(vertical_shader,gl.VERTEX_SHADER);
	var f_shader = create_shader(fragment_shader,gl.FRAGMENT_SHADER);

	var program = create_program(v_shader, f_shader);
	var attrLocation = gl.getAttribLocation(program,"position");
	var attrStride = 3;
	var attrColorLocation = gl.getAttribLocation(program,"color");
	var attrColorStride = 4

		var vertex_position = [
			0.0, 1.0, 0.0,
			1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0
		];
		var vertex_color = [
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0
		];
	var vbo = create_vbo(vertex_position);
	var color_vbo = create_vbo(vertex_color);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(attrLocation);
	gl.vertexAttribPointer(attrLocation,attrStride,gl.FLOAT,false,0,0);
	gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
	gl.enableVertexAttribArray(attrColorLocation);
	gl.vertexAttribPointer(attrColorLocation,attrColorStride,gl.FLOAT,false,0,0);

	var m = new matIV();
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());

	m.lookAt([0.0,1.0,3.0],[0,0,0],[0,1,0],vMatrix);
	m.perspective(90,canvas_3dcg.width/canvas_3dcg.height,0.1,100,pMatrix);
	m.multiply(pMatrix,vMatrix,mvpMatrix);

	var count = 0;
	(function() {
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		m.identity(mMatrix);
		m.rotate(mMatrix,1/25,[0,1,0],mMatrix);
		m.multiply(mvpMatrix,mMatrix,mvpMatrix);
		var uniLocation = gl.getUniformLocation(program,"mvpMatrix");
		gl.uniformMatrix4fv(uniLocation,false,mvpMatrix);
		gl.drawArrays(gl.TRIANGLES,0,3);

		gl.flush();
		count++;
		setTimeout(arguments.callee,1000/60);
	})();
}

function create_shader(script,type) {
	var shader;
	shader = gl.createShader(type);
	gl.shaderSource(shader,script);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
		return shader;
	}else {
		console.log(gl.getShaderInfoLog(shader));
	}
}

function create_program(vs,fs) {
	var program = gl.createProgram();
	gl.attachShader(program,vs);
	gl.attachShader(program,fs);
	gl.linkProgram(program);
	if(gl.getProgramParameter(program,gl.LINK_STATUS)) {
		gl.useProgram(program);
		return program;
	}else {
		console.log(gl.getShaderInfoLog(shader));
	}
}

function create_vbo(data) {
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data),gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	return vbo;
}

var fragment_shader = `
precision mediump float;
varying vec4 vColor;

void main(void) {
	gl_FragColor = vColor;
}
`;

var vertical_shader = `
attribute vec3 position;
attribute vec4 color;
uniform mat4 mvpMatrix;
varying vec4 vColor;

void main(void) {
	vColor = color;
	gl_Position = mvpMatrix * vec4(position, 1.0);
}
`;
