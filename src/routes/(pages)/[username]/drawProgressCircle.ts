function drawArc (
    ctx: CanvasRenderingContext2D,
    start: number,
    end: number,
    cx: number,
    cy: number,
    r: number,
    color1: string,
    color2: string,
) {
    start *= 2 * Math.PI;
    end *= 2 * Math.PI;
    const sx = cx + Math.cos(start) * r;
    const sy = cy + Math.sin(start) * r;
    const dx = cx + Math.cos(end) * r;
    const dy = cy + Math.sin(end) * r;
    const gradient = ctx.createLinearGradient(sx, sy, dx, dy);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end, false);
    ctx.stroke();
}

/**
 * Draws and animates a circular gradient progress bar
 * @param options.ctx - canvas's 2d context
 * @param options.cx - the circle center by X
 * @param options.cy - the circle center by Y
 * @param options.r - the circle radius
 * @param options.thickness - the circle thickness
 * @param options.endValue - the progress bar value (0..1)
 * @param options.bgColor - the circle background color
 * @param options.startColor - the progress bar start color
 * @param options.endColor - the progress bar end color
 */
export default ({
    ctx,
    cx,
    cy,
    r,
    thickness,
    endValue,
    bgColor,
    startColor,
    endColor,
}: {
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    thickness: number,
    endValue: number,
    bgColor: string,
    startColor: string,
    endColor: string,
}) => {
    const speed = 0.001; // value per ms
    let startTime: number;

    requestAnimationFrame(function draw (time) {
        let pos: number;
        if (startTime) {
            pos = Math.min(endValue, (time - startTime) * speed);
        } else {
            startTime = time;
            pos = speed;
        }
        ctx.lineWidth = thickness * 0.8;
        drawArc(ctx, 0, 2 * Math.PI, cx, cy, r, bgColor, bgColor);
        ctx.lineWidth = thickness;
        if (pos > 0.6) {
            drawArc(ctx, 0, pos * 0.2, cx, cy, r, startColor, startColor);
            drawArc(ctx, pos * 0.2, pos * 0.8, cx, cy, r, startColor, endColor);
            drawArc(ctx, pos * 0.8, pos, cx, cy, r, endColor, endColor);
        } else {
            drawArc(ctx, 0, pos, cx, cy, r, startColor, endColor);
        }
        if (pos < endValue) {
            requestAnimationFrame(draw);
        }
    });
};
