import Rect from "./Rect.js";
import { getMouse, getUnitVector, getRandom } from "./utils.js";

export default class Sprite
{
    constructor(x, y, fwd, speed)
    {
        Object.assign(this, { x, y, fwd, speed });
    }

    move(dt = 1 / 60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    getRect()
    {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    reflectX()
    {
        this.fwd.x *= -1;
    }

    reflectY()
    {
        this.fwd.y *= -1;
    }

    updateForward(target)
    {
        let vector = getUnitVector(target.x - this.x, target.y - this.y);
        this.fwd.x = vector.x;
        this.fwd.y = vector.y;
    }
}