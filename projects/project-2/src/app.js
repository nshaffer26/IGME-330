import { fillText, strokeText, displayTime, getMouse, getUnitVector, getRandom, checkCollision, loadFile, updateBestScore } from "./utils.js";
import { createEnemySprites } from "./helpers.js";
import PlayerSprite from "./PlayerSprite.js";
import BulletSprite from "./BulletSprite.js";
import * as audio from './audio.js';

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const screenWidth = 600;
const screenHeight = 400;
const topMargin = 40;
canvas.width = screenWidth;
canvas.height = screenHeight;

// let scoreForm = document.querySelector("#score-form");
// scoreForm.classList.add("is-hidden");
// let submit = document.querySelector("#submit");
// submit.addEventListener("click", e =>
// {

// });

// // Display leaderboard
// let leaderboardJSON = await loadFile("./data/leaderboard.json");
// let leaderboardHTML = `<table><tr><th>Name</th><th>Level</th><th>Time</th></tr>`;
// for (let user of leaderboardJSON.users)
// {
//     leaderboardHTML += `<tr><td>${user.displayName}</td><td>${user.level}</td><td>${user.time}</td></tr>`;
// }
// leaderboardHTML += "</table>"
// leaderboard.innerHTML = leaderboardHTML;

let lastTime = 0;
let dt = 0;
let currentTime = 0;
let holdTime = currentTime;
let paused = false;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
window.onblur = () =>
{
    paused = true;
};
window.onfocus = () =>
{
    paused = false;
    loop();
};
let beatCounter = 0;
let maxBeats = 8;

const GameState = Object.freeze({
    START: Symbol("START"),
    INSTRUCTIONS: Symbol("INSTRUCTIONS"),
    MAIN: Symbol("MAIN"),
    LEVELSTART: Symbol("LEVELSTART"),
    GAMEOVER: Symbol("GAMEOVER"),
    WIN: Symbol("WIN")
});
let gameState = GameState.START;
let currentWorld = 1;
let currentLevel = 1;
let spawnRates = await loadFile("./data/spawnRates.json");
let tier;

// Audio
audio.setupWebaudio();

// Spawn player
let playerStartPos = { x: 20, y: screenHeight / 2, fwd: { x: 1, y: 0 } };
let player = new PlayerSprite(playerStartPos.x, playerStartPos.y, playerStartPos.fwd, 100, 10, "#00ceff");

// Input
let mouse = {};
canvas.addEventListener("mousemove", e =>
{
    mouse = getMouse(e);

    player.updateForward(mouse);
});
canvas.addEventListener("mousedown", doMousedown);

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
        bulletSelection[selection.dataset.beat].splice(bulletSelection[selection.dataset.beat].indexOf(BulletType[type]), 1);
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
// let circleGenre = document.querySelector("#CIRCLE-genre-selection");
// let triangleGenre = document.querySelector("#TRIANGLE-genre-selection");
// let squareGenre = document.querySelector("#SQUARE-genre-selection");
// let hexagonGenre = document.querySelector("#HEXAGON-genre-selection");
const maxActiveBullets = 10; // TODO: 10?
let inventoryBullets = {
    CIRCLE: 0,
    TRIANGLE: 0,
    SQUARE: 0,
    HEXAGON: 0,
    total: function () { return this.CIRCLE + this.TRIANGLE + this.SQUARE + this.HEXAGON; },
    reset: function () { this.CIRCLE = 4; this.TRIANGLE = this.SQUARE = this.HEXAGON = 0; }
}
let activeBullets = {
    CIRCLE: 0,
    TRIANGLE: 0,
    SQUARE: 0,
    HEXAGON: 0,
    total: function () { return this.CIRCLE + this.TRIANGLE + this.SQUARE + this.HEXAGON; },
    reset: function () { this.CIRCLE = this.TRIANGLE = this.SQUARE = this.HEXAGON = 0; }
}
let bulletSelection = [[], [], [], [], [], [], [], []];
let bullets = [];
let fireInterval = null;

