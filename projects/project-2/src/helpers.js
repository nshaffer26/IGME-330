import EnemySprite from "./EnemySprite.js";
import { getUnitVector, getRandom } from "./utils.js";
export { createEnemySprites };

function createEnemySprites(num = 10, radius = 50, rect = { left: 0, top: 0, width: 300, height: 300 }, speed = 60, color = "red")
{
    let sprites = [];
    for (let i = 0; i < num; i++)
    {
        let x = Math.random() * rect.width + rect.left;
        let y = Math.random() * rect.height + rect.top;
        let s = new EnemySprite(
            x,
            y,
            getUnitVector(getRandom(-1, 1), getRandom(-1, 1)),
            speed,
            radius,
            color
        );

        sprites.push(s);
    }

    return sprites;
}