import Sprite from "./Sprite.js"

export default class BulletSprite extends Sprite
{
    constructor(x, y, fwd, speed, radius, color)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { radius, color });
    }

    draw(ctx, angle = 0)
    {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}