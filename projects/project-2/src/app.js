import { getMouse, getUnitVector, getRandom, checkCollision } from "./utils.js";
import { createEnemySprites } from "./helpers.js";
import PlayerSprite from "./PlayerSprite.js";
import BulletSprite from "./BulletSprite.js";
import * as audio from './audio.js';
export { fireInTime };

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const screenWidth = 600;
const screenHeight = 400;
const topMargin = 40;
canvas.width = screenWidth;
canvas.height = screenHeight;

window.onblur = () =>
{
    paused = true;
};
window.onfocus = () =>
{
    paused = false;
    loop();
};

let lastTime = 0;
let dt = 0;
let paused = false;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

let beatCounter = 0;
let maxBeats = 8;

const GameState = Object.freeze({
    START: Symbol("START"),
    MAIN: Symbol("MAIN"),
    LEVELOVER: Symbol("LEVELOVER"),
    GAMEOVER: Symbol("GAMEOVER")
});

// Audio
audio.setupWebaudio();

let player = new PlayerSprite(20, screenHeight / 2, { x: 1, y: 0 }, 100, 10, "blue");

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

// Staff
let temps = document.querySelector("#circle-symbol");
temps.parentNode.dataset.type
let notes = document.querySelectorAll(".note-selection");
notes.forEach(note => note.addEventListener("click", e =>
{
    let selection = e.target;
    if (selection.nodeName == "IMG") selection = selection.parentNode;

    let type = selection.parentNode.dataset.type;

    if (selection.dataset.selected == "true")
    {
        selection.dataset.selected = "false";
        selection.innerHTML = "";

        activeBullets[type]--;
        bulletSelection[selection.dataset.beat].splice(bulletSelection[selection.dataset.beat].indexOf(BulletType[selection.dataset.type]), 1)
    }
    else
    {
        if (activeBullets.total() == maxActiveBullets) return;
        if (activeBullets[type] == inventoryBullets[type]) return;

        selection.dataset.selected = "true";
        activeBullets[type]++;

        switch (type)
        {
            case "CIRCLE":
                selection.innerHTML = `<img src="./images/circle.png" alt="circle">`;
                bulletSelection[selection.dataset.beat].push(BulletType.CIRCLE);
                break;
            case "TRIANGLE":
                selection.innerHTML = `<img src="./images/triangle.png" alt="triangle">`;
                bulletSelection[selection.dataset.beat].push(BulletType.TRIANGLE);
                break;
            case "SQUARE":
                selection.innerHTML = `<img src="./images/square.png" alt="square">`;
                bulletSelection[selection.dataset.beat].push(BulletType.SQUARE);
                break;
            case "HEXAGON":
                selection.innerHTML = `<img src="./images/hexagon.png" alt="hexagon">`;
                bulletSelection[selection.dataset.beat].push(BulletType.HEXAGON);
                break;
            default: break;
        }
    }
}));

let gameState = GameState.START;
let currentLevel = 1;

let enemies = [];
let vectorChangeProb = 0.001;

