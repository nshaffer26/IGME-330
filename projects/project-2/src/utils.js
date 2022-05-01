let localStorageKey = "njs7772-p2-settings";

export async function loadFile(filepath)
{
    let data = null;
    try
    {
        let response = await fetch(filepath);
        if (!response.ok)
        {
            throw new Error(response.statusText);
        }

        data = await response.json();
    }
    catch (error)
    {
        console.error('Error loading data');
    }

    return data;
}

export function updateBestScore(world = 1, level = 1, time = null)
{
    let highScore = document.querySelector("#leaderboard");
    let storedSettings = localStorage.getItem(localStorageKey);
    if (storedSettings)
    {
        storedSettings = JSON.parse(storedSettings);
    }
    else
    {
        storedSettings = { world: world, level: level, time: time }
        localStorage.setItem(localStorageKey, JSON.stringify(storedSettings));
    }

    if (!storedSettings.time)
    {
        storedSettings.world = world;
        storedSettings.level = level;
        storedSettings.time = time;
    }
    else if (world > storedSettings.world)
    {
        storedSettings.world = world;
        storedSettings.level = level;
        storedSettings.time = time;
    }
    else if (world == storedSettings.world && level > storedSettings.level)
    {
        storedSettings.level = level;
        storedSettings.time = time;
    }
    else if (world == storedSettings.world && level == storedSettings.level && time < storedSettings.time)
    {
        storedSettings.time = time;
    }

    localStorage.setItem(localStorageKey, JSON.stringify(storedSettings));
    highScore.innerHTML = `<strong>Your best:<br>Level:</strong> ${storedSettings.world}-${storedSettings.level}<br><strong>Time:</strong> ${displayTime(storedSettings.time)}`;
}

export function getUnitVector(x, y)
{
    let length = Math.sqrt(x * x + y * y);
    if (length == 0)
    { // very unlikely
        x = 1; // point right
        y = 0;
        length = 1;
    }
    else
    {
        x /= length;
        y /= length;
    }

    return { x: x, y: y };
}

export function getRandom(min, max)
{
    return Math.random() * (max - min) + min;
}

// returns mouse position in local coordinate system of element
export function getMouse(e)
{
    var mouse = {}; // make an object
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;
    return mouse;
}

export function checkCollision(a, b)
{
    return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y)
}

export function displayTime(currentTime)
{
    let displayTime = new Date(0);
    displayTime.setSeconds(currentTime);

    return displayTime.toISOString().substring(11, 19);
}

export function fillText(ctx, string, x, y, css, color)
{
    ctx.save();
    ctx.font = css;
    ctx.fillStyle = color;
    ctx.fillText(string, x, y);
    ctx.restore();
}
export function strokeText(ctx, string, x, y, css, color, lineWidth)
{
    ctx.save();
    ctx.font = css;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(string, x, y);
    ctx.restore();
}