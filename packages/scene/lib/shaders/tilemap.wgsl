struct Viewport {
    origin: vec2f,
    size: vec2f,
};

struct SceneInputs {
    cell_size: vec2f,
    grid_size: vec2f,
    viewport: Viewport,
};

struct LayerInputs {
    texture_tile_size: vec2f,
    texture_tile_per_row: i32,
};

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) texture_coordinates: vec2f,
};

@group(0) @binding(0) var<uniform> scene_inputs: SceneInputs;
@group(0) @binding(1) var<uniform> layer_inputs: LayerInputs;
@group(0) @binding(2) var<storage> layer_data: array<i32>;
@group(0) @binding(3) var layer_sampler: sampler;
@group(0) @binding(4) var layer_texture: texture_2d<f32>;

fn vertex_coordinates(
    position: vec2f,
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
    cell_xy += position/2;        // cell corner coordinates
    cell_xy *= cell_size;         // >-> [ 0..cell_size*grid_size]
    cell_xy -= viewport_origin;
    cell_xy /= viewport_size;     // >-> [ 0..1]
    cell_xy *= 2;                 // >-> [ 0..2]
    cell_xy -= 1;                 // >-> [-1..1]
    cell_xy *= vec2f(1, -1);      // flip y

    return vec4f(cell_xy, 0, 1);
}

fn texture_coordinates(
    position: vec2f,
    instance_index: u32,
) -> vec2f {
    let tex_tile_size = layer_inputs.texture_tile_size;
    let tex_tiles_per_row = layer_inputs.texture_tile_per_row;
    let tex_size = vec2f(textureDimensions(layer_texture));
    let tex_index = layer_data[instance_index];

    var tex_xy = vec2f(vec2<i32>(
        tex_index%tex_tiles_per_row,
        tex_index/tex_tiles_per_row,
    ));
    tex_xy += (position + 1)/2;   // cell corner coordinates
    tex_xy *= tex_tile_size;      // >-> [0..tex_size]
    tex_xy /= tex_size;           // >-> [0..1]

    return tex_xy;
}

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    let texture_index = layer_data[instance_index];

    if texture_index < 0 {
        return VSOutput(vec4f(), vec2f());
    }

    let positions = array(
        // first triangle
        vec2f(-1, -1),              // (-1, -1) +--+ ( 1, -1)
        vec2f( 1, -1),              //          | /
        vec2f(-1,  1),              // (-1,  1) +
        // second triangle
        vec2f( 1, -1),              //             + ( 1, -1)
        vec2f( 1,  1),              //           / |
        vec2f(-1,  1),              // (-1,  1) +--+ ( 1,  1)
    ); // two triangles to make a rectangle
    let position = positions[vertex_index];

    return VSOutput(
        vertex_coordinates(position, instance_index),
        texture_coordinates(position, instance_index),
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
