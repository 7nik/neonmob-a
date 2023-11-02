import type { Action } from "svelte/action";

type CircleParams = {
    /**
     * The circle center, default = radius + thickness
     */
    center?: number,
    /**
     * Inner radius of the circle
     */
    radius: number,
    /**
     * Thickness of the circle
     */
    thickness: number,
    /**
     * Starting position in deg, 0 is upright
     */
    startAngle: number,
    /**
     * Value in range 0..1
     */
    progress: number,
    /**
     * Color of circle background
     */
    bgColor: string,
    /**
     * Starting color of the progress
     */
    startColor: string,
    /**
     * Ending color of the progress, for gradient
     */
    endColor?: string,
}

function drawArc (
    ctx: CanvasRenderingContext2D,
    start: number,
    end: number,
    c: number,
    r: number,
    color1: string,
    color2: string,
) {
    start *= 2 * Math.PI;
    end *= 2 * Math.PI;
    const sx = c + Math.cos(start) * r;
    const sy = c + Math.sin(start) * r;
    const dx = c + Math.cos(end) * r;
    const dy = c + Math.sin(end) * r;
    const gradient = ctx.createLinearGradient(sx, sy, dx, dy);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.arc(c, c, r, start, end, false);
    ctx.stroke();
}

function drawFrame (ctx: CanvasRenderingContext2D, p: CircleParams, pos: number, dTime: number) {
    const speed = pos < p.progress ? 0.001 : -0.001; // value per ms
    pos += dTime * speed;
    ctx.lineWidth = p.thickness * 0.8;
    drawArc(ctx, 0, 2 * Math.PI, p.center!, p.radius, p.bgColor, p.bgColor);
    ctx.lineWidth = p.thickness;
    if (pos > 0.6 && p.startColor !== p.endColor) {
        drawArc(ctx, 0, pos * 0.2, p.center!, p.radius, p.startColor, p.startColor);
        drawArc(ctx, pos * 0.2, pos * 0.8, p.center!, p.radius, p.startColor, p.endColor!);
        drawArc(ctx, pos * 0.8, pos, p.center!, p.radius, p.endColor!, p.endColor!);
    } else {
        drawArc(ctx, 0, pos, p.center!, p.radius, p.startColor, p.endColor!);
    }
    if (speed > 0 ? pos < p.progress : pos > 0) {
        return pos;
    }
    return p.progress;
}

/**
 * Draws and animates a circular gradient progress bar
 * @param canvas - the target canvas element
 * @param params.center - the circle center, optional
 * @param params.radius - the circle radius
 * @param params.thickness - the circle thickness
 * @param params.startAngle - the starting angle of the progress bar
 * @param params.progress - the progress bar value (0..1)
 * @param params.bgColor - the circle background color
 * @param params.startColor - the progress bar start color
 * @param params.endColor - the progress bar end color, optional
 */
const progressCircle: Action<HTMLCanvasElement, CircleParams> = (canvas, params) => {
    if (!params) throw new Error("Params are required!");
    params.center ??= params.radius + params.thickness;
    params.endColor ??= params.startColor;

    canvas.width = params.center * 2;
    canvas.height = params.center * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(params.center, params.center);
    ctx.rotate((params.startAngle - 90) / 180 * Math.PI);
    ctx.translate(-params.center, -params.center);

    let draws = false;
    let pos = 0;
    function draw () {
        if (draws) return;
        draws = true;

        let prevTime = 0;
        requestAnimationFrame(function drawNext (time) {
            pos = drawFrame(ctx, params!, pos, prevTime ? time - prevTime : 0);
            if (!draws || pos === params!.progress) {
                draws = false;
            } else {
                prevTime = time;
                requestAnimationFrame(drawNext);
            }
        });
    }

    draw();

    return {
        update (p) {
            params.progress = p.progress;
            draw();
        },
        destroy () {
            draws = false;
        },
    };
};

export default progressCircle;
