"use strict";

const vertexShader = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// varyings to pass values to the fragment shader
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * a_position;

  // orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  // compute the world position of the surface
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // compute the vector of the surface to the light
  // and pass it to the fragment shader
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // compute the vector of the surface to the view/camera
  // and pass it to the fragment shader
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`;

const fragmentShader = `#version 300 es

precision highp float;

// Passed in and varied from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // because v_normal is a varying it's interpolated
  // so it will not be a uint vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  // compute the light by taking the dot product
  // of the normal to the light's reverse direction
  float light = dot(normal, surfaceToLightDirection);
  float specular = 0.0;
  if (light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }

  outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light * u_lightColor;

  // Just add in the specular
  outColor.rgb += specular * u_specularColor;
}
`;

const vertexShaderWireframe = `
attribute vec4 a_position;
attribute vec3 a_barycentric;
uniform mat4 u_matrix;
varying vec3 vbc;
void main() {
  vbc = a_barycentric;
  gl_Position = u_matrix * a_position;
}`;

const fragmentShaderWireframe = `
precision mediump float;
varying vec3 vbc;
void main() {
  if(vbc.x < 0.03 || vbc.y < 0.03 || vbc.z < 0.03) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } 
  else {
    gl_FragColor = vec4(vbc.x, vbc.y, vbc.z, 1.0);
  }
}`;

const initializeWebgl = option => {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) return;
        
    const  programInfo = option == 0 ?  twgl.createProgramInfo(gl, [vertexShader, fragmentShader]) :  twgl.createProgramInfo(gl, [vertexShaderWireframe, fragmentShaderWireframe]);
   
    twgl.setAttributePrefix("a_");

    return { gl, programInfo };
  };
