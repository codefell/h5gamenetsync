function drawHexagon(hx, hy) {
    var ox = global.ox;
    var oy = global.oy;
    var r = global.hr;
    var x = ox + hx * 1.5 * r + r; 
    var y = oy - hy * Math.sqrt(3) * r - Math.sqrt(3) / 2 * r;
    if (hx % 2 == 1) {
        y -= Math.sqrt(3) / 2 * r;
    }
    console.log(x, y, r);
    makeHexagon(x, y, r, 0xff0000, true);
}
