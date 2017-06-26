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

	var encoder = new GIFEncoder();
	encoder.setRepeat(0);
	encoder.setDelay(0);
	encoder.setFrameRate(60);
	encoder.setSize(canvas_3dcg.width, canvas_3dcg.height);

	var count = 0;
	(function() {
		if(count == 0) encoder.start();
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		m.identity(mMatrix);
		m.rotate(mMatrix,Math.PI/30,[0,1,0],mMatrix);
		m.multiply(mvpMatrix,mMatrix,mvpMatrix);
		var uniLocation = gl.getUniformLocation(program,"mvpMatrix");
		gl.uniformMatrix4fv(uniLocation,false,mvpMatrix);
		gl.drawArrays(gl.TRIANGLES,0,3);

		gl.flush();
		if(count<60)encoder.addFrame(gl);
		count++;
		if(count==60) {
			encoder.finish();
			var bin = new Uint8Array(encoder.stream().bin);
			console.log(bin);
			var blob = new Blob([bin.buffer],{type:"image/gif"});
			console.log(blob);

			var a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.targer = '_blank';
			a.download = 'anime.gif';
			a.click();

			/*
			var url = URL.createObjectURL(blob);
			var image document.createElement("img");
			image.src = url;
			image.onload = function() {
				URL.revokeObjectURL(url);
			}
			*/
		}
		setTimeout(arguments.callee,1000/25);
	})();
}

/*
out.writeUTFBytes("GIF89a")
GIF89a

	out.writeByte(0x21); // extension introducer
	out.writeByte(0xf9); // GCE label
	out.writeByte(4); // data block size

out.writeByte(0x3b);
0x3b
*/


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
