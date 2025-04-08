import * as THREE from 'three'
const textureLoader = new THREE.TextureLoader();

let cardFrontTexture: THREE.Texture;
let cardBackTexture: THREE.Texture;
let cards: THREE.Group[] = []
let dealtCards: THREE.Group[] = []
let dealtOpponentCards: THREE.Group[] = []

// Spritesheet config
const cardScale: number = 1.0;
const numColumnsFront: number = 13;
const numRowsFront: number = 4;
// Calculate UV dimensions
const cardWidthUVFront = 1 / numColumnsFront;
const cardHeightUVFront = 1 / numRowsFront;


const createCard = (frontIndex: number) => {
    console.log("Creating cards...");
    
    if (!cardFrontTexture || !cardBackTexture) {
        console.log("Card front texture not loaded yet.");
        return;
    }

    let frontTextureClone = cardFrontTexture.clone();
    frontTextureClone.needsUpdate = true;
            
    // Create materials for front and back
    let frontMaterial: THREE.SpriteMaterial = new THREE.SpriteMaterial({ 
      map: frontTextureClone
    });
    let frontSprite = new THREE.Sprite(frontMaterial);

    // Calculate UV offset for the specific card front
    let frontRow = Math.floor(frontIndex / numColumnsFront); // Assuming you know numColumnsFront
    let frontCol = frontIndex % numColumnsFront;
    frontMaterial.map?.offset.set(frontCol * cardWidthUVFront, 1 - (frontRow + 1) * cardHeightUVFront);
    frontMaterial.map?.repeat.set(cardWidthUVFront, cardHeightUVFront);

    let backTextureClone = cardBackTexture.clone();
    backTextureClone.needsUpdate = true;


    let backMaterial = new THREE.SpriteMaterial({ 
        map: backTextureClone
    });
    let backSprite = new THREE.Sprite(backMaterial);

    let card = new THREE.Group();
    card.add(frontSprite);
    card.add(backSprite);
    
    // Initially show the front of the card
    frontSprite.visible = true;
    backSprite.visible = false;

    card.userData = {
        frontIndex: frontIndex,
        suit: Math.floor(frontIndex / 13), // 0-3 for suits
        value: frontIndex % 13 // 0-12 for values
    }

    // You might want to scale the sprites to your desired card size
    const aspectRatioFront = frontMaterial.map?.image.width / numColumnsFront / (frontMaterial.map?.image.height / numRowsFront);
    frontSprite.scale.set(cardScale * aspectRatioFront, cardScale, 1);

    const aspectRatioBack = backMaterial.map?.image.width / (backMaterial.map?.image.height);
    backSprite.scale.set(cardScale * aspectRatioBack, cardScale, 1);

    cards.push(card);
    return card
}


// Create a Promise that resolves when cards are ready
// const cardsPromise = new Promise<THREE.Mesh[]>((resolve) => {
//     console.log("Loading texture...");
    
// });


const frontCardPromise = new Promise<THREE.Texture>((resolve) => {
    console.log("Loading texture...");
    textureLoader.load('./assets/cards/sheets/classic.png', (texture) => {
        cardFrontTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        
        // Create cards after texture is loaded
        resolve(texture);
    }, undefined, (onerror) => {
        console.log("Error loading texture: ", onerror);
    });
});


const backCardPromise = new Promise<THREE.Texture>((resolve) => {
    textureLoader.load('./assets/cards/Backs/Card-Back-03.png', (texture) => {
        cardBackTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        resolve(texture)
    }, undefined, (onerror) => {
        console.log("Error loading texture: ", onerror);
    });
        
})

function shuffle() {
    // Fisher-Yates shuffle algorithm
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }
  

function createCards() {
    console.log("Creating cards...");
    
    // Create all cards
    for (let i = 0; i < 52; i++) {
        
        createCard(i);
    }
}

function dealCards(position, rotation) {
    console.log("Dealing cards...");
    const minimum = 0;
    let maximum1 = position.length - 1;

    // Deal 5 cards to user
    for (let i = 0; i < 5; i++) {
        const card = cards.pop();
        let rNum =  Math.floor(Math.random() * (maximum1 - minimum + 1)) + minimum;

        if (card) {

            card.name = "hand playerCard"
            card.position.copy(position[i]);
            const euler = new THREE.Euler(rotation[i].x, rotation[i].y, rotation[i].z, 'XYZ');
            card.children[0].material.rotation = euler.z;
            dealtCards.push(card);
        }
    }
}

function dealCardsOpponent(position, rotation) {
    console.log("Dealing cards...");
    const minimum = 0;
    let maximum1 = position.length - 1;

    // Deal 5 cards to user
    for (let i = 0; i < 5; i++) {
        const card = cards.pop();
        let rNum =  Math.floor(Math.random() * (maximum1 - minimum + 1)) + minimum;

        if (card) {
            
            card.name = "opponentCard"
            card.scale.set(0.65, 0.65, 0.65);
            card.position.copy(position[i]);
            const euler = new THREE.Euler(rotation[i].x, rotation[i].y, rotation[i].z, 'XYZ');
            card.children[0].material.rotation = euler.z;
            card.children[0].visible = false;
            card.children[1].visible = true;
            dealtOpponentCards.push(card);
        }
    }
}

// Call create cards when front and back card textures are loaded
const cardsPromise = Promise.all([frontCardPromise, backCardPromise])
    .then(() => {
        createCards();
        shuffle();
        const myCardsPositions = [
            new THREE.Vector3(0.50, 4.004, 4.21),
            new THREE.Vector3(0.25, 4.003, 4.17),
            new THREE.Vector3(0, 4.002, 4.15),
            new THREE.Vector3(-0.25, 4.001, 4.13),
            new THREE.Vector3(-0.50, 4, 4.10)
        ];
        
        const myCardsRotations = [
            new THREE.Vector3(-Math.PI / 2, 0, -0.15),
            new THREE.Vector3(-Math.PI / 2, 0, -0.10),
            new THREE.Vector3(-Math.PI / 2, 0, 0),
            new THREE.Vector3(-Math.PI / 2, 0, 0.10),
            new THREE.Vector3(-Math.PI / 2, 0, 0.15)
        ];

        const opponentCardsPositions = [
            new THREE.Vector3(0.5, 6.98, 2.5),
            new THREE.Vector3(0.25, 7.0, 2.501),
            new THREE.Vector3(0, 7.015, 2.502),
            new THREE.Vector3(-0.25, 7.0, 2.503),
            new THREE.Vector3(-0.5, 6.98, 2.504)
        ];
        
        const opponentCardsRotations = [
            new THREE.Vector3(2 * Math.PI, Math.PI, 0.15),
            new THREE.Vector3(2 * Math.PI, Math.PI, 0.10),
            new THREE.Vector3(2 * Math.PI, Math.PI, 0),
            new THREE.Vector3(2 * Math.PI, Math.PI, -0.10),
            new THREE.Vector3(2 * Math.PI, Math.PI, -0.15)
        ];
        
        dealCards(myCardsPositions, myCardsRotations);
        dealCardsOpponent(opponentCardsPositions, opponentCardsRotations);

        console.log(dealtCards)
        return [dealtCards, dealtOpponentCards];

    })
    .catch(error => {
        console.error("Failed to load card textures:", error);
        throw error; // Re-throw to allow handling in the main code
    });

export { cardsPromise };