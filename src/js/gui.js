var index = 1

var selectedObject = 'object-0'

let indexCamera = 0

let barycentric = false

let actualStateEdit = false

let mapVertices = []

let listOfAnimation = []

let isFirstAnimation = true

let listOfTriangles = []

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

  //Ajustar depois 
  verticeX: 0,
  verticeY: 0,
  verticeZ: 0,

  trianguleX: 0,
  trianguleY: 0,
  trianguleZ: 0,

  value: 0,
  distance: 0,
  position: 0,

  selectedType: 'translation-X',

  listOfAnimations: ['translation-X', 'translation-Y', 'translation-Z', 'rotation-X', 'rotation-Y', 'rotation-Z'],
  animation: 0,
  animationX: 0,
  animationY: 1,
  animationZ: 2,
  
  isAnimation: false,
  allAnimation: false,

  Cube: () => {
    const updatedValues = sceneDescription.children.map(item => {
      let name = item.name

      item.translation = nodeInfosByName[name].trs.translation
      item.rotation = nodeInfosByName[name].trs.rotation
      item.format = nodeInfosByName[name].format
      return item
    })

    sceneDescription.children = [...updatedValues]

    const newArray = createArray('cube')

    sceneDescription.children.push({
      name: `object-${index}`,
      type: "cube",
      translation: [0, 0, 90],
      rotation: [degToRad(0), degToRad(0), degToRad(0)],
      format: newArray, 
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

    const newArray = createArray('pyramid')

    sceneDescription.children.push({
      name: `object-${index}`,
      translation: [0, 0, 90],
      rotation: [ degToRad(0), degToRad(0), degToRad(0)],
      format:newArray,
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

  createVertice: () => {
    const newBuffer = JSON.parse(JSON.stringify(nodeInfosByName[selectedObject].format))

    newCoord = createVertice(newBuffer.position.data, newBuffer.indices.data, settings.selectedTriangle)
    
    newBuffer.position.data = [...newCoord.newPosition]
    
    newBuffer.indices.data = [...newCoord.newIndices]

    newBuffer.normal.data =  returnNormals(newBuffer.position.data, newBuffer.indices.data)

    newBuffer.barycentric = calculateBarycentric(newBuffer.position.data.length)

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

    sceneDescription.children[index].format = newBuffer

    objectsToDraw = [];
    objects = [];
    nodeInfosByName = {};

    scene = makeNode(sceneDescription)

    listOfTriangles = returnTriangles(nodeInfosByName[selectedObject].format.indices.data)
    listOfVertices = returnVertices(nodeInfosByName[selectedObject].format.position.data)

    mapVertices = mapAllVertices(nodeInfosByName[selectedObject].format.position.data, nodeInfosByName[selectedObject].format.indices.data)

    gui.destroy();
    gui = null
  },

  createAnimation() {
    const newAnimation = {
      type: config.selectedType,
      animation: config.animation,
      position: config.position,
      value: config.value,
      total: 0
    }

    
    listOfAnimation.push(newAnimation)
  },

  playAnimation() {
    config.isAnimation = !config.isAnimation 
  },

  playAllAnimation() {
    config.allAnimation = !config.allAnimation
  }



}

var settings = {
  actualStateEdit: false,
  actualStateTriangleEdit: false,
  barycentric: false,
  selectedObject: "object-0",
  selectedTriangle: 0,
  indexCamera: 0,
  selectedVertice: -1,

};

var gui = null

var listOfObjects = ['object-0']

var listOfVertices = returnVertices(cubeFormat.position)

const loadGUI = () => {
  gui = new dat.GUI({closeFolders: false}); 
  gui.closed = false;

  const allObjects = gui.addFolder('Objetos')

  allObjects.add(settings, 'selectedObject', listOfObjects ).onChange(event => {
    selectedObject = event
   
    config.translationX = nodeInfosByName[selectedObject].trs.translation[0]
    config.translationY = nodeInfosByName[selectedObject].trs.translation[1]
    config.translationZ = nodeInfosByName[selectedObject].trs.translation[2]

    config.rotationX = radToDeg(nodeInfosByName[selectedObject].trs.rotation[0])
    config.rotationY = radToDeg( nodeInfosByName[selectedObject].trs.rotation[1])
    config.rotationZ = radToDeg(nodeInfosByName[selectedObject].trs.rotation[2])

    config.scaleX = nodeInfosByName[selectedObject].trs.scale[0]
    config.scaleY = nodeInfosByName[selectedObject].trs.scale[1]
    config.scaleZ = nodeInfosByName[selectedObject].trs.scale[2]

    config.verticeX = nodeInfosByName[selectedObject].format.position.data[0]
    config.verticeY = nodeInfosByName[selectedObject].format.position.data[1]
    config.verticeZ = nodeInfosByName[selectedObject].format.position.data[2]

    settings.selectedVertice = 0

    listOfVertices = returnVertices(nodeInfosByName[selectedObject].format.position.data)
    listOfTriangles = returnTriangles(nodeInfosByName[selectedObject].format.indices.data)

    mapVertices = mapAllVertices(nodeInfosByName[selectedObject].format.position.data, nodeInfosByName[selectedObject].format.indices.data)

    settings.selectedTriangle = 0

    gui.destroy();
    gui = null

  });

  allObjects.closed = false

  const createObjects = allObjects.addFolder('Criar Objetos')
    createObjects.add(config, "Cube");
    createObjects.add(config, "Pyramid");

    createObjects.closed = false

  const transformations = allObjects.addFolder('Transformações')
    transformations.add(config, "translationX", -60, 60, 1);
    transformations.add(config, "translationY", -60, 60, 1);
    transformations.add(config, "translationZ", -60, 90, 1);
    transformations.add(config, "rotationX", 0, 360, 1);
    transformations.add(config, "rotationY", 0, 360, 1);
    transformations.add(config, "rotationZ", 0, 360, 1);
    transformations.add(config, "scaleX", -10, 10, 0.5);
    transformations.add(config, "scaleY", -10, 10, 0.5);
    transformations.add(config, "scaleZ", -10, 10, 0.5);
    transformations.closed = false

  const animations = allObjects.addFolder('Animações')
    animations.add(config, "selectedType", config.listOfAnimations).onChange(event => {
      let type = event.split('-')[1]

      if (type === 'X')
        config.animation = 0
      
      if (type === 'Y')
        config.animation = 1

      if (type === 'Z')
        config.animation = 2

      config.selectedType = event
    })
    animations.add(config, "value", 0, 5, 0.25)
    animations.add(config, "position", -60, 60, 1)
    animations.add(config, "createAnimation");
    animations.add(config, 'playAnimation')
    animations.add(config, 'playAllAnimation')


    animations.closed = false

  const createVertice = allObjects.addFolder('Criar Vértices')
    createVertice.add(settings,'barycentric').onChange(newValue => {
      barycentric = newValue

      if (barycentric) {
        const initialize = initializeWebgl(1)

        programInfo = initialize.programInfo

        const updatedValues = sceneDescription.children.map(item => {
          let name = item.name

          item.translation = nodeInfosByName[name].trs.translation
          item.rotation = nodeInfosByName[name].trs.rotation
          item.format = nodeInfosByName[name].format
          return item
        })

        sceneDescription.children = [...updatedValues]

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

    createVertice.add(settings, "selectedTriangle", listOfTriangles).onChange(event => settings.selectedTriangle = event)
    createVertice.add(config, "createVertice")

    createVertice.closed = false

  camera = arrayCameras[indexCamera]

  const cameraFolder = gui.addFolder('Câmera')
    cameraFolder
      .add(settings, 'indexCamera', [0, 1, 2])
      .onChange(event => {
        indexCamera = event
        gui.destroy();
        gui = null
      })
    const cameraPosition = cameraFolder.addFolder('Camera Position')
      cameraPosition.add(camera.cameraPosition, 'x', -100, 100, 0.5);
      cameraPosition.add(camera.cameraPosition, "y", -100, 100, 0.5);
      cameraPosition.add(camera.cameraPosition, "z", 0, 200, 0.5);

    const cameraRotation = cameraFolder.addFolder('Target')
      cameraRotation.add(camera.target, "x", -100, 100, 0.5);
      cameraRotation.add(camera.target, "y", -100, 100, 0.5);
      cameraRotation.add(camera.target, "z", -100, 100, 0.5);

  const vertices = allObjects.addFolder('Edit Vertices')
    vertices.add(settings, 'actualStateEdit').name('Edit').listen().onChange(newValue => {
      actualStateEdit = settings.selectedVertice !== -1 ? newValue : false

      if (actualStateEdit == false && settings.selectedVertice !== -1) 
        nodeInfosByName[selectedObject].format.normal = returnNormals(nodeInfosByName[selectedObject].format.position.data, nodeInfosByName[selectedObject].format.indices.data)
    })

    vertices.add(settings, 'selectedVertice', listOfVertices).onChange(event => {

      listOfVertices = returnVertices(nodeInfosByName[selectedObject].format.position.data)

      settings.selectedVertice = event

      config.verticeX = nodeInfosByName[selectedObject].format.position.data[settings.selectedVertice * 3] 
      config.verticeY = nodeInfosByName[selectedObject].format.position.data[settings.selectedVertice * 3 + 1] 
      config.verticeZ = nodeInfosByName[selectedObject].format.position.data[settings.selectedVertice * 3 + 2] 

      gui.destroy();
      gui = null
     
    })
      vertices.add(config, "verticeX", -10, 10, 0.5);
      vertices.add(config, "verticeY", -10, 10, 0.5);
      vertices.add(config, "verticeZ", -10, 10, 0.5);

      vertices.closed = false
}

