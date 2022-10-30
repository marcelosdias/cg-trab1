var programInfo
var scene

var objectsToDraw = [];
var objects = [];
var nodeInfosByName = {};

let arrayCameras = [
  new Camera([0, 0, 100], [0, 0, 0], [0, 1, 0]),
  new Camera([0, 8, 100], [3.5, -23.5, 50.5], [0, 1, 0]),
  new Camera([5, 2, 100], [0, 0, 0], [0, 1, 0]),
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

function main() {
  const initialize = initializeWebgl()

  const { gl } = initialize

  programInfo = initialize.programInfo

  let agoraVai = calculateNormal(cubeFormat.position, cubeFormat.indices)

  
  let Deus = []
  
  for (const item in agoraVai) {
      for (let i = 0; i < agoraVai[item].length; i++) {
          Deus.push(agoraVai[item][i])
      }
  }

  const arrayCube = {
    position: { numComponents: 3, data: cubeFormat.position, },
    indices:{ numComponents: 3, data: cubeFormat.indices, },
    normal: { numComponents: 3, data: Deus },
    color: { numComponents: 4, data: cubeFormat.color, }
  };

  const arrayPyramid = {
    position: { numComponents: 3, data: pyramidFormat.position, },
    indices:{ numComponents: 3, data: pyramidFormat.indices, },
    color: { numComponents: 4, data: pyramidFormat.color, }
  };


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
          translation: [0, 0, 90],
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

    var worldMatrix = m4.yRotation(degToRad(0));

    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    computeMatrix(nodeInfosByName[selectedObject], config)

    //nodeInfosByName['Center of the world'].trs.rotation[1] = degToRad(time)
    //scene.source.rotation[1] = degToRad(time)

    //nodeInfosByName['object-0'].trs.rotation[1] = degToRad(time * 2)

    scene.updateWorldMatrix();
    
    objects.forEach(function(object) {
        //object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);

        // object.drawInfo.uniforms.u_matrix = m4.multiply(
        //   viewProjectionMatrix,
        //   object.worldMatrix
        // );

        object.drawInfo.uniforms.u_worldViewProjection = worldViewProjectionMatrix
        object.drawInfo.uniforms.u_worldInverseTranspose = worldInverseTransposeMatrix
        object.drawInfo.uniforms.u_color = [0.2, 1, 0.2, 1] 
        object.drawInfo.uniforms.u_lightWorldPosition = [config.verticeX, config.verticeY, config.verticeZ]   
        object.drawInfo.uniforms.u_viewWorldPosition = convertObjectToArray(arrayCameras[0].cameraPosition)
        object.drawInfo.uniforms.u_shininess = 150

 
    });

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main();
