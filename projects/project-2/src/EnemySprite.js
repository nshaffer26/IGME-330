import Sprite from "./Sprite.js"

export default class EnemySprite extends Sprite
{
    constructor(x, y, fwd, speed, radius, color)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { radius, color });
    }

    draw(ctx, angle = 0)
    {
        ctx.save();

        // Enemy
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(this.radius / 2, 0);
        ctx.lineTo(-this.radius / 2, this.radius / 2);
        ctx.lineTo(-this.radius / 2, -this.radius / 2);
        ctx.closePath();
        ctx.fill();

        // Direction
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.radius / 2, 0);
        ctx.lineTo(0, this.radius / 4);
        ctx.lineTo(0, -this.radius / 4);
        ctx.closePath();
        ctx.fill();


        ctx.restore();
        // let test = this.getRect();
        // ctx.strokeRect(test.x, test.y, test.width, test.height);
    }
}