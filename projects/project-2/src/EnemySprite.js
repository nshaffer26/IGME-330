import Sprite from "./Sprite.js"

export default class EnemySprite extends Sprite
{
    constructor(x, y, fwd, speed, width, height, color)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { width, height, color });
    }

    draw(ctx, angle = 0)
    {
        ctx.save();

        // Enemy
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Direction
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 4);
        ctx.lineTo(0, -this.height / 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}