import * as THREE from 'three'
const textureLoader = new THREE.TextureLoader();

let cardFrontTexture: THREE.Texture;
let cardBackTexture: THREE.Texture;
let cards: THREE.Group[] = []

// Spritesheet config
const numColumnsFront: number = 13;
const numRowsFront: number = 4;

const createCards = () => {
    console.log("Creating cards...");
    
    if (!cardFrontTexture || !cardBackTexture) {
        console.log("Card front texture not loaded yet.");
        return;
    }

    console.log("Texture: ", cardFrontTexture, cardBackTexture);

    // Card geometry
    const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(0.7, 1)

    const cols = 13;
    const rows = 4;

    for (let suit=0; suit < 4; suit++) {
        for (let value=0; value < 13; value++) {
            // Calculate UV coordinates for this card in the texture atlas
            const uMin = value / cols;
            const uMax = (value + 1) / cols;
            const vMin = suit / rows;
            const vMax = (suit + 1) / rows;
            
            // Clone the geometry and modify UV coordinates to point to correct card in atlas
            const frontGeometry = geometry.clone();
            const uvs = frontGeometry.attributes.uv.array;
            
            // Bottom left
            uvs[0] = uMin;
            uvs[1] = vMin;
            
            // Bottom right
            uvs[2] = uMax;
            uvs[3] = vMin;
            
            // Top left
            uvs[4] = uMin;
            uvs[5] = vMax;
            
            // Top right
            uvs[6] = uMax;
            uvs[7] = vMax;
            
            // Create materials for front and back
            const frontMaterial = new THREE.MeshBasicMaterial({ 
              map: cardFrontTexture,
              side: THREE.FrontSide
            });

            const backMaterial = new THREE.MeshBasicMaterial({ 
                map: cardBackTexture,
                side: THREE.BackSide
            });

            const cardGroup = new THREE.Group();

            // Create front and back meshes
            const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
            frontMesh.castShadow = true;
            
            // Back side (using same geometry but different material)
            const backGeometry = geometry.clone();
            const backMesh = new THREE.Mesh(backGeometry, backMaterial);
            backMesh.castShadow = true;
            
            // Add both meshes to the group
            cardGroup.add(frontMesh);
            cardGroup.add(backMesh);
            
            // Store card data
            cardGroup.userData = {
                suit: suit,
                value: value
            };

            cards.push(cardGroup);
        }
    }
}


// Create a Promise that resolves when cards are ready
// const cardsPromise = new Promise<THREE.Mesh[]>((resolve) => {
//     console.log("Loading texture...");
    
// });


const frontCardPromise = new Promise<THREE.Texture>((resolve) => {
    console.log("Loading texture...");
    textureLoader.load('./assets/cards/sheets/classic.png', (texture) => {
        console.log("Texture loaded F...", texture);
        cardFrontTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        
        // Create cards after texture is loaded
        console.log("Creating cards F...");
        resolve(texture);
    }, undefined, (onerror) => {
        console.log("Error loading texture: ", onerror);
    });
});


const backCardPromise = new Promise<THREE.Texture>((resolve) => {
    textureLoader.load('./assets/cards/Backs/Card-Back-03.png', (texture) => {
        console.log("Texture loaded B...", texture);
        cardBackTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        console.log("Creating cards B...");
        resolve(texture)
    }, undefined, (onerror) => {
        console.log("Error loading texture: ", onerror);
    });
        
})

// Call create cards when front and back card textures are loaded
const cardsPromise = Promise.all([frontCardPromise, backCardPromise])
    .then(() => {
        createCards();
        return cards;
    })
    .catch(error => {
        console.error("Failed to load card textures:", error);
        throw error; // Re-throw to allow handling in the main code
    });

export { cardsPromise };






