import EnemySprite from "./EnemySprite.js";
import { getUnitVector, getRandom } from "./utils.js";
export { createEnemySprites };

function createEnemySprites(num = 10, width = 50, height = 50, rect = { left: 0, top: 0, width: 300, height: 300 }, speed = 60, color = "red")
{
    let sprites = [];
    for (let i = 0; i < num; i++)
    {
        let x = Math.random() * rect.width + rect.left;
        let y = Math.random() * rect.height + rect.top;
        let s = new EnemySprite(
            // Math.random() * rect.width + rect.left,
            // Math.random() * rect.height + rect.top,
            x,
            y,
            getUnitVector(getRandom(-1, 1), getRandom(-1, 1)),
            speed,
            width,
            height,
            color
        );

        sprites.push(s);
    }

    return sprites;
}