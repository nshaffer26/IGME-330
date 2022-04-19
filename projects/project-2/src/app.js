import { getMouse, getUnitVector, getRandom } from "./utils.js";
import { createEnemySprites } from "./helpers.js";
import PlayerSprite from "./PlayerSprite.js";
import BulletSprite from "./BulletSprite.js";
import * as audio from './audio.js';
export { fireInTime };

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const screenWidth = 600;
const screenHeight = 400;
canvas.width = screenWidth;
canvas.height = screenHeight;

const GameState = Object.freeze({
    START: Symbol("START"),
    MAIN: Symbol("MAIN"),
    LEVELOVER: Symbol("LEVELOVER"),
    GAMEOVER: Symbol("GAMEOVER")
});

// Audio
audio.setupWebaudio();

let player = new PlayerSprite(20, screenHeight / 2, { x: 1, y: 0 }, 1, 10, "blue");

// Input
// Look
let mouse = {};
canvas.addEventListener("mousemove", e =>
{
    mouse = getMouse(e);

    player.updateForward(mouse);
});

// Move
let keys = {};
window.addEventListener("keydown", e =>
{
    keys[e.code] = true;
});
window.addEventListener("keyup", e =>
{
    keys[e.code] = false;
});

let gameState = GameState.START;
let currentLevel = 1;

let enemies = [];
let vectorChangeProb = 0.001;

const BulletType = Object.freeze({
    NONE: Symbol("NONE"),
    CIRCLE: Symbol("CIRCLE"),
    TRIANGLE: Symbol("TRIANGLE"),
    SQUARE: Symbol("SQUARE"),
    DIAMOND: Symbol("DIAMOND")
});
let bulletSelection = [[], [], [], [], [], [], [], []];
let bullets = [];
let beatCounter = 0;

// TODO: Temp
bulletSelection[0].push(BulletType.NONE);
bulletSelection[1].push(BulletType.NONE);
bulletSelection[2].push(BulletType.NONE);
bulletSelection[3].push(BulletType.NONE);
bulletSelection[4].push(BulletType.NONE);
bulletSelection[5].push(BulletType.NONE);
bulletSelection[6].push(BulletType.NONE);
bulletSelection[7].push(BulletType.NONE);

let test = "NONE"
console.log(BulletType[test]);

// TODO: Add leveling
let margin = 50;
let rect = {
    left: screenWidth / 2 + margin,
    top: margin,
    width: screenWidth / 2 - margin * 2,
    height: screenHeight / 2 - margin * 2
}
enemies = enemies.concat(
    createEnemySprites(10, 20, 20, rect, 60, "red")
);

loop();

function loop(timestamp)
{
    // console.log(player.fwd);
    // Schedule a call to loop() in 1/60th of a second
    requestAnimationFrame(loop);

    // Draw background
    ctx.save();
    ctx.fillStyle = "rgb(240, 240, 240)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    ctx.restore();

    // Move player
    if (keys["KeyW"]) player.y -= player.speed;
    if (keys["KeyA"]) player.x -= player.speed;
    if (keys["KeyS"]) player.y += player.speed;
    if (keys["KeyD"]) player.x += player.speed;
    if (mouse.x && mouse.y) player.updateForward(mouse);

    // Draw player
    let angle = Math.atan2(player.fwd.y, player.fwd.x);
    player.draw(ctx, angle);

    // Draw enemies
    for (let e of enemies)
    {
        // Draw sprites
        angle = Math.atan2(e.fwd.y, e.fwd.x);
        e.draw(ctx, angle);

        // Move sprites
        e.move();

        // Left and right
        if (e.x <= 0 || e.x >= screenWidth - e.width)
        {
            e.reflectX();
            e.move();
        }
        if (e.y <= 0 || e.y >= screenHeight - e.width)
        {
            e.reflectY();
            e.move();
        }

        if (Math.random() < vectorChangeProb) e.fwd = getUnitVector(getRandom(-1, 1), getRandom(-1, 1));
    }

    // Draw bullets
    for (let i = 0; i < bullets.length; i++)
    {
        let b = bullets[i];
        // angle = Math.atan2(b.fwd.y, b.fwd.x);
        b.draw(ctx);
        b.move();

        if (b.x < 0 - b.radius || b.x > screenWidth + b.radius || b.y < 0 - b.radius || b.y > screenHeight + b.radius)
        {
            bullets.splice(i, 1);
        }
    }

    // Check collisions
    for (let i = 0; i < bullets.length; i++)
    {
        let b = bullets[i];
        for (let j = 0; j < enemies.length; j++)
        {
            let e = enemies[j];
            if (e.getRect().containsPoint({ x: b.x, y: b.y }))
            {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
            }
        }
    }
}

function fireInTime()
{
    // Stop after 8 half notes/16 quarter notes
    // if (beatCounter == 8)
    // {
    //     clearInterval(audio.intervalID);
    //     beatCounter = 0;
    //     return;
    // }
    // Reset counter
    if (beatCounter == 8)
    {
        beatCounter = 0;
        audio.beat.play();
    }

    for (let b of bulletSelection[beatCounter])
    {
        let fwd =
        {
            x: player.fwd.x,
            y: player.fwd.y
        };

        switch (b)
        {
            case BulletType.NONE:
                // TODO: Temp, should fire nothing
                let bullet = new BulletSprite(player.x + player.fwd.x * 2, player.y + player.fwd.y * 2, fwd, 120, 4, "black");
                bullets.push(bullet);
                break;

            case BulletType.CIRCLE:
                break;

            case BulletType.TRIANGLE:
                break;

            case BulletType.SQUARE:
                break;

            case BulletType.DIAMOND:
                break;
        }
    }

    beatCounter++;
}