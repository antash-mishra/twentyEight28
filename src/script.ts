import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { cardsPromise } from './card'
import gsap from 'gsap';

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

// 
let hoveredCard;
let cards, opponentCards
const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();


// renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.setClearColor(0xFEFEFE);
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap 
renderer.toneMapping = THREE.ACESFilmicToneMapping
document.body.appendChild(renderer.domElement)

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0,10,6)
camera.lookAt(new THREE.Vector3(0,6,2))
scene.add(camera)

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.y = 10;
scene.add(directionalLight)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)

const ambientLight = new THREE.AmbientLight(0xA3A3A3, 0.3)
scene.add(ambientLight)

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Creates a 12 by 12 grid helper.
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

// Creates an axes helper with an axis length of 4.
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
);
sphere.castShadow = true;
// scene.add(sphere);

// Load model
gltfLoader.load('./assets/kitchen_table.glb', (gltf) => {
    const model = gltf.scene;
  
    scene.add(model);
    
    model.rotateY(Math.PI / 2)
    model.scale.set(0.25, 0.25, 0.25)
    model.position.set(0.25, 0, 0)   

    model.traverse(function(node) {
        if (node.isMesh) {
            node.receiveShadow = true;
        }
    })
});

// Load cards
async function initScene() {
    [cards, opponentCards] = await cardsPromise;
    
    cards.forEach(card => {
        // Add cards to your scene
        scene.add(card);
    });    
    opponentCards.forEach(card => {
        scene.add(card);
    })
}

// CLick event to move the card
window.addEventListener('click', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 -1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(cards);
    console.log(intersects)

    if(intersects.length > 0) {
        const clickedCard= intersects[0].object.parent;
        if(clickedCard.name === "hand playerCard") {
            hoveredCard = clickedCard;
            clickedCard.name = hoveredCard.name.replace('hand ', '')
        }
    }

    if (hoveredCard) {
        const tl = gsap.timeline({
            defaults: {duration: 0.4, delay: 0.1}
        });

        tl.to(hoveredCard.children[0].material, {
            rotation: 0
        })

        tl.to(hoveredCard.position, {
            y:3.18,
            z:0.9
        }, 0);
        let hoveredCName = hoveredCard.name;
        hoveredCard = null;

    }
})

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()  
    
    // Update smoke uniform time
    // smokeMaterial.uniforms.uTime.value = elapsedTime
    
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
    
    tick()
    initScene();
