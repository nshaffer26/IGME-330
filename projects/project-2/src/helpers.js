import EnemySprite from "./EnemySprite.js";
import { getUnitVector, getRandom } from "./utils.js";
export { createEnemySprites };

function createEnemySprites(num = 10, tier = [], rect = { left: 0, top: 0, width: 300, height: 300 }, color = "red")
{
    let sprites = [];
    for (let i = 0; i < num; i++)
    {
        let x = Math.random() * rect.width + rect.left;
        let y = Math.random() * rect.height + rect.top;

        let enemyType = tier;

        if (tier.length != 0) enemyType = tier[Math.floor(Math.random() * tier.length)];
        else enemyType = 1;

        let s = new EnemySprite(
            x,
            y,
            getUnitVector(getRandom(-1, 1), getRandom(-1, 1)),
            undefined,
            enemyType,
            color
        );

        sprites.push(s);
    }

    return sprites;
}