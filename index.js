var THREE = require('three');
var createOrbitViewer = require('three-orbit-viewer')(THREE);
var dat = require('exdat');


var equations = {
	mobius: function(u, t) {
		// flat mobius strip
		// http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
		
		u = u - 0.5;
		var v = 2 * Math.PI * t;

		var x, y, z;

		var a = params.mobiusRadius;
		x = Math.cos(v) * (a + u * Math.cos(v/2));
		y = Math.sin(v) * (a + u * Math.cos(v/2));
		z = params.mobiusStripWidth * u * Math.sin(v/2);
		return new THREE.Vector3(x, y, z);	
	}

	// volumetric mobius strip
	, mobius3d: function(u, t) {

		u *= Math.PI;
		t *= 2 * Math.PI;

		// make complete circle
		u = u * 2;

		// rotation around torus
		var phi = u / 2;
		// major radius
		var major = params.mobiusRadius;
		// "flatness"
		var a = params.mobiusFlatness;
		// surface width
		var b = params.mobiusStripWidth;
		var x, y, z;
		x = a * Math.cos(t) * Math.cos(phi) - b * Math.sin(t) * Math.sin(phi);
		z = a * Math.cos(t) * Math.sin(phi) + b * Math.sin(t) * Math.cos(phi);
		y = (major + x) * Math.sin(u);
		x = (major + x) * Math.cos(u);
		return new THREE.Vector3(x, y, z);
	}
};

var params = {
	slices: 40,
	stacks: 10,
	mobiusRadius: 3,
	mobiusStripWidth: 1,
	mobiusFlatness: 0.125,
	equation: 'mobius3d',
	wireframe: false
}

var img = new Image();
img.src = 'assets/map.png';

var texture = new THREE.Texture()
texture.minFilter = THREE.LinearFilter
texture.generateMipmap = false
texture.needsUpdate = true
texture.image = img
img.onload = function() {
  texture.needsUpdate = true;
}


var app = createOrbitViewer({
  clearColor: 0x000000,
  clearAlpha: 1.0,
  fov: 45,
  position: new THREE.Vector3(0, 0, 10)
});

var gui = new dat.GUI();

gui.add(params, 'mobiusRadius', 0, 10);
gui.add(params, 'mobiusStripWidth', 0, 10);
gui.add(params, 'mobiusFlatness', 0, 1);
gui.add(params, 'slices', 1, 100).step(1);
gui.add(params, 'stacks', 1, 100).step(1);
gui.add(params, 'equation', Object.keys(equations))
gui.add(params, 'wireframe')

console.log(params.equation);

var geo = new THREE.ParametricGeometry(equations[params.equation], params.slices, params.stacks);
// geo sphere = new THREE.SphereGeometry(1, 84, 84);
var mat = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
	// wireframe: true
});
var mesh = new THREE.Mesh(geo, mat);

app.scene.add(mesh);

app.on('tick', function(dt) {
	var m = app.scene.children[0];

	m.geometry = new THREE.ParametricGeometry(equations[params.equation], params.slices, params.stacks);
	m.material.wireframe = params.wireframe;
	m.needsUpdate = true;


});