// Bullets
const BulletType = Object.freeze({
    NONE: Symbol("NONE"),
    CIRCLE: Symbol("CIRCLE"),
    TRIANGLE: Symbol("TRIANGLE"),
    SQUARE: Symbol("SQUARE"),
    HEXAGON: Symbol("HEXAGON")
});
let activeIndicator = document.querySelector("#active-bullets");
let maxIndicator = document.querySelector("#max-active-bullets");
let numCirclesIndicator = document.querySelector("#num-circles");
let numTrianglesIndicator = document.querySelector("#num-triangles");
let numSquaresIndicator = document.querySelector("#num-squares");
let numHexagonsIndicator = document.querySelector("#num-hexagons");
let circleGenre = document.querySelector("#CIRCLE-genre-selection");
let triangleGenre = document.querySelector("#TRIANGLE-genre-selection");
let squareGenre = document.querySelector("#SQUARE-genre-selection");
let hexagonGenre = document.querySelector("#HEXAGON-genre-selection");
const maxActiveBullets = 8; // TODO: 8?
let inventoryBullets = {
    CIRCLE: 0,
    TRIANGLE: 0,
    SQUARE: 0,
    HEXAGON: 0,
    total: function () { return this.CIRCLE + this.TRIANGLE + this.SQUARE + this.HEXAGON; }
}
let activeBullets = {
    CIRCLE: 0,
    TRIANGLE: 0,
    SQUARE: 0,
    HEXAGON: 0,
    total: function () { return this.CIRCLE + this.TRIANGLE + this.SQUARE + this.HEXAGON; }
}
let bulletSelection = [[], [], [], [], [], [], [], []];
let bullets = [];
let explodeInterval = null;
let implodeInterval = null;
// TODO:
/*
Time player for score:
- Bonus score for hitting enemies to beat?
- High scores from JSON
2 Random bullets at end of level:
- Tier 1: ["HEALTH", "CIRCLE", "CIRCLE", "CIRCLE"]
- Tier 2: ["CIRCLE", "CIRCLE", "CIRCLE", "SQUARE", "SQUARE", "TRIANGLE"]
- Tier 3: ["HEALTH", "CIRCLE", "CIRCLE", "SQUARE", "SQUARE", "TRIANGLE", "TRIANGLE", "HEXAGON"]
- Tier 4: ["HEALTH", "CIRCLE", "SQUARE", "SQUARE", "TRIANGLE", "TRIANGLE", "TRIANGLE", "HEXAGON"]
- Colors change for each world
Show number of each bullet:
- Can only place max of 8? bullets
Enemies:
- Bounce around screen (solid color)
- Chase player (solid color, outline tip)
- Chase player and shoot to half-note (solid color, solid tip)
- Avoid player and shoot to half-note (solid color, solid tip, bigger)
Genres:
- Classical (black/white)
- Vaporwave/Retro (warm colors, contrasts)
- Arcade (neon, outlines, black background)
- Neon? (neon colors, outlines)
*/
// TODO: Temp
// bulletSelection[0].push(BulletType.NONE);
// bulletSelection[1].push(BulletType.NONE);
// bulletSelection[2].push(BulletType.NONE);
// bulletSelection[3].push(BulletType.NONE);
// bulletSelection[4].push(BulletType.NONE);
// bulletSelection[5].push(BulletType.NONE);
// bulletSelection[6].push(BulletType.NONE);
// bulletSelection[7].push(BulletType.NONE);
inventoryBullets.CIRCLE = 3;
inventoryBullets.TRIANGLE = 3;
inventoryBullets.SQUARE = 3;
inventoryBullets.HEXAGON = 3;

let test = "NONE"
console.log(BulletType[test]);

// TODO: Add leveling
let margin = 60;
let rect = {
    left: screenWidth / 2 + margin,
    top: topMargin + margin,
    width: screenWidth / 2 - margin * 2,
    height: screenHeight / 2 - margin * 2
}
enemies = enemies.concat(
    createEnemySprites(10, 3, rect, "red")
);

loop();

