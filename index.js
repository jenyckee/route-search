const glslify = require('glslify');

var group, camera, scene, renderer, pointsGeometry, controls;
init();
animate();
window.addEventListener('click', randomize);
// setInterval(randomize, 100);
function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    // camera
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0, 75 );
    scene.add( camera );
    // controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.minDistance = 20;
    // controls.maxDistance = 50;
    // controls.maxPolarAngle = Math.PI / 2;
    scene.add( new THREE.AmbientLight( 0x222222 ) );
    // light
    var light = new THREE.PointLight( 0xffffff, 1 );
    camera.add( light );
    // helper
    scene.add( new THREE.AxisHelper( 20 ) );
    // textures
    var loader = new THREE.TextureLoader();
    var texture = loader.load( '/assets/textures/sprites/disc.png' );
    group = new THREE.Group();
    scene.add( group );
    // points
    pointsGeometry = new THREE.DodecahedronGeometry( 5 );
    for ( var i = 0; i < pointsGeometry.vertices.length; i ++ ) {
        pointsGeometry.vertices[ i ].add( randomPoint().multiplyScalar( 2 ) ); // wiggle the points
    }
    var pointsMaterial = new THREE.PointsMaterial( {
        color: 0x0080ff,
        map: texture,
        size: 1,
        alphaTest: 0.5
    } );
    var points = new THREE.Points( pointsGeometry, pointsMaterial );
    group.add( points );
    // convex hull
    var meshMaterial = new THREE.MeshLambertMaterial( {
        color: 0xffffff,
        opacity: 0.0,
        transparent: true
    } );
    var lineMaterial = new THREE.LineBasicMaterial( {
         color: 0xffffff,
        //  linewidth: 40
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
					animateRadius: { type: 'f', value: 10 },
					animateStrength: { type: 'f', value: 10 },
					index: { type: 'f', value: 0 },
					totalMeshes: { type: 'f', value: 40 },
					radialSegments: { type: 'f', value: 8 }
			}
			});
    
    var wireframe = new THREE.LineSegments( pointsGeometry, lineMaterial );
    
    scene.add( wireframe );

    var meshGeometry = new THREE.ConvexBufferGeometry( pointsGeometry.vertices );
    var mesh = new THREE.Mesh( meshGeometry, meshMaterial );
    mesh.material.side = THREE.BackSide; // back faces
    mesh.renderOrder = 0;
    group.add( mesh );

    var mesh = new THREE.Mesh( meshGeometry, meshMaterial.clone() );
    mesh.material.side = THREE.FrontSide; // front faces
    mesh.renderOrder = 1;
    group.add( mesh );
    //
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
        pointsGeometry.vertices[ i ].add ( randomPoint().multiplyScalar( 2 ).divideScalar(100) ); // wiggle the points
    }
    group.children.forEach(c => {
        c.geometry.verticesNeedUpdate = true;
    })
}

function randomPoint() {
    return new THREE.Vector3( THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 5, 5 ), THREE.Math.randFloat( - 1, 1 ) );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate(i) {
		requestAnimationFrame( animate );
		controls.update();		
    ease();
    render();
}
function render() {
    renderer.render( scene, camera );
}