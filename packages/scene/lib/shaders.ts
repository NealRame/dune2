export const shaderSource = /* wgsl */ `

struct Viewport {
    offset: vec2f,
    size: vec2f,
};

struct Inputs {
    viewport: Viewport,
    texture_tile_size: vec2f,
    map_tile_size: vec2f,
    map_size: vec2f,
};

@group(0) @binding(0) var<uniform> inputs: Inputs;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> @builtin(position) vec4f {
    let pos = array(
        // first triangle
        vec2f(-1, -1), // (-1, -1) +---+ ( 1, -1)
        vec2f( 1, -1), //          | /
        vec2f(-1,  1), // (-1,  1) +
        // second triangle
        vec2f( 1,  1), //              + ( 1, -1)
        vec2f(-1,  1), //            / |
        vec2f( 1, -1), // (-1,  1) +---+ ( 1,  1)
    ); // two triangles to make a rectangle

    let i = f32(instance_index);
    let cell = 1 + vec2f(
        floor(i%inputs.map_size.x),
        floor(i/inputs.map_size.x)
    );

    var xy = pos[vertex_index];
    xy += cell;
    xy *= inputs.map_tile_size/inputs.viewport.size;
    xy -= 1;
    xy *= vec2f(1, -1);

    return vec4f(xy, 0, 1);
}

@fragment
fn fragment_shader() -> @location(0) vec4f {
    return vec4f(1, 1, 1, 1);
}
`