function loop(timestamp = 0)
{
    if (paused) return;

    requestAnimationFrame(loop);
    dt = (timestamp - lastTime) / 1000;
    dt = clamp(dt, 1 / 144, 1 / 12);
    lastTime = timestamp;

    // Update counts in UI
    activeIndicator.innerHTML = activeBullets.total();
    maxIndicator.innerHTML = maxActiveBullets;
    numCirclesIndicator.innerHTML = inventoryBullets.CIRCLE - activeBullets.CIRCLE;
    numTrianglesIndicator.innerHTML = inventoryBullets.TRIANGLE - activeBullets.TRIANGLE;
    numSquaresIndicator.innerHTML = inventoryBullets.SQUARE - activeBullets.SQUARE;
    numHexagonsIndicator.innerHTML = inventoryBullets.HEXAGON - activeBullets.HEXAGON;

    // Draw background
    ctx.save();
    ctx.fillStyle = "rgb(240, 240, 240)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    ctx.restore();

    // Move player
    if (keys["KeyW"]) player.y -= player.speed * dt;
    if (keys["KeyA"]) player.x -= player.speed * dt;
    if (keys["KeyS"]) player.y += player.speed * dt;
    if (keys["KeyD"]) player.x += player.speed * dt;
    if (mouse.x && mouse.y) player.updateForward(mouse);

    // Draw player
    let angle = Math.atan2(player.fwd.y, player.fwd.x);
    player.draw(ctx, angle);

    // Draw player health
    player.displayHealth(ctx);

    // Draw enemies
    for (let e of enemies)
    {
        // Draw sprites
        angle = Math.atan2(e.fwd.y, e.fwd.x);
        e.draw(ctx, angle);

        // Move sprites
        if (!e.targeting) e.move(dt);

        switch (e.type)
        {
            case 0:
                if (e.x <= 0 + e.radius / 2 || e.x >= screenWidth - e.radius / 2)
                {
                    e.reflectX();
                    e.move(dt);
                }
                if (e.y <= topMargin + e.radius / 2 || e.y >= screenHeight - e.radius / 2)
                {
                    e.reflectY();
                    e.move(dt);
                }
                if (Math.random() < vectorChangeProb) e.fwd = getUnitVector(getRandom(-1, 1), getRandom(-1, 1));
                break;
            case 1:
            case 2:
                e.updateForward({ x: player.x, y: player.y });
                break;
            case 3:
                if (!e.targeting)
                {
                    if (!e.target)
                    {
                        e.target = { x: Math.random() * screenWidth, y: Math.random() * (screenHeight - topMargin) + topMargin };
                        e.updateForward(e.target);
                    }
                    if (e.getRect().containsPoint(e.target))
                    {
                        e.targeting = true;
                    }
                }
                else
                {
                    e.updateForward({ x: player.x, y: player.y });
                    if (e.timer <= 0)
                    {
                        e.targeting = false;
                        e.target = null;
                        e.timer = e.timerMax;
                    }
                    else e.timer -= dt;
                }
                break;
            default: break;
        }
    }

    // Draw bullets
    for (let i = 0; i < bullets.length; i++)
    {
        let b = bullets[i];

        // Triangle type chases a random enemy
        if (enemies.length != 0 && b.type == "TRIANGLE")
        {
            if (!b.target)
            {
                let enemy = enemies[Math.floor(Math.random() * enemies.length)]
                b.target = enemy;
            }
            b.updateForward({ x: b.target.x, y: b.target.y });
        }

        angle = Math.atan2(b.fwd.y, b.fwd.x);
        b.draw(ctx, angle);

        // Square and Hexagon types should not move if they are exploding/imploding
        if (!b.moving) continue;
        b.move(dt);

        if (b.x < 0 - b.radius || b.x > screenWidth + b.radius || b.y < 0 - b.radius || b.y > screenHeight + b.radius)
        {
            bullets.splice(i, 1);
        }
    }

    // Check collisions
    // Bullets with player and enemies
    for (let i = 0; i < bullets.length; i++)
    {
        let b = bullets[i];

        // Bullets with player
        if (b.source != "PLAYER" && checkCollision(player.getRect(), b.getRect()))
        {
            bullets.splice(i, 1);
            player.health -= 10;
        }

        // Bullets with enemies
        for (let j = 0; j < enemies.length; j++)
        {
            let e = enemies[j];

            if (b.source == "ENEMY") break;

            // Determine if square and hexigon types should be exploding/imploding still
            if (b.type == "SQUARE")
            {
                if (b.radius >= b.baseRadius * 3)
                {
                    // Finished exploding
                    clearInterval(explodeInterval);
                    explodeInterval = null;
                    b.radius = b.baseRadius;
                    bullets.splice(i, 1);
                    continue;
                }
                if (!b.moving && checkCollision(e.getRect(), b.getSpecialRect()))
                {
                    // Send the enemy away from the explosion
                    e.updateForward({ x: e.x + (e.x - b.x) * 2, y: e.y + (e.y - b.y) * 2 });
                }
            }
            if (b.type == "HEXAGON")
            {
                if (b.radius <= 0)
                {
                    // Finished imploding
                    clearInterval(implodeInterval);
                    implodeInterval = null;
                    b.radius = b.baseRadius;
                    bullets.splice(i, 1);
                    continue;
                }
                if (!b.moving && checkCollision(e.getRect(), b.getSpecialRect()))
                {
                    // Suck the enemy into the implosion
                    e.updateForward({ x: b.x, y: b.y });
                }
            }

            // Check other collisions
            if (checkCollision(e.getRect(), b.getRect()))
            {
                enemies.splice(j, 1);

                if (b.type == "SQUARE")
                {
                    if (!explodeInterval)
                    {
                        // Stop this bullet and begin expanding
                        b.explode();
                        explodeInterval = setInterval(b.explode, 100);
                        b.moving = false;
                    }
                }
                if (b.type == "HEXAGON")
                {
                    if (!implodeInterval)
                    {
                        // Stop this bullet and begin collapsing
                        b.radius *= 2;
                        b.implode();
                        implodeInterval = setInterval(b.implode, 100);
                        b.moving = false;
                    }
                }
                if (b.type != "SQUARE" && b.type != "HEXAGON")
                {
                    // Square and hexagon types should remain until fully exploded/imploded
                    bullets.splice(i, 1);
                }
            }
        }
    }

    // Enemies with player
    for (let i = 0; i < enemies.length; i++)
    {
        let e = enemies[i];

        if (checkCollision(e.getRect(), player.getRect()))
        {
            enemies.splice(i, 1);
            player.health -= 10;
        }
    }

    // Player with boundary
    if (player.x <= 0 + player.radius) player.x = 0 + player.radius;
    if (player.x >= screenWidth - player.radius) player.x = screenWidth - player.radius;
    if (player.y <= topMargin + player.radius) player.y = topMargin + player.radius;
    if (player.y >= screenHeight - player.radius) player.y = screenHeight - player.radius;
}

