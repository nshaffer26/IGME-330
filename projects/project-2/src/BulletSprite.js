import Sprite from "./Sprite.js"

export default class BulletSprite extends Sprite
{
    constructor(x, y, fwd, speed, source, type, radius, color, stroke = undefined)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { source, type, radius, color, stroke });

        this.baseRadius = radius;
        this.specialRadius = radius + 30;
        this.target = null;
        this.interval = null;
        this.alpha = 1;
        this.moving = true;
    }

    draw(ctx, angle = 0)
    {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();

        switch (this.type)
        {
            case "CIRCLE":
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
                break;
            case "TRIANGLE":
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius, this.radius);
                ctx.lineTo(-this.radius, -this.radius);
                break;
            case "SQUARE":
                ctx.globalAlpha = this.alpha;
                ctx.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
                break;
            case "HEXAGON":
                ctx.moveTo(-this.radius, 0);
                ctx.lineTo(-this.radius / 2, -this.radius);
                ctx.lineTo(this.radius / 2, -this.radius);
                ctx.lineTo(this.radius, 0);
                ctx.lineTo(this.radius / 2, this.radius);
                ctx.lineTo(-this.radius / 2, this.radius);
                break;
            case "HEALTH":
                ctx.arc(-this.radius / 2, -this.radius / 2, this.radius / 2, Math.PI, 0, false);
                ctx.arc(this.radius / 2, -this.radius / 2, this.radius / 2, Math.PI, 0, false);
                ctx.lineTo(0, this.radius);
                ctx.lineTo(-this.radius, -this.radius / 2);
            default: break;
        }

        ctx.closePath();
        ctx.fill();
        if (this.stroke)
        {
            ctx.strokeStyle = this.stroke;
            ctx.stroke();
        }
        ctx.restore();
    }

    explode = () =>
    {
        this.radius++;
        this.alpha -= 0.04;
        if (this.alpha <= 0) this.alpha = 0;
    }

    implode = () =>
    {
        this.radius--;
    }
}