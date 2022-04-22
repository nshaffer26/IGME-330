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
canvas.width = screenWidth;
canvas.height = screenHeight;

// const staff = document.querySelector("#staff");
// const staffCtx = staff.getContext("2d");
// // const staffWidth = 600;
// // const staffHeight = 200;
// // staff.width = staffWidth;
// // staff.height = staffHeight;
// staffCtx.fillStyle = "grey";
// staffCtx.fillRect(0,0,staff.width,staff.height);

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

// Staff
let temps = document.querySelector("#circle-symbol");
temps.parentNode.dataset.type
let notes = document.querySelectorAll(".note-selection");
notes.forEach(note => note.addEventListener("click", e =>
{
    let selection = e.target;
    if (selection.nodeName == "IMG") selection = selection.parentNode;

    if (selection.dataset.selected == "true")
    {
        selection.dataset.selected = "false";
        selection.innerHTML = "";

        bulletSelection[selection.dataset.beat].splice(bulletSelection[selection.dataset.beat].indexOf(BulletType[selection.dataset.type]), 1)
    }
    else
    {
        selection.dataset.selected = "true";
        let type = selection.parentNode.dataset.type;
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
        }
    }
}));

let gameState = GameState.START;
let currentLevel = 1;

let enemies = [];
let vectorChangeProb = 0.001;

const BulletType = Object.freeze({
    NONE: Symbol("NONE"),
    CIRCLE: Symbol("CIRCLE"),
    TRIANGLE: Symbol("TRIANGLE"),
    SQUARE: Symbol("SQUARE"),
    HEXAGON: Symbol("HEXAGON")
});
let bulletSelection = [[], [], [], [], [], [], [], []];
let bullets = [];
let beatCounter = 0;
let explodeInterval = null;
let implodeInterval = null;
// TODO:
/* 
Change title
Time player for score
High scores from JSON
2 Random bullets at end of level
Show number of each bullet
Colors change for each world, clear bullets
Enemies:
- Bounce around screen
- Chase player
- Chase player and shoot to half-note
- Chase player and shoot to quarter-note
- Avoid player and shoot to quarter-note
Genres:
- Classical
- Tropical?
- Arcade
- Neon
Bullets:
- Circle normal
- Triangle chase
- Square explode
- Hexagon implode
*/
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
    createEnemySprites(10, 20, rect, 60, "red")
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
        if (e.x <= 0 + e.radius / 2 || e.x >= screenWidth - e.radius / 2)
        {
            e.reflectX();
            e.move();
        }
        if (e.y <= 0 + e.radius / 2 || e.y >= screenHeight - e.radius / 2)
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

        // Triangle type chases a random enemy
        if (b.type == "TRIANGLE")
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
        let position =
        {
            x: player.x + player.fwd.x * player.radius * 2,
            y: player.y + player.fwd.y * player.radius * 2
        }
        let fwd =
        {
            x: player.fwd.x,
            y: player.fwd.y
        };
        let bullet

        if (b == BulletType.CIRCLE)
        {
            bullet = new BulletSprite(position.x, position.y, fwd, 120, "CIRCLE", 6, "red");
            bullets.push(bullet);
        }
        if (b == BulletType.TRIANGLE)
        {
            bullet = new BulletSprite(position.x, position.y, fwd, 120, "TRIANGLE", 12, "gold");
            bullets.push(bullet);
        }
        if (b == BulletType.SQUARE)
        {
            bullet = new BulletSprite(position.x, position.y, fwd, 120, "SQUARE", 12, "green");
            bullets.push(bullet);
        }
        if (b == BulletType.HEXAGON)
        {
            bullet = new BulletSprite(position.x, position.y, fwd, 120, "HEXAGON", 12, "blue");
            bullets.push(bullet);
        }
    }

    beatCounter++;
}