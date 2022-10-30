"use strict";

var vertexShader = `#version 300 es
in vec4 a_position;
in vec3 a_normal;
uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;
uniform mat4 u_matrix;
uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  // Pass the color to the fragment shader.
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`;

var fragmentShader = `#version 300 es
precision highp float;
// Passed in from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;
uniform vec4 u_color;
uniform float u_shininess;
out vec4 outColor;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
  float light = dot(v_normal, surfaceToLightDirection);
  float specular = 0.0;
  if (light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }
  outColor = u_color;
  outColor.rgb *= light;
  outColor.rgb += specular;
}
`;

const initializeWebgl = () => {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) return;
        
    const  programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);

    twgl.setAttributePrefix("a_");

    return { gl, programInfo };
  };
