var vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  // 'uniform float screenWidth',
  "",
  "void main()",
  "{",
  "    fragColor = vertColor;",
  "    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}",
].join("\n");

var fragmentShaderText = [
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "void main()",
  "{",
  "    gl_FragColor = vec4(fragColor, 1.0);",
  "}",
].join("\n");

var eye = [4, 1, 0];
var center = [0, 0, 0];
var up = [0, 1, 0];
var scaleRad = 10;
var boxVertices = [
  //X,Y,Z                R,G,B
  //box1
  //top
  -0.7, 0.2, -0.2, 0.5, 0.5, 0.5, -0.7, 0.2, 0.2, 0.5, 0.5, 0.5, -0.3, 0.2, 0.2,
  0.5, 0.5, 0.5, -0.3, 0.2, -0.2, 0.5, 0.5, 0.5,

  //left
  -0.7, 0.2, 0.2, 0.75, 0.25, 0.5, -0.7, -0.2, 0.2, 0.75, 0.25, 0.5, -0.7, -0.2,
  -0.2, 0.75, 0.25, 0.5, -0.7, 0.2, -0.2, 0.75, 0.25, 0.5,

  //right
  -0.3, 0.2, 0.2, 0.25, 0.25, 0.75, -0.3, -0.2, 0.2, 0.25, 0.25, 0.75, -0.3,
  -0.2, -0.2, 0.25, 0.25, 0.75, -0.3, 0.2, -0.2, 0.25, 0.25, 0.75,

  //front
  -0.3, 0.2, 0.2, 1.0, 0.0, 0.15, -0.3, -0.2, 0.2, 1.0, 0.0, 0.15, -0.7, -0.2,
  0.2, 1.0, 0.0, 0.15, -0.7, 0.2, 0.2, 1.0, 0.0, 0.15,

  //back
  -0.3, 0.2, -0.2, 0.1, 0.5, 0.5, -0.3, -0.2, -0.2, 0.1, 0.5, 0.5, -0.7, -0.2,
  -0.2, 0.1, 0.5, 0.5, -0.7, 0.2, -0.2, 0.1, 0.5, 0.5,

  //bottom
  -0.7, -0.2, -0.2, 0.5, 0.5, 1.0, -0.7, -0.2, 0.2, 0.5, 0.5, 1.0, -0.3, -0.2,
  0.2, 0.5, 0.5, 1.0, -0.3, -0.2, -0.2, 0.5, 0.5, 1.0,
];

var InitDemo = function () {
  //testing
  console.log("This is working");

  //get canvas from index.html and get WebGL context
  var canvas = document.getElementById("surfaces");
  var gl = canvas.getContext("webgl");

  //if webgl cant load the context
  if (!gl) {
    console.log("WebGl not supported, falling back on experimental WebGL");
    gl = canvas.getContext("experimental-webgl");
  }
  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  gl.clearColor(0.95, 0.15, 0.2, 0.4);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //penting!!!!!! buat test depth and cull
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  // create shaders
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling fragment shader!",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  }

  //
  // create buffer
  //
  var boxIndices = [
    //box1
    // Top
    0, 1, 2, 0, 2, 3,

    // Left
    5, 4, 6, 6, 4, 7,

    // Right
    8, 9, 10, 8, 10, 11,

    // Front
    13, 12, 14, 15, 14, 12,

    // Back
    16, 17, 18, 16, 18, 19,

    // Bottom
    21, 20, 22, 22, 20, 23,
  ];

  //make box's buffer
  var boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );

  //get attribute location
  var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation, //Attribute location
    3, // number of elements per attribute
    gl.FLOAT, //type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, //Attribute location
    3, // number of elements per attribute
    gl.FLOAT, //type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //
  // Main render loop
  //
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, eye, center, up);
  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(scaleRad),
    canvas.width / canvas.height,
    0.1,
    1000.0
  );

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
};

/////////////////////////////////////////////////////////
//////////////////  SCRIPT FOR SLIDER   /////////////////
/////////////////////////////////////////////////////////

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

translateMode = false;
rotateMode = true;

var slider21 = document.getElementById("x-Rotate");
var output21 = document.getElementById("21");
output21.innerHTML = slider21.value;
eye[0] = Math.cos(degrees_to_radians(slider21.value)) * 6;
eye[2] = Math.sin(degrees_to_radians(slider21.value)) * -6;
slider21.oninput = function () {
  rotateMode = true;
  output21.innerHTML = this.value;
  eye[0] = Math.cos(degrees_to_radians(this.value)) * 6;
  eye[2] = Math.sin(degrees_to_radians(this.value)) * -6;
  // console.log(eye);
  InitDemo();
};

/////////////////////////////////////////////////////////
/////////////////    SCRIPT FOR COLOR   /////////////////
/////////////////////////////////////////////////////////

/* Toolbox code */
function hexToRgb(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    // console.log("we reached tihis");
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return new Color(
      ((c >> 16) & 255) / 255.0,
      ((c >> 8) & 255) / 255.0,
      (c & 255) / 255.0
    );
  }
  throw new Error("Bad Hex");
}
function editColor(r, g, b, boxVertices) {
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 6; j++) {
      for (let k = 0; k < 6; k++) {
        if (j == 2 || j == 4 || j == 5) {
          boxVertices[i * 144 + j * 24 + k * 6 + 3] = r <= 0.9 ? r + 0.1 : 1;
          boxVertices[i * 144 + j * 24 + k * 6 + 4] = g;
          boxVertices[i * 144 + j * 24 + k * 6 + 5] = b >= 0.1 ? b - 0.1 : 0;
        } else {
          boxVertices[i * 144 + j * 24 + k * 6 + 3] = r;
          boxVertices[i * 144 + j * 24 + k * 6 + 4] = g;
          boxVertices[i * 144 + j * 24 + k * 6 + 5] = b;
        }
      }
    }
  }
}
