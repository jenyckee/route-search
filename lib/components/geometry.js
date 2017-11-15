export function randomPoint() {
	return new THREE.Vector3( THREE.Math.randFloat( - 1, 1 ), THREE.Math.randFloat( - 1, 1 ), THREE.Math.randFloat( - 1, 1 ) );
}

export default class Geometry {
	constructor(pointsMaterial, lineMaterial) {
		this.group = new THREE.Group();
		this.pointsGeometry = new THREE.DodecahedronGeometry( 2 );
		this.points = new THREE.Points( this.pointsGeometry, pointsMaterial );
		this.group.add( this.points );
	
		this.wireframe = new THREE.LineSegments( this.pointsGeometry, lineMaterial );
		
		this.group.add( this.wireframe );
		return this
	}

	randomize() {
		for ( var i = 0; i < this.pointsGeometry.vertices.length; i ++ ) {
				this.pointsGeometry.vertices[ i ] = ( randomPoint().multiplyScalar( 2 ) ); // wiggle the points
		}
		this.group.children.forEach(c => {
				c.geometry.verticesNeedUpdate = true;
		})
	}
	
	ease(weight) {
		for ( var i = 0; i < this.pointsGeometry.vertices.length; i ++ ) {
			this.pointsGeometry.vertices[ i ].add ( randomPoint().multiplyScalar( weight ).divideScalar(100) ); // wiggle the points
		}
		this.group.children.forEach(c => {
				c.geometry.verticesNeedUpdate = true;
		})
	}
}