function fireInTime()
{
    // Reset counter
    if (beatCounter == maxBeats)
    {
        beatCounter = 0;
        // audio.beat.play();
    }

    // Play the metronome
    let source = audio.audioCtx.createBufferSource();
    source.buffer = audio.trackBuffers.other.metronome;
    source.connect(audio.audioCtx.destination);
    source.start();

    // Draw the playehead to the beat
    let prev = (beatCounter == 0) ? maxBeats - 1 : beatCounter - 1;
    for (let i = 0; i < notes.length; i++)
    {
        let note = notes[i];
        if (note.dataset.beat == beatCounter)
        {
            note.style["background-color"] = "rgba(0, 0, 0, 0.2)";
        }
        if (note.dataset.beat == prev)
        {
            note.style["background-color"] = "white";
        }
    }

    // Fire bullets to the beat according to type
    for (let b of bulletSelection[beatCounter])
    {
        source = audio.audioCtx.createBufferSource();

        let position =
        {
            x: player.x + player.fwd.x * player.radius * 2,
            y: player.y + player.fwd.y * player.radius * 2
        };
        let fwd =
        {
            x: player.fwd.x,
            y: player.fwd.y
        };
        let bullet;
        let speed = 120;

        if (b == BulletType.CIRCLE)
        {
            let genre = circleGenre.value;
            source.buffer = audio.trackBuffers[genre].CIRCLE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "CIRCLE", 6, "red");
        }
        if (b == BulletType.TRIANGLE)
        {
            let genre = triangleGenre.value;
            source.buffer = audio.trackBuffers[genre].TRIANGLE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "TRIANGLE", 6, "gold");
        }
        if (b == BulletType.SQUARE)
        {
            let genre = squareGenre.value;
            source.buffer = audio.trackBuffers[genre].SQUARE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "SQUARE", 6, "green");
        }
        if (b == BulletType.HEXAGON)
        {
            let genre = hexagonGenre.value;
            source.buffer = audio.trackBuffers[genre].HEXAGON;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "HEXAGON", 6, "blue");
        }
        bullets.push(bullet);

        source.connect(audio.audioCtx.destination);
        source.start();
    }

    for (let e of enemies)
    {
        if (e.type >= 2)
        {
            if (e.type == 3 && !e.targeting) continue;

            let position =
            {
                x: e.x + e.fwd.x * e.radius * 2,
                y: e.y + e.fwd.y * e.radius * 2
            };
            let fwd =
            {
                x: e.fwd.x,
                y: e.fwd.y
            };

            let bullet = new BulletSprite(position.x, position.y, fwd, 160, "ENEMY", "CIRCLE", 6, "red");
            bullets.push(bullet);
        }
    }

    beatCounter++;
}