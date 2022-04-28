import Sprite from "./Sprite.js"

export default class PlayerSprite extends Sprite
{
    constructor(x, y, fwd, speed, radius, color)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { radius, color });
        this.maxHealth = 100;
        this.health = this.maxHealth;
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

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 6, -Math.PI * 0.1, Math.PI * 0.1, false);
        ctx.lineTo(this.radius * 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        // let test = this.getRect();
        // ctx.strokeRect(test.x, test.y, test.width, test.height);
    }

    displayHealth(ctx)
    {
        ctx.save();

        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
        if (this.health >= 0)
        {
            ctx.fillRect(10, 10, this.health * 2, 20);
        }
        ctx.strokeRect(10, 10, this.maxHealth * 2, 20);

        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(`${this.health} / ${this.maxHealth}`, this.maxHealth + 10, 26);

        ctx.restore();
    }
}