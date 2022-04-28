import Sprite from "./Sprite.js"

export default class EnemySprite extends Sprite
{
    constructor(x, y, fwd, speed = 80, type, color)
    {
        super(x, y, fwd, speed);
        Object.assign(this, { type, color });

        this.radius = 10;
        
        this.target = null;
        this.targeting = null;
        this.timerMax = 2;
        this.timer = this.timerMax;

        if(this.type > 0) this.speed = 60;
    }

    draw(ctx, angle = 0)
    {
        let type = this.type;

        ctx.save();

        // Enemy
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, this.radius);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.closePath();
        ctx.fill();

        // Direction
        if (type > 0)
        {
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(0, this.radius / 2);
            ctx.lineTo(0, -this.radius / 2);
            ctx.closePath();

            if (type == 1)
            {
                ctx.stokeStyle = "black";
                ctx.stroke();
            }
            if (type > 1)
            {
                ctx.fill();
            }
            if (type == 3)
            {
                ctx.beginPath();
                ctx.moveTo(-this.radius * 3 / 2, 0);
                ctx.lineTo(-this.radius, this.radius / 2);
                ctx.lineTo(-this.radius, -this.radius / 2);
                ctx.closePath();
                ctx.fill();
            }
        }


        ctx.restore();
        // let test = this.getRect();
        // ctx.strokeRect(test.x, test.y, test.width, test.height);
    }
}