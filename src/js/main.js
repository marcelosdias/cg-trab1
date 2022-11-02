var programInfo
var scene

var objectsToDraw = [];
var objects = [];
var nodeInfosByName = {};

let arrayCameras = [
  new Camera([0, 0, 100], [0, 0, 0], [0, 1, 0]),
  new Camera([0, 8, 100], [3.5, -23.5, 50.5], [0, 1, 0]),
  new Camera([100, 150, 200], [0, 35, 0], [0, 1, 0]),
]

function makeNode(nodeDescription) {
  let trs = new TRS();
  let node = new Node(trs);

  nodeInfosByName[nodeDescription.name] = {
    trs: trs,
    node: node,
  };

  trs.translation = nodeDescription.translation || trs.translation;
  trs.rotation = nodeDescription.rotation || trs.rotation;

  if (nodeDescription.draw !== false) {
    
      node.drawInfo = {
          uniforms: {
              // u_colorOffset: [0, 0, 0.6, 0],
              // u_colorMult: [0.4, 0.4, 0.4, 1],
              u_color: [0.2, 1, 0.2, 1],
          },
          programInfo: programInfo,
          bufferInfo: nodeDescription.bufferInfo,
          vertexArray: nodeDescription.vertexArray,
      };
      objectsToDraw.push(node.drawInfo);
      objects.push(node);
  }

  makeNodes(nodeDescription.children).forEach(function(child) {
      child.setParent(node);
    });

  return node;
}

function makeNodes(nodeDescriptions) {
  return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
}

function main(option = 0) {
  const initialize = initializeWebgl(option)

  let { gl } = initialize

  programInfo = initialize.programInfo

  let cubeNormal = returnNormals(cubeFormat.position, cubeFormat.indices)
  let pyramidNormal =  returnNormals(pyramidFormat.position, pyramidFormat.indices)

  const arrayCube = {
    position: { numComponents: 3, data: cubeFormat.position, },
    indices:{ numComponents: 3, data: cubeFormat.indices, },
    normal: { numComponents: 3, data: cubeNormal },
    color: { numComponents: 4, data: cubeFormat.color, }
  };

  const arrayPyramid = {
    position: { numComponents: 3, data: pyramidFormat.position, },
    indices:{ numComponents: 3, data: pyramidFormat.indices, },
    normal: { numComponents: 3, data: pyramidNormal },
    color: { numComponents: 4, data: pyramidFormat.color, }
  };

  arrayCube.barycentric = calculateBarycentric(arrayCube.position.data.length)
  arrayPyramid.barycentric = calculateBarycentric(arrayPyramid.position.data.length)


  cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, arrayCube);
  pyramidBufferInfo = twgl.createBufferInfoFromArrays(gl, arrayPyramid);

  cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);
  pyramidVAO = twgl.createVAOFromBufferInfo(gl, programInfo, pyramidBufferInfo);

  const fieldOfViewRadians = degToRad(60);

  sceneDescription = {
    name: "Center of the world",
      draw: false,
      children: [
        {
          name: "object-0",
          type: "cube",
          draw: true,
          translation: [0, 0, 0],
          rotation: [degToRad(0), degToRad(0), degToRad(0)],
          bufferInfo: cubeBufferInfo,
          vertexArray: cubeVAO,
          children: [],
        }
    ]
  }

  scene = makeNode(sceneDescription);

  requestAnimationFrame(drawScene);

  loadGUI()

  function drawScene(time) {
    time = time * 0.05;

    if (gui == null)
      loadGUI()

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.75, 0.85, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    if (edit) {
      const mapVertices = mapAllVertices(cubeFormat.position, cubeFormat.indices)
  
      for (let i = 0; i < mapVertices[selectedVertice].length; i++) {
        let realVertice = mapVertices[selectedVertice][i] * 3
  
        cubeFormat.position[realVertice] = config.verticeX
        cubeFormat.position[realVertice+1] = config.verticeY
        cubeFormat.position[realVertice+2] = config.verticeZ
      }
    
      cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, cubeFormat);
      cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);

      index = selectedObject.split('-')[1]
      objectsToDraw[index].bufferInfo = cubeBufferInfo
      objectsToDraw[index].vertexArray = cubeVAO
    }

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 200);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, arrayCameras[indexCamera].computeMatrix());

    computeMatrix(nodeInfosByName[selectedObject], config)

    //nodeInfosByName[selectedObject].trs.rotation[1] = degToRad(time)
    
    scene.updateWorldMatrix();
    
    objects.forEach(function(object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);

        object.drawInfo.uniforms.u_world = m4.multiply(object.worldMatrix, m4.yRotation(0));

        object.drawInfo.uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, object.worldMatrix);

        object.drawInfo.uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(object.worldMatrix));

        object.drawInfo.uniforms.u_color =  [0.2, 1, 0.2, 1]

        object.drawInfo.uniforms.u_lightWorldPosition = [0, 0, 100]

        object.drawInfo.uniforms.u_viewWorldPosition = convertObjectToArray(arrayCameras[indexCamera].cameraPosition)

        object.drawInfo.uniforms.u_shininess = 300
    });

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main(0);
