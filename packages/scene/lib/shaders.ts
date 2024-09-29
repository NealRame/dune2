export const shaderSource = /* wgsl */ `

struct Viewport {
    origin: vec2f,
    size: vec2f,
};

struct SceneInputs {
    viewport: Viewport,
    cell_size: vec2f,
    grid_size: vec2f,
};

struct LayerInputs {
    texture_tile_size: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) texture_coordinates: vec2f,
};

@group(0) @binding(0) var<uniform> scene_inputs: SceneInputs;
@group(0) @binding(1) var<uniform> layer_inputs: LayerInputs;
@group(0) @binding(2) var<storage> layer_data: array<u32>;
@group(0) @binding(3) var layer_sampler: sampler;
@group(0) @binding(4) var layer_texture: texture_2d<f32>;


fn vertex_coordinates(
    vertex: vec2f,
    instance_index: u32,
) -> vec4f {
    let cell_size = scene_inputs.cell_size;
    let grid_size = scene_inputs.grid_size;
    let viewport_origin = scene_inputs.viewport.origin;
    let viewport_size = scene_inputs.viewport.size;

    var cell_xy = vec2f(
        f32(instance_index)%grid_size.x,
        floor(f32(instance_index)/grid_size.x),
    );
    cell_xy += vertex;            // cell corner coordinates
    cell_xy *= cell_size;         // >-> [ 0..cell_size*grid_size]
    cell_xy -= viewport_origin;
    cell_xy /= viewport_size;     // >-> [ 0..1]
    cell_xy *= 2;                 // >-> [ 0..2]
    cell_xy -= 1;                 // >-> [-1..1]
    cell_xy *= vec2f(1, -1);      // flip y

    return vec4f(cell_xy, 0, 1);
}

fn texture_coordinates(
    vertex: vec2f,
    instance_index: u32,
) -> vec2f {
    let tex_index = layer_data[instance_index];
    var tex_tile_size = layer_inputs.texture_tile_size;
    let tex_size = vec2f(textureDimensions(layer_texture));

    var tex_xy = vec2f(vec2u(
        tex_index%16,
        tex_index/16,
    ));
    tex_xy += vertex;        // cell corner coordinates
    tex_xy *= tex_tile_size; // >-> [0..tex_size]
    tex_xy /= tex_size;      // >-> [0..1]

    return tex_xy;
}

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    let positions = array(
        // first triangle
        vec2f(0, 0), // (0, 0) +---+ (1, 0)
        vec2f(1, 0), //        | /
        vec2f(0, 1), // (0, 1) +
        // second triangle
        vec2f(1, 1), //            + (1, 0)
        vec2f(0, 1), //          / |
        vec2f(1, 0), // (0, 1) +---+ (1, 1)
    ); // two triangles to make a rectangle
    let pos = positions[vertex_index];

    return VSOutput(
        vertex_coordinates(pos, instance_index),
        texture_coordinates(pos, instance_index),
    );
}

@fragment
fn fragment_shader(
    fs_inputs: VSOutput,
) -> @location(0) vec4f {
    return textureSample(
        layer_texture,
        layer_sampler,
        fs_inputs.texture_coordinates,
    );
}
`
