var index = 1

var selectedObject = 'object-0'
var selectedVertice = '0'

let indexCamera = 0

let barycentric = false

let objectVertices = returnFirstVertice(cubeFormat.position)

animation = false
let edit = false

const config = { 
  translationX: 0,
  translationY: 0, 
  translationZ: 90,

  rotationX: degToRad(0),
  rotationY: degToRad(0),
  rotationZ: degToRad(0),

  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,

  cameraPositionX: 0,
  cameraPositionY: 0,
  cameraPositionZ: 100,

  targetX: 0,
  targetY: 0,
  targetZ: 0,

  // Ajustar depois 
  verticeX: objectVertices[0],
  verticeY: objectVertices[1],
  verticeZ: objectVertices[2],

  Cube: () => {
    const updatedValues = sceneDescription.children.map(item => {
      let name = item.name

      item.translation = nodeInfosByName[name].trs.translation
      item.rotation = nodeInfosByName[name].trs.rotation

      return item
    })

    sceneDescription.children = [...updatedValues]

    sceneDescription.children.push({
      name: `object-${index}`,
      type: "cube",
      translation: [0, 0, 90],
      rotation: [ degToRad(2), degToRad(46.5), degToRad(0)],
      bufferInfo: cubeBufferInfo,
      vertexArray: cubeVAO,
      children: []
    });
   
    objectsToDraw = [];
    objects = [];
    nodeInfosByName = {};

    scene = makeNode(sceneDescription);
    
    listOfObjects.push(`object-${index}`)

    index += 1

    gui.destroy();
    gui = null

  }, 

  Pyramid: () => {
    const updatedValues = sceneDescription.children.map(item => {
      let name = item.name

      item.translation = nodeInfosByName[name].trs.translation
      item.rotation = nodeInfosByName[name].trs.rotation

      return item
    })

    sceneDescription.children = [...updatedValues]

    sceneDescription.children.push({
      name: `object-${index}`,
      type: "pyramid",
      translation: [0, 0, 90],
      rotation: [ degToRad(2), degToRad(46.5), degToRad(0)],
      bufferInfo: pyramidBufferInfo,
      vertexArray: pyramidVAO,
      children: []
    });

    objectsToDraw = [];
    objects = [];
    nodeInfosByName = {};

    scene = makeNode(sceneDescription);

    listOfObjects.push(`object-${index}`)

    index += 1

    gui.destroy();
    gui = null

  },



}

var settings = {
  checkbox: false,
  barycentric: false,
  selectedObject: "object-0",
  indexCamera: 0,
  selectedVertice: 0,
  speed:0,
  selectedVertice: 0
};

var gui = null

var listOfObjects = ['object-0']

var listOfVertices = returnVertices(cubeFormat.position)

const loadGUI = () => {

  gui = new dat.GUI({closeFolders: false}); 
  gui.closed = false;

  gui.add(settings,'barycentric').listen().onChange(newValue => {
    barycentric = newValue

    if (barycentric) {
      const initialize = initializeWebgl(1)

      programInfo = initialize.programInfo

      objectsToDraw = [];
      objects = [];
      nodeInfosByName = {};

      scene = makeNode(sceneDescription);
    } else {
      const initialize = initializeWebgl(0)

      programInfo = initialize.programInfo

      objectsToDraw = [];
      objects = [];
      nodeInfosByName = {};

      scene = makeNode(sceneDescription);
    }

  })


  gui.add(settings, 'selectedObject', listOfObjects ).onChange(event => {
    selectedObject = event
   
    config.translationX = nodeInfosByName[selectedObject].trs.translation[0]

    //sceneDescription.children[teste].translation = []

    config.translationY = nodeInfosByName[selectedObject].trs.translation[1]
    config.translationZ = nodeInfosByName[selectedObject].trs.translation[2]

    config.rotationX = nodeInfosByName[selectedObject].trs.rotation[0]
    config.rotationY = nodeInfosByName[selectedObject].trs.rotation[1]
    config.rotationZ = nodeInfosByName[selectedObject].trs.rotation[2]

    config.scaleX = nodeInfosByName[selectedObject].trs.scale[0]
    config.scaleY = nodeInfosByName[selectedObject].trs.scale[1]
    config.scaleZ = nodeInfosByName[selectedObject].trs.scale[2]


    gui.destroy();
    gui = null

  });

  objects.closed = false

  const createObjects = gui.addFolder('Criar Objetos')
  createObjects.add(config, "Cube");
  createObjects.add(config, "Pyramid");

  createObjects.closed = false

  const transformations = gui.addFolder('Transformações')
  transformations.add(config, "translationX", -150, 150, 0.5);
  transformations.add(config, "translationY", -100, 100, 0.5);
  transformations.add(config, "translationZ", -120, 120, 0.5);
  transformations.add(config, "rotationX", 0, 500, 0.5);
  transformations.add(config, "rotationY", 0, 500, 0.5);
  transformations.add(config, "rotationZ", 0, 500, 0.5);
  transformations.add(config, "scaleX", -10, 10, 0.5);
  transformations.add(config, "scaleY", -10, 10, 0.5);
  transformations.add(config, "scaleZ", -10, 10, 0.5);
  transformations.closed = false

  camera = arrayCameras[indexCamera]

  const cameraFolder = gui.addFolder('Câmera')

    cameraFolder
      .add(settings, 'indexCamera', [0, 1, 2])
      .onChange(event => {
        indexCamera = event
        gui.destroy();
        gui = null
      })
      cameraFolder.closed = false
    const cameraPosition = cameraFolder.addFolder('Camera Position')
      cameraPosition.add(camera.cameraPosition, 'x', -100, 100, 0.5);
      cameraPosition.add(camera.cameraPosition, "y", -100, 100, 0.5);
      cameraPosition.add(camera.cameraPosition, "z", 0, 200, 0.5);

    const cameraRotation = cameraFolder.addFolder('Target')
      cameraRotation.add(camera.target, "x", -100, 100, 0.5);
      cameraRotation.add(camera.target, "y", -100, 100, 0.5);
      cameraRotation.add(camera.target, "z", -100, 100, 0.5);

  const vertices = gui.addFolder('Edit Vertices')
    vertices.add(settings,'checkbox').name('Edit').listen().onChange(newValue => edit = newValue);

    vertices.add(settings, 'selectedVertice', listOfVertices).onChange(event => {
      console.log()

      const mapVertices = mapAllVertices(cubeFormat.position, cubeFormat.indices)

      returnFirstVertice(cubeFormat.position, cubeFormat.indices)

      selectedVertice = event

      for (let i = 0; i < mapVertices[selectedVertice].length; i++) {
        let realVertice = mapVertices[selectedVertice][i] * 3
  
        config.verticeX = cubeFormat.position[realVertice] 
        config.verticeY = cubeFormat.position[realVertice+1] 
        config.verticeZ = cubeFormat.position[realVertice+2] 
      }    

      gui.destroy();
      gui = null
    })

    vertices.add(config, 'verticeX', -5, 5, 0.2)
    vertices.add(config, 'verticeY', -5, 5, 0.2)
    vertices.add(config, 'verticeZ', -5, 5, 0.2)

    vertices.closed = false

  }

