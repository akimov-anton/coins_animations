// Import the necessary classes from PIXI
import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import TweenVars = gsap.TweenVars;
import {AnimatedSprite} from "pixi.js/lib/scene/sprite-animated/AnimatedSprite";

// register the plugin
gsap.registerPlugin(PixiPlugin);

// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

// Create a PIXI Application
const app = new PIXI.Application();

const COINS_COUNT = 21;


async function setup(): Promise<void> {

    await app.init({resizeTo: window});


    document.body.appendChild(app.canvas);

}

async function preload()
{
    const assets = [
        { alias: 'spritesheet', src: 'assets/spritesheet.png' },
        { alias: 'brightness', src: 'assets/brightness.png' },
    ];

    // Load the assets defined above.
    await PIXI.Assets.load(assets);
}

function createAtlasObject() {
    const frames = 7;
    const frameWidth = 137;
    const frameHeight = 137;

    const atlas =  {
        frames: {

        },
        meta: {
            image: 'assets/spritesheet.png',
            format: 'RGBA8888',
            size: { w: 966, h: 137 },
            scale: 1
        },
        animations: {
            coin: [] //array of frames by name
        }
    };

    for (let i = 0; i < frames; i++) {
        atlas.frames[`step${i}`] = {
            frame: { x: i * frameWidth, y: 0, w: frameWidth, h: frameHeight },
            sourceSize: { w: frameWidth, h: frameHeight },
            spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight }
        };
        atlas.animations.coin.push(`step${i}`);
    }

    return atlas;
}

async function prepareSpriteSheet() {
    const atlasData = createAtlasObject();

    const spritesheet = new PIXI.Spritesheet(
        PIXI.Texture.from(atlasData.meta.image),
        atlasData
    );

    await spritesheet.parse();
    return spritesheet;
}

async function createCoins(): Promise<AnimatedSprite[]> {
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const spritesheet = await prepareSpriteSheet();
    const coins = [];

    for (let i = 0; i < COINS_COUNT; i++) {
        const anim = new PIXI.AnimatedSprite(spritesheet.animations.coin);

        anim.animationSpeed = 0.1666;

        anim.x = centerX;
        anim.y = centerY;

        anim.anchor.set(0.5);
        anim.scale.set(0.5);
        anim.alpha = 0;

        app.stage.addChild(anim);

        coins.push(anim);
    }
    return coins;
}

function createBrightness(): void {
    const br = PIXI.Sprite.from('brightness');
    br.x = app.screen.width / 2;
    br.y = app.screen.height / 2;
    br.anchor.set(0.5);

    app.stage.addChild(br);
}

function moveCoins(coins): void {
    const angles = shuffleArray([12, 40, 90, 130, 200, 280, 360]);
    const angles2 = shuffleArray([35, 66, 110, 180, 240, 290, 355]);
    const angles3 = shuffleArray([10, 55, 90, 130, 220, 260, 310]);
    const tl = gsap.timeline({repeat: -1});
    const tl2 = gsap.timeline({repeat: -1, delay: 0.7});
    const tl3 = gsap.timeline({repeat: -1, delay: 1.8});

    coins.slice(0, 7).forEach((coin, index) => {
        const config = moveCoinConfig(coin, angles[index], 0);
        tl.add(gsap.to(coin, config), '<5%');
    });

    coins.slice(7, 14).forEach((coin, index) => {
        const config = moveCoinConfig(coin, angles2[index], 0);
        tl2.add(gsap.to(coin, config), '<5%');
    });

    coins.slice(14, 21).forEach((coin, index) => {
        const config = moveCoinConfig(coin, angles3[index], 0);
        tl3.add(gsap.to(coin, config), '<5%');
    });
}

function moveCoinConfig(coin, angle, delay): TweenVars {
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;
    const screenRadius = Math.sqrt((centerX) ** 2 + (centerY) ** 2);

    const edgeX = centerX + screenRadius * Math.cos(angle * (Math.PI/180));
    const edgeY = centerY + screenRadius * Math.sin(angle * (Math.PI/180));

    const scale = random(0.8, 1.4);

    const randomX =  centerX + random(0, 50) * Math.cos(angle * (Math.PI/180));
    const randomY =  centerY + random(0, 50) * Math.cos(angle * (Math.PI/180));

    coin.x = randomX;
    coin.y = randomY;

    return {
        pixi: { scaleX: scale, scaleY: scale, rotation: random(0, 180), x: edgeX, y: edgeY },
        ease: "none",
        duration: 3,
        delay,
        onStart() {
            coin.alpha = 1;
            coin.play();
        },
        onComplete() {
            coin.alpha = 0;
        }
    }
}

function random(min, max): number {
    return Math.random() * (max - min) + min;
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

(async () => {
    await setup();
    await preload();

    const coins = await createCoins();
    createBrightness();

    moveCoins(coins);

})();