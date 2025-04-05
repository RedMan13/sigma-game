// Passed in from the vertex shader.
varying vec2 v_texcoord;
 
// The texture.
uniform sampler2D u_texture;
uniform int u_charWidth;
uniform int u_charHeight;
uniform int u_screenWidth;
uniform int u_screenHeight;
 
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);// texture2D(u_texture, v_texcoord);
}