var programInfo
var scene

var objectsToDraw = [];
var objects = [];
var nodeInfosByName = {};

var sceneDescription

var arrayCube = {}

let arrayCameras = [
  new Camera([0, 0, 100], [0, 0, 0], [0, 1, 0]),
  new Camera([0, 8, 100], [3.5, -23.5, 50.5], [0, 1, 0]),
  new Camera([100, 150, 200], [0, 35, 0], [0, 1, 0]),
]
var batata
function makeNode(nodeDescription) {
  let trs = new TRS();
  let node = new Node(trs);

  nodeInfosByName[nodeDescription.name] = {
    trs: trs,
    node: node,
    format: nodeDescription.format
  };

  trs.translation = nodeDescription.translation || trs.translation;

  trs.rotation = nodeDescription.rotation || trs.rotation;

  if (nodeDescription.draw !== false) {
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, nodeDescription.format);
  
    const vertexArray = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);
    
      node.drawInfo = {
          uniforms: {
              u_color: [0.2, 1, 0.2, 1],
          },
          format: nodeDescription.format,
          programInfo,
          bufferInfo,
          vertexArray,
      };
      objectsToDraw.push(node.drawInfo);
      objects.push(node);
  }

  makeNodes(nodeDescription.children).forEach(function(child) {
      child.setParent(node);
    });

  return node;
}

const makeNodes = nodeDescriptions => nodeDescriptions ? nodeDescriptions.map(makeNode) : []

function main(option = 0) {
  const initialize = initializeWebgl(option)

  gl = initialize.gl
  
  programInfo = initialize.programInfo

  const fieldOfViewRadians = degToRad(60);

  const arrayCube = createArray('cube')

  sceneDescription = {
    name: "Center of the world",
      draw: false,
      children: [
        {
          name: "object-0",
          draw: true,
          translation: [0, 0, 90],
          rotation: [degToRad(0), degToRad(0), degToRad(0)],
          format: arrayCube,
          children: [],
        }
    ]
  }

  scene = makeNode(sceneDescription)

  listOfTriangles = returnTriangles(nodeInfosByName[selectedObject].format.indices.data)

  requestAnimationFrame(drawScene);

  mapVertices = mapAllVertices(nodeInfosByName[selectedObject].format.position.data, nodeInfosByName[selectedObject].format.indices.data)

  loadGUI()


  function drawScene(now) {
    if (gui == null)
      loadGUI()
      
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.75, 0.85, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 200);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, arrayCameras[indexCamera].computeMatrix());

    if (actualStateEdit) {

      //const mapVertices = mapAllVertices(nodeInfosByName[selectedObject].format.position.data, nodeInfosByName[selectedObject].format.indices.data)

      for (let i = 0; i < mapVertices[settings.selectedVertice].length; i++) {
        let realVertice = mapVertices[settings.selectedVertice][i] * 3
  
        nodeInfosByName[selectedObject].format.position.data[realVertice] = config.verticeX
        nodeInfosByName[selectedObject].format.position.data[realVertice + 1] = config.verticeY
        nodeInfosByName[selectedObject].format.position.data[realVertice + 2] = config.verticeZ
      }

      let index = selectedObject.split('-')[1]

      const updatedValues = sceneDescription.children.map(item => {
        let name = item.name
  
        item.translation = nodeInfosByName[name].trs.translation
        item.rotation = nodeInfosByName[name].trs.rotation
        item.format = nodeInfosByName[name].format
        return item
      })
  
      sceneDescription.children = [...updatedValues]

      sceneDescription.children[index].format = nodeInfosByName[selectedObject].format

      objectsToDraw = [];
      objects = [];
      nodeInfosByName = {};

      scene = makeNode(sceneDescription)
    }
    if (config.isAnimation) {
      if (isFirstAnimation) {
        now *= 0.001;
        then = now;
        isFirstAnimation = false
      }

      // Convert the time to seconds
      now *= 0.001;
      // Subtract the previous time from the current time
      var deltaTime = now - then;
      // Remember the current time for the next frame.
      then = now;

      let velocidade = listOfAnimation[0].value * deltaTime

      let selectedType = listOfAnimation[0].type.split('-')[0]

      if (selectedType === 'translation') {
        if (listOfAnimation[0].position > 0) {
          if (nodeInfosByName[selectedObject].trs.translation[listOfAnimation[0].animation] >= listOfAnimation[0].position) {
            listOfAnimation.shift()

            config.isAnimation = false

          } else {
            if (listOfAnimation[0].animation == 0)
              config.translationX += velocidade

            if (listOfAnimation[0].animation == 1) {
              config.translationY += velocidade
            }

            if (listOfAnimation[0].animation == 2)
              config.translationZ += velocidade
          }
        } else {
          if (nodeInfosByName[selectedObject].trs.translation[listOfAnimation[0].animation] <= listOfAnimation[0].position) {
            listOfAnimation.shift()

            config.isAnimation = false
          } else {
            if (listOfAnimation[0].animation == 0)
              config.translationX -= velocidade

            if (listOfAnimation[0].animation == 1)
              config.translationY -= velocidade
            
            if (listOfAnimation[0].animation == 2)
              config.translationZ -= velocidade
          }
        }
      } else if (selectedType === 'rotation') {
        if (listOfAnimation[0].position > 0) {
          if (nodeInfosByName[selectedObject].trs.rotation[listOfAnimation[0].animation] >= listOfAnimation[0].position) {
            listOfAnimation.shift()

            config.isAnimation = false

          } else {
            if (listOfAnimation[0].animation == 0) {
              config.rotationX +=  velocidade
            }

            if (listOfAnimation[0].animation == 1)
              config.rotationY += velocidade

            if (listOfAnimation[0].animation == 2)
              config.rotationZ += velocidade
          }
        } else {
          if (nodeInfosByName[selectedObject].trs.rotation[listOfAnimation[0].animation] <= listOfAnimation[0].position) {
            listOfAnimation.shift()

            config.isAnimation = false
          } else {
            if (listOfAnimation[0].animation == 0)
              config.rotationX -= velocidade

            if (listOfAnimation[0].animation == 1)
              config.rotationY -= velocidade
            
            if (listOfAnimation[0].animation == 2)
              config.rotationZ -= velocidade
          }
        }
      }



      if (config.isAnimation == false && listOfAnimation.length > 0) {
        config.isAnimation = true
      } else {
        if (config.isAnimation == false) {
          isFirstAnimation = true
          gui.destroy();
          gui = null
        }
      }
    }

    computeMatrix(nodeInfosByName[selectedObject], config)
    

    scene.updateWorldMatrix();

    objects.forEach(object => {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);

        object.drawInfo.uniforms.u_world = m4.multiply(object.worldMatrix, m4.yRotation(degToRad(0)));

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