/*
TODO
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

// TODO: LEADERBOARD?
// TODO: Don't give current time for updateBestScore if a player dies on a level
// Hitboxes?

inventoryBullets.reset();
updateBestScore();
loop();

function loop(timestamp = 0)
{
    if (paused) return;

    requestAnimationFrame(loop);
    
    // Update counts in UI
    activeIndicator.innerHTML = activeBullets.total();
    maxIndicator.innerHTML = maxActiveBullets;
    numCirclesIndicator.innerHTML = `${inventoryBullets.CIRCLE - activeBullets.CIRCLE} / ${inventoryBullets.CIRCLE}`;
    numTrianglesIndicator.innerHTML = `${inventoryBullets.TRIANGLE - activeBullets.TRIANGLE} / ${inventoryBullets.TRIANGLE}`;
    numSquaresIndicator.innerHTML = `${inventoryBullets.SQUARE - activeBullets.SQUARE} / ${inventoryBullets.SQUARE}`;
    numHexagonsIndicator.innerHTML = `${inventoryBullets.HEXAGON - activeBullets.HEXAGON} / ${inventoryBullets.HEXAGON}`;

    // Draw background
    ctx.save();
    ctx.fillStyle = "black";//"rgb(240, 240, 240)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    ctx.restore();

    if (gameState == GameState.MAIN)
    {
        dt = (timestamp - lastTime) / 1000;
        dt = clamp(dt, 1 / 144, 1 / 12);
        lastTime = timestamp;
        currentTime += dt;

        // Check player isn't out of health
        if (player.health <= 0)
        {
            gameState = GameState.GAMEOVER;
            updateBestScore(currentWorld, currentLevel, currentTime);
            return;
        }

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
        for (let i = 0; i < enemies.length; i++)
        {
            let e = enemies[i];

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

            // If an enemy ends up off screen somehow
            if (e.x < 0 - e.radius || e.x > screenWidth + e.radius || e.y < 0 - e.radius || e.y > screenHeight + e.radius)
            {
                enemies.splice(i, 1);
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
                if (enemies.includes(b.target)) b.updateForward({ x: b.target.x, y: b.target.y });
            }
            if (enemies.length == 0 && b.type == "TRIANGLE") b.fwd = { x: 0, y: -1 };

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
            if (b.source == "ENEMY" && checkCollision(player.getRect(), b.getRect()))
            {
                bullets.splice(i, 1);
                player.health -= 10;
            }
            if (b.source == "DROP" && checkCollision(player.getRect(), b.getRect()))
            {
                if (b.type == "HEALTH" && player.health != player.maxHealth) player.health += 10;
                else inventoryBullets[b.type]++;

                bullets = [];

                if (currentLevel % 3 == 0)
                {
                    currentWorld++;
                    currentLevel = 1;
                }
                else
                {
                    currentLevel++;
                }

                holdTime = currentTime;
                gameState = GameState.LEVELSTART;
            }

            // Determine if square and hexigon types should be exploding/imploding still
            if (b.type == "SQUARE" && b.radius >= b.baseRadius * 4)
            {
                // Finished exploding
                clearInterval(b.interval);
                b.interval = null;
                b.radius = b.baseRadius;
                bullets.splice(i, 1);
                continue;
            }
            if (b.type == "HEXAGON" && b.radius <= 0)
            {
                // Finished imploding
                clearInterval(b.interval);
                b.interval = null;
                b.radius = b.baseRadius;
                bullets.splice(i, 1);
                continue;
            }

            // Bullets with enemies
            for (let j = 0; j < enemies.length; j++)
            {
                let e = enemies[j];

                // Display bounding boxes for testing
                // ctx.save();
                // ctx.strokeStyle = "white";
                // let test = player.getRect();
                // ctx.strokeRect(test.x, test.y, test.width, test.height);
                // test = e.getRect();
                // ctx.strokeRect(test.x, test.y, test.width, test.height);
                // test = b.getRect();
                // ctx.strokeRect(test.x, test.y, test.width, test.height);
                // if (b.specialRadius)
                // {
                //     test = b.getSpecialRect();
                //     ctx.strokeRect(test.x, test.y, test.width, test.height);
                // }
                // ctx.restore();

                // Enemies cannot destroy each other
                if (b.source == "ENEMY") break;

                // Check the explosion/implosion radius
                if (!b.moving && checkCollision(e.getRect(), b.getSpecialRect()))
                {
                    if (b.type == "SQUARE")
                    {
                        // Send the enemy away from the explosion
                        e.updateForward({ x: e.x + (e.x - b.x) * 2, y: e.y + (e.y - b.y) * 2 });
                    }
                    if (b.type == "HEXAGON")
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
                        if (!b.interval)
                        {
                            // Stop this bullet and begin expanding
                            b.explode();
                            b.interval = setInterval(b.explode, 10);
                            b.moving = false;
                        }
                    }
                    if (b.type == "HEXAGON")
                    {
                        if (!b.interval)
                        {
                            // Stop this bullet and begin collapsing
                            b.radius *= 2;
                            b.implode();
                            b.interval = setInterval(b.implode, 100);
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

        if (enemies.length == 0)
        {
            if (gameState == GameState.MAIN && currentWorld == 3 && currentLevel == 3)
            {
                gameState = GameState.WIN;
                updateBestScore(currentWorld, currentLevel, currentTime);
                return;
            }

            ctx.save();
            ctx.translate(screenWidth / 2, screenHeight / 2);
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            fillText(ctx, `Choose a new item`, 0, -50, "36pt 'Josefin Sans', sans-serif", "#00ceff");
            ctx.restore();

            if (fireInterval)
            {
                toggleFireInterval(false);
                bullets = [];

                let center = { x: screenWidth / 2, y: screenHeight / 2 };
                let fwd = { x: 0, y: 0 };

                let bulletType = spawnRates.drops["tier" + tier][Math.floor(Math.random() * spawnRates.drops["tier" + tier].length)];
                let bullet = new BulletSprite(center.x - 40, center.y, fwd, 0, "DROP", bulletType, 12, "grey", "white");
                bullets.push(bullet);

                bulletType = spawnRates.drops["tier" + tier][Math.floor(Math.random() * spawnRates.drops["tier" + tier].length)];
                bullet = new BulletSprite(center.x + 40, center.y, fwd, 0, "DROP", bulletType, 12, "grey", "white");
                bullets.push(bullet);

                player.x = center.x;
                player.y = center.y + 100;
            }
        }
    }

    drawScreen(ctx);
}

function drawScreen(ctx)
{
    ctx.save();

    switch (gameState)
    {
        case GameState.START:
            ctx.translate(screenWidth / 2, screenHeight / 2);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            fillText(ctx, "Tempo Attack", 0, -100, "48pt 'Josefin Sans', sans-serif", "white");
            strokeText(ctx, "Tempo Attack", 0, -100, "48pt 'Josefin Sans', sans-serif", "#00ceff", 1);
            fillText(ctx, "Click anywhere for instructions", 0, 160, "16pt 'Josefin Sans', sans-serif", "white");

            break;
        case GameState.INSTRUCTIONS:
            ctx.translate(screenWidth / 2, screenHeight / 2);

            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            fillText(ctx, "Instructions", 0, -180, "36pt 'Josefin Sans', sans-serif", "white");
            strokeText(ctx, "Instructions", 0, -180, "36pt 'Josefin Sans', sans-serif", "#00ceff", 1);
            fillText(ctx, "Move with WASD, aim with the mouse", 0, -100, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Place bullets on the grid below", 0, -60, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Bullets will fire every beat", 0, -20, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Experiment with different bullet combinations", 0, 20, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "as you unlock different types", 0, 40, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Defeat all enemies to advance to the next level", 0, 80, "14pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Click anywhere to begin", 0, 160, "16pt 'Josefin Sans', sans-serif", "white");

            break;
        case GameState.MAIN:
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            fillText(ctx, `Level: ${currentWorld}-${currentLevel}`, screenWidth - 10, 10, "20pt 'Josefin Sans', sans-serif", "white");

            ctx.textBaseline = "bottom";
            fillText(ctx, displayTime(currentTime), screenWidth - 10, screenHeight - 10, "10pt 'Josefin Sans', sans-serif", "white");

            break;
        case GameState.LEVELSTART:
            ctx.translate(screenWidth / 2, screenHeight / 2);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            fillText(ctx, `Level ${currentWorld}-${currentLevel}`, 0, -50, "36pt 'Josefin Sans', sans-serif", "#00ceff");
            fillText(ctx, "Click to Continue", 0, 50, "16pt 'Josefin Sans', sans-serif", "white");

            break;
        case GameState.GAMEOVER:
            ctx.translate(screenWidth / 2, screenHeight / 2);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            fillText(ctx, "GAME OVER", 0, -65, "36pt 'Josefin Sans', sans-serif", "#00ceff");
            fillText(ctx, `Level: ${currentWorld}-${currentLevel}`, 0, 0, "26pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, `Time: ${displayTime(currentTime)}`, 0, 36, "26pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Click to Play Again", 0, 120, "16pt 'Josefin Sans', sans-serif", "white");

            // TODO: Display leaderboard

            break;
        case GameState.WIN:
            ctx.translate(screenWidth / 2, screenHeight / 2);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            fillText(ctx, "YOU WIN", 0, -65, "36pt 'Josefin Sans', sans-serif", "#00ceff");
            fillText(ctx, `Level: ${currentWorld}-${currentLevel}`, 0, 0, "26pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, `Time: ${displayTime(currentTime)}`, 0, 36, "26pt 'Josefin Sans', sans-serif", "white");
            fillText(ctx, "Click to Play Again", 0, 120, "16pt 'Josefin Sans', sans-serif", "white");

            // TODO: Display leaderboard

            break;
        default: break;
    }

    ctx.restore();
}

function loadLevel(worldNum, levelNum)
{
    if (audio.trackBuffers) toggleFireInterval(true);
    else gameState = GameState.LEVELSTART;

    updateBestScore(currentWorld, currentLevel, currentTime);

    let margin = 60;
    let rect = {
        left: screenWidth / 2 + margin,
        top: topMargin + margin,
        width: screenWidth / 2 - margin * 2,
        height: screenHeight / 2 - margin * 2
    }
    enemies = [];
    let numToSpawn = 10;

    switch (`${worldNum}-${levelNum}`)
    {
        case "1-1":
        case "1-2":
            tier = 1;
            numToSpawn = 5;
            break;
        case "1-3":
        case "2-1":
        case "2-2":
            tier = 2;
            numToSpawn = 8;
            break;
        case "2-3":
        case "3-1":
            tier = 3;
            numToSpawn = 10;
            break;
        case "3-2":
        case "3-3":
            tier = 4;
            numToSpawn = 15;
            break;
        default: tier = 1; break;
    }

    enemies = enemies.concat(
        createEnemySprites(numToSpawn, spawnRates.enemies["tier" + tier], rect, "red")
    );
}

function doMousedown(e)
{
    // let mouse = getMouse(e);

    switch (gameState)
    {
        case GameState.START:
            gameState = GameState.INSTRUCTIONS;

            break;
        case GameState.INSTRUCTIONS:
            currentWorld = 1;
            currentLevel = 1;
            currentTime = 0;

            gameState = GameState.MAIN;

            loadLevel(currentWorld, currentLevel);

            break;
        case GameState.MAIN: console.log(enemies); break;
        case GameState.LEVELSTART:
            player.x = playerStartPos.x;
            player.y = playerStartPos.y;
            currentTime = holdTime;
            beatCounter = 0;
            notes.forEach(note => { note.style["background-color"] = "white"; });
            gameState = GameState.MAIN;

            loadLevel(currentWorld, currentLevel);

            break;
        case GameState.GAMEOVER:
        case GameState.WIN:
            player.x = playerStartPos.x;
            player.y = playerStartPos.y;
            player.health = player.maxHealth;

            inventoryBullets.reset();
            activeBullets.reset();
            notes.forEach(note => { note.dataset.selected = false; note.innerHTML = ""; note.style["background-color"] = "white"; });
            bulletSelection = [[], [], [], [], [], [], [], []];
            bullets = [];

            toggleFireInterval(false);

            gameState = GameState.START;
            break;
        default: break;
    }
}

function fireInTime()
{
    if (paused) return;

    // Reset counter
    if (beatCounter == maxBeats)
    {
        beatCounter = 0;
    }

    // Play the metronome
    let source = audio.audioCtx.createBufferSource();
    // source.buffer = audio.trackBuffers.other.metronome;
    // let gainNode = audio.audioCtx.createGain();
    // gainNode.gain.value = 0.4;
    // source.connect(gainNode);
    // gainNode.connect(audio.audioCtx.destination);
    // source.start();

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

        let genre = "classical";

        if (b == BulletType.CIRCLE)
        {
            // let genre = circleGenre.value;
            source.buffer = audio.trackBuffers[genre].CIRCLE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "CIRCLE", 6, "red");
        }
        if (b == BulletType.TRIANGLE)
        {
            // let genre = triangleGenre.value;
            source.buffer = audio.trackBuffers[genre].TRIANGLE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "TRIANGLE", 6, "gold");
        }
        if (b == BulletType.SQUARE)
        {
            // let genre = squareGenre.value;
            source.buffer = audio.trackBuffers[genre].SQUARE;

            bullet = new BulletSprite(position.x, position.y, fwd, speed, "PLAYER", "SQUARE", 6, "green");
        }
        if (b == BulletType.HEXAGON)
        {
            // let genre = hexagonGenre.value;
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

            let bullet = new BulletSprite(position.x, position.y, fwd, 160, "ENEMY", "CIRCLE", 6, "white");
            bullets.push(bullet);
        }
    }

    beatCounter++;
}

function toggleFireInterval(activate)
{
    let tempo = 80; // BPM (Beats Per Minute)
    // let halfNoteTime = 120 / tempo;
    let quarterNoteTime = 60 / tempo;

    if (activate)
    {
        fireInterval = setInterval(fireInTime, quarterNoteTime * 1000);
    }
    else
    {
        clearInterval(fireInterval);
        fireInterval = null;
    }
}