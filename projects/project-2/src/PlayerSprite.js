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

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 6, -Math.PI * 0.1, Math.PI * 0.1, false);
        ctx.lineTo(this.radius * 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
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
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${this.health} / ${this.maxHealth}`, this.maxHealth + 10, 20);

        ctx.restore();
    }
}