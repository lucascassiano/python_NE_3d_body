import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();


const MAX_POINTS = 500;
const positions = new Float32Array(MAX_POINTS * 3);
let line;


let nose;

function drawBody(pose) {
	positions[0] = new THREE.Vector3(pose[0].x, pose[0].y, pose[0].z);
	positions[1] = new THREE.Vector3(pose[1].x, pose[1].y, pose[1].z);

	positions[0] = new THREE.Vector3(pose[0].x, pose[0].y, pose[0].z);
	positions[4] = new THREE.Vector3(pose[4].x, pose[4].y, pose[4].z);
	line.geometry.position.needsUpdate = true;


	nose.position.set(pose[0].x, pose[0].y, pose[0].z);
	// pose_geometry.attributes.position.needsUpdate = true;
}

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf4f4f4);
	scene.fog = new THREE.FogExp2(0xf4f4f4, 0.002);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(10, 10, 10);

	// controls

	controls = new OrbitControls(camera, renderer.domElement);
	controls.listenToKeyEvents(window); // optional

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	// controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	// controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	// controls.minDistance = 100;
	// controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;

	window.addEventListener('resize', onWindowResize);



	const size = 10;
	const divisions = 10;

	const gridHelper = new THREE.GridHelper(size, divisions);
	scene.add(gridHelper);

	//intializing body parts
	const geometry = new THREE.BufferGeometry();

	geometry.position = new THREE.BufferAttribute(positions, 3);

	const material = new THREE.LineBasicMaterial({
		color: 0x0022ff
	});

	line = new THREE.Line(geometry, material);
	// line.geometry.attributes.position.needsUpdate = true;
	scene.add(line);

	const nose_geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
	const nose_material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	nose = new THREE.Mesh(nose_geometry, nose_material);
	scene.add(nose);



	//Setup WebSocket
	const ws = new WebSocket("ws://127.0.0.1:8765/");
	ws.onmessage = function (event) {
		const data = JSON.parse(event.data);
		const { pose } = data;
		console.log(pose);
		drawBody(pose);
	};

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	requestAnimationFrame(animate);

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();

}

function render() {

	renderer.render(scene, camera);

}


