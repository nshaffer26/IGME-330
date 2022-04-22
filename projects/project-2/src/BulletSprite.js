import Sprite from "./Sprite.js"

export default class BulletSprite extends Sprite
{
    constructor(x, y, fwd, speed, type, radius, color, stroke = undefined)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { type, radius, color, stroke });

        this.baseRadius = radius;
        this.specialRadius = radius + 60;
        this.target = null;
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
                ctx.moveTo(this.radius / 2, 0);
                ctx.lineTo(-this.radius / 2, this.radius / 2);
                ctx.lineTo(-this.radius / 2, -this.radius / 2);
                break;
            case "SQUARE":
                ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
                break;
            case "HEXAGON":
                ctx.moveTo(-this.radius / 2, 0);
                ctx.lineTo(-this.radius / 4, -this.radius / 2);
                ctx.lineTo(this.radius / 4, -this.radius / 2);
                ctx.lineTo(this.radius / 2, 0);
                ctx.lineTo(this.radius / 4, this.radius / 2);
                ctx.lineTo(-this.radius / 4, this.radius / 2);
                break;
        }

        ctx.closePath();
        ctx.fill();
        if (this.stroke)
        {
            ctx.strokeStyle = this.stroke;
            ctx.stroke();
        }
        ctx.restore();

        // let test = this.getRect();
        // ctx.strokeRect(test.x, test.y, test.width, test.height);
        // if (this.specialRadius)
        // {
        //     test = this.getSpecialRect();
        //     ctx.strokeRect(test.x, test.y, test.width, test.height);
        // }
    }

    explode = () =>
    {
        this.radius++;
    }

    implode = () =>
    {
        this.radius--;
    }
}