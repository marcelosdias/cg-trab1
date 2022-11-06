const radToDeg = rad => rad * 180 / Math.PI;

const degToRad = deg => deg * Math.PI / 180;
  
const computeMatrix = (matrix, config) => {
    
    matrix.trs.translation = [config.translationX, config.translationY, config.translationZ]
    matrix.trs.rotation = [degToRad(config.rotationX), degToRad(config.rotationY), degToRad(config.rotationZ)]
    matrix.trs.scale = [config.scaleX, config.scaleY, config.scaleZ]
}

const convertObjectToArray = object => [object.x, object.y, object.z]

const calculateNormal = (position, indices) => {
  let pontos = []
  let faces = []
  
  for (let i = 0; i < position.length; i += 3) {
      pontos.push([position[i], position[i+1],position[i+2]])
  }
  
  for (let i = 0; i < indices.length; i += 3) {
      faces.push([indices[i], indices[i+1],indices[i+2]])
  }

  var normalUsadas = {}

  for (let i = 0, j = 0; i < position.length; i+=3, j++) {
      normalUsadas[j] = []
  }

  normal = faces.map(item => {
      // AB AC
      vetorA1 = [pontos[item[1]][0] - pontos[item[0]][0], pontos[item[1]][1] - pontos[item[0]][1], pontos[item[1]][2] - pontos[item[0]][2]]
      vetorB1 = [pontos[item[2]][0] - pontos[item[0]][0], pontos[item[2]][1] - pontos[item[0]][1], pontos[item[2]][2] - pontos[item[0]][2]]

      // BA BC
      vetorB2 = [pontos[item[0]][0] - pontos[item[1]][0], pontos[item[0]][1] - pontos[item[1]][1], pontos[item[0]][2] - pontos[item[1]][2]]
      vetorA2 = [pontos[item[2]][0] - pontos[item[1]][0], pontos[item[2]][1] - pontos[item[1]][1], pontos[item[2]][2] - pontos[item[1]][2]]

      // CA CB
      vetorA3 = [pontos[item[0]][0] - pontos[item[2]][0], pontos[item[0]][1] - pontos[item[2]][1], pontos[item[0]][2] - pontos[item[2]][2]]
      vetorB3 = [pontos[item[1]][0] - pontos[item[2]][0], pontos[item[1]][1] - pontos[item[2]][1], pontos[item[1]][2] - pontos[item[2]][2]]

      produto = [
          vetorA1[1] * vetorB1[2] - vetorB1[1] * vetorA1[2],
          vetorB1[0] * vetorA1[2] - vetorA1[0] * vetorB1[2],
          vetorA1[0] * vetorB1[1] - vetorB1[0] * vetorA1[1],

          vetorA2[1] * vetorB2[2] - vetorB2[1] * vetorA2[2],
          vetorB2[0] * vetorA2[2] - vetorA2[0] * vetorB2[2],
          vetorA2[0] * vetorB2[1] - vetorB2[0] * vetorA2[1],

          vetorA3[1] * vetorB3[2] - vetorB3[1] * vetorA3[2],
          vetorB3[0] * vetorA3[2] - vetorA3[0] * vetorB3[2],
          vetorA3[0] * vetorB3[1] - vetorB3[0] * vetorA3[1]
      ]

      let distancia = []

      for (let i = 0, j = 0; i < produto.length; i+=3, j++) {
          distancia.push(Math.abs(Math.sqrt(produto[i] * produto[i] + produto[i+1] * produto[i+1] + produto[i+2] * produto[i+2])))

          produto[i] = produto[i] / distancia[j]
          produto[i+1] = produto[i+1] / distancia[j]
          produto[i+2] = produto[i+2] / distancia[j]
      }

      for (let i = 0, j = 0; i < produto.length; i+=3, j++) {
          if (normalUsadas[item[0]].length == 0) {
              normalUsadas[item[0]] = [produto[i], produto[i+1], produto[i+2]]
          } else {
              if (normalUsadas[item[1]].length == 0) {
                  normalUsadas[item[1]] = [produto[i], produto[i+1], produto[i+2]]
              } else {
                  normalUsadas[item[2]] = [produto[i], produto[i+1], produto[i+2]]
              }
          }
      }
 
      return produto
  })

  return normalUsadas
}

const compareArray = (array1, array2) => array1[0] == array2[0] && array1[1] == array2[1] &&array1[2] == array2[2]

const alreadyExist = (array, index) => exist = array.find(item => item == index)

const mapAllVertices = (position, indices) => {
  let mapVertices = {}

  let pontos = [], faces = []
  
  for (let i = 0; i < position.length; i += 3) {
    pontos.push([position[i], position[i+1], position[i+2]])
  }
  
  for (let i = 0; i < indices.length; i += 3) {
    faces.push([indices[i], indices[i+1], indices[i+2]])
  }
  
  let finalMap = {}
  
  for (let i = 0, j = 0; i < position.length; i+=3, j++) {
      mapVertices[j] = [j]
      finalMap[j] = []
  }

  for (let index in mapVertices) {
    faces.map(item => {
      item.map(vertice => {
        if (compareArray(pontos[mapVertices[index]], pontos[vertice])) 
          if (!alreadyExist(finalMap[index], vertice))
            finalMap[index].push(vertice)

        return finalMap
      })
    })
  }

  return finalMap
}

const returnVertices = position => {
  let newArray = []

  for (let i = 0; i < position.length / 9; i++)
    newArray.push(i)

  return newArray
}

const returnFirstVertice = position => [position[0], position[1], position[2]]

const returnNormals = (position, indices) => {
  let cubeNormal = calculateNormal(position, indices)

  let formattedCubeNormal = []
  
  for (const item in cubeNormal) {
      for (let i = 0; i < cubeNormal[item].length; i++) {
        formattedCubeNormal.push(cubeNormal[item][i])
      }
  }

  return formattedCubeNormal
}

const calculateBarycentric = length => {
  const n = length / 6
  const barycentric = []
  for (let i = 0; i < n; i++) barycentric.push(1, 0, 0, 0, 1, 0, 0, 0, 1)
  return new Float32Array(barycentric)
}

const calculateCenterOfTriangle = (position, triangle) => {
  const newX = (position[triangle[0] * 3] +  position[triangle[1] * 3] + position[triangle[2] * 3]) / 3

  const newY = (position[(triangle[0] * 3) + 1] +  position[(triangle[1] * 3) + 1] + position[(triangle[2] * 3) + 1]) / 3

  const newZ = (position[(triangle[0] * 3) + 2] +  position[(triangle[1] * 3) + 2] + position[(triangle[2] * 3) + 2]) / 3

  return [newX, newY, newZ]
}

const createVertice = (position, indices, triangle) => {

  let selectedTriangle = [triangle * 3, triangle * 3 + 1, triangle * 3 + 2]
  console.log(selectedTriangle)

  let newTriangle = calculateCenterOfTriangle(position, selectedTriangle)

  let arrayPosition = [...position]

  let start = arrayPosition.slice(0, selectedTriangle[0] * 3)
  let end = arrayPosition.slice((selectedTriangle[2] * 3) + 3, arrayPosition.length)

  let formattedPosition = [    
    arrayPosition[selectedTriangle[0] * 3],  arrayPosition[selectedTriangle[0] * 3 + 1],  arrayPosition[selectedTriangle[0] * 3 + 2],
    newTriangle[0], newTriangle[1], newTriangle[2],
    arrayPosition[selectedTriangle[2] * 3 ],  arrayPosition[selectedTriangle[2] * 3  + 1],  arrayPosition[selectedTriangle[2] * 3  + 2],

    arrayPosition[selectedTriangle[0] * 3 ],  arrayPosition[selectedTriangle[0] * 3  + 1],  arrayPosition[selectedTriangle[0] * 3  + 2],
    arrayPosition[selectedTriangle[1] * 3],  arrayPosition[selectedTriangle[1] * 3 + 1],  arrayPosition[selectedTriangle[1] * 3 + 2],
    newTriangle[0], newTriangle[1], newTriangle[2],


    arrayPosition[selectedTriangle[1] * 3],  arrayPosition[selectedTriangle[1] * 3 + 1],  arrayPosition[selectedTriangle[1] * 3 + 2],
    arrayPosition[selectedTriangle[2] * 3 ],  arrayPosition[selectedTriangle[2] * 3  + 1],  arrayPosition[selectedTriangle[2] * 3  + 2],
    newTriangle[0], newTriangle[1], newTriangle[2],
  ]

  let newPosition = new Float32Array([...start, ...formattedPosition, ...end])
  let newIndices = []

  for (let i = 0; i < newPosition.length / 3; i++) {
    newIndices.push(i)
  }

  newIndices = new Uint16Array([...newIndices])

  return { newPosition, newIndices }
}

const returnTriangles = indices => {
  let arrayIndices = []

  for (let i = 0; i < indices.length / 3; i++)
    arrayIndices.push(i)

  return arrayIndices
}

const createArray = type =>   {
  const copyFormat = type == 'cube' ? JSON.parse(JSON.stringify(cubeFormat)) : JSON.parse(JSON.stringify(pyramidFormat))

  let cubeNormal = returnNormals(copyFormat.position, copyFormat.indices)

  const newArray = {
    position: { numComponents: 3, data: copyFormat.position, },
    indices:{ numComponents: 3, data: copyFormat.indices, },
    normal: { numComponents: 3, data: cubeNormal },
  }

  newArray.barycentric = calculateBarycentric(newArray.position.data.length)

  return newArray
}