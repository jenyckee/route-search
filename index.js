const glslify = require('glslify');
const audio = require('./lib/components/audio');
import { AE } from './lib/components/postprocess';
const EffectComposer = require('three-effectcomposer')(THREE)
require('./lib/components/postprocess')(THREE)
import Geometry from './lib/components/geometry'

var camera, scene, renderer, controls, weight = 0, composer, geometries = [];
init();
animate();
var Sound = audio(randomize, onPhase1, onPhase2);

function randomize() {
	geometries.forEach(g => {g.randomize()})
}

function onPhase1() {
	weight = 20;
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
  copyPass.renderToScreen = true;

	// controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	scene.add( new THREE.AmbientLight( 0x222222 ) );
	// light
	var light = new THREE.PointLight( 0xffffff, 1 );
	camera.add( light );
	
	// textures
	var loader = new THREE.TextureLoader();
	var texture = loader.load( '/assets/textures/sprites/disc.png' );
	// points

	var pointsMaterial = new THREE.PointsMaterial({
		color: 0xff0000,
		map: texture,
		size: 0.75,
		alphaTest: 0
	});

	var lineMaterial = new THREE.LineBasicMaterial( {
		color: 0xffffff,
	});
	const offsetX = 40;
	const offsetY = 30;
	
	for (var i = 0; i< 8; i++) {
		for (var j = 0; j< 7; j++) {
			var geometry = new Geometry(pointsMaterial, lineMaterial)
			geometry.group.position.x += i*10 - offsetX
			geometry.group.position.y += j*10 - offsetY
			scene.add( geometry.group );
			geometries.push(geometry)
		}
	}

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(i) {
	requestAnimationFrame( animate );
	controls.update();

	geometries.forEach(g => g.ease(weight))
	if (weight)
		geometries.forEach(g => g.group.rotation.y += 0.025)
	render();
}

function render() {
	composer.render();
}
