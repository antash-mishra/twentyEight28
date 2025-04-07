import * as THREE from 'three'
const textureLoader = new THREE.TextureLoader();

let cardFrontTexture: THREE.Texture;
let cardBackTexture: THREE.Texture;
let cards: THREE.Group[] = []

// Spritesheet config
const cardScale: number = 2;
const numColumnsFront: number = 13;
const numRowsFront: number = 4;
// Calculate UV dimensions
const cardWidthUVFront = 1 / numColumnsFront;
const cardHeightUVFront = 1 / numRowsFront;


const createCard = (frontIndex, backIndex) => {
    console.log("Creating cards...");
    
    if (!cardFrontTexture || !cardBackTexture) {
        console.log("Card front texture not loaded yet.");
        return;
    }
            
    // Create materials for front and back
    const frontMaterial: THREE.SpriteMaterial = new THREE.SpriteMaterial({ 
      map: cardFrontTexture
    });
    const frontSprite = new THREE.Sprite(frontMaterial);

    // Calculate UV offset for the specific card front
    const frontRow = Math.floor(frontIndex / numColumnsFront); // Assuming you know numColumnsFront
    const frontCol = frontIndex % numColumnsFront;
    frontMaterial.map?.offset.set(frontCol * cardWidthUVFront, 1 - (frontRow + 1) * cardHeightUVFront);
    frontMaterial.map?.repeat.set(cardWidthUVFront, cardHeightUVFront);

    const backMaterial = new THREE.SpriteMaterial({ 
        map: cardBackTexture
    });
    const backSprite = new THREE.Sprite(backMaterial);

    const card = new THREE.Group();
    card.add(frontSprite);
    card.add(backSprite);
    
    // Initially show the back of the card
    frontSprite.visible = false;
    backSprite.visible = true;

    card.userData = {
        frontIndex: frontIndex,
        backIndex: backIndex
    }

    // You might want to scale the sprites to your desired card size
    const aspectRatioFront = frontMaterial.map?.image.width / numColumnsFront / (frontMaterial.map?.image.height / numRowsFront);
    frontSprite.scale.set(cardScale * aspectRatioFront, cardScale, 1);

    const aspectRatioBack = backMaterial.map?.image.width / (backMaterial.map?.image.height);
    backSprite.scale.set(cardScale * aspectRatioBack, cardScale, 1);


    return card
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
        const card = createCard(0, 0);
        return card;
    })
    .catch(error => {
        console.error("Failed to load card textures:", error);
        throw error; // Re-throw to allow handling in the main code
    });

export { cardsPromise };


