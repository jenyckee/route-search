const glslify = require('glslify');
const audio = require('./lib/components/audio');
import { AE } from './lib/components/postprocess';
const EffectComposer = require('three-effectcomposer')(THREE)
require('./lib/components/postprocess')(THREE)

var group, camera, scene, renderer, pointsGeometry, controls, weight = 0, wireframe, composer;
init();
animate();
var Sound = audio(randomize, onPhase1, onPhase2);

function onPhase1() {
	weight = 4;
}

function onPhase2() {
	weight = 0;
}

function init() {
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );
	// camera
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 100 );
	scene.add( camera );
	
	// effect composer	
	composer = new EffectComposer(renderer);
	var copyPass = new EffectComposer.ShaderPass( EffectComposer.CopyShader );	
	composer.addPass(new EffectComposer.RenderPass(scene, camera));
	composer.addPass( copyPass );	
	var effect = new EffectComposer.ShaderPass( THREE.RGBShiftShader );
  effect.uniforms[ 'amount' ].value = 0.0015;
  effect.renderToScreen = true;
  composer.addPass( effect );

	// controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	scene.add( new THREE.AmbientLight( 0x222222 ) );
	// light
	var light = new THREE.PointLight( 0xffffff, 1 );
	camera.add( light );
	// helper
	// scene.add( new THREE.AxisHelper( 20 ) );
	
	// textures
	var loader = new THREE.TextureLoader();
	var texture = loader.load( '/assets/textures/sprites/disc.png' );
	group = new THREE.Group();
	scene.add( group );
	// points
	pointsGeometry = new THREE.DodecahedronGeometry( 10 );

	var pointsMaterial = new THREE.PointsMaterial( {
			color: 0xff0000,
			map: texture,
			size: 2,
			alphaTest: 0
	} );
	var points = new THREE.Points( pointsGeometry, pointsMaterial );
	group.add( points );

	var lineMaterial = new THREE.LineBasicMaterial( {
				color: 0xffffff,
	});
	const subdivisions = 300;
	
	const vert = glslify(__dirname + '/lib/shaders/tube.vert');
	const frag = glslify(__dirname + '/lib/shaders/tube.frag');
	const customLineMaterial = new THREE.RawShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		side: THREE.FrontSide,
		extensions: {
				deriviatives: true
		},
		defines: {
				lengthSegments: subdivisions.toFixed(1),
				ROBUST: false,
				ROBUST_NORMALS: true, // can be disabled for a slight optimization
				FLAT_SHADED: true
		},
		uniforms: {
				thickness: { type: 'f', value: 1 },
				time: { type: 'f', value: 0 },
				color: { type: 'c', value: new THREE.Color('#303030') },
				animateRadius: { type: 'f', value:10 },
				animateStrength: { type: 'f', value: 10 },
				index: { type: 'f', value: 0 },
				totalMeshes: { type: 'f', value: 40 },
				radialSegments: { type: 'f', value: 8 }
		}
	});

	wireframe = new THREE.LineSegments( pointsGeometry, lineMaterial );
	
	group.add( wireframe );

	window.addEventListener( 'resize', onWindowResize, false );
}

function randomize() {
	for ( var i = 0; i < pointsGeometry.vertices.length; i ++ ) {
			pointsGeometry.vertices[ i ] = ( randomPoint().multiplyScalar( 2 ) ); // wiggle the points
	}
	group.children.forEach(c => {
			c.geometry.verticesNeedUpdate = true;
	})
}

function ease() {
		for ( var i = 0; i < pointsGeometry.vertices.length; i ++ ) {
			pointsGeometry.vertices[ i ].add ( randomPoint().multiplyScalar( weight ).divideScalar(100) ); // wiggle the points
	}
	group.children.forEach(c => {
			c.geometry.verticesNeedUpdate = true;
	})
}

function randomPoint() {
	return new THREE.Vector3( THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 5, 5 ) );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(i) {
		requestAnimationFrame( animate );
		controls.update();
		ease(weight);
		if (weight) group.rotation.y += 0.005;
		render();
}

function render() {
	composer.render();
}
