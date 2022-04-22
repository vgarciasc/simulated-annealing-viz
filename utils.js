Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) return randomGaussian();
  return num
}

function distance(pt1, pt2) {
	return Math.sqrt(Math.pow(pt1.x1 - pt2.x1, 2) + Math.pow(pt1.x2 - pt2.x2, 2));
}

function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// https://gist.github.com/janosh/099bd8061f15e3fbfcc19be0e6b670b9
const argfact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]
const argmax = argfact((min, el) => (el[0] > min[0] ? el : min))
const argmin = argfact((max, el) => (el[0] < max[0] ? el : max))

// https://dillieodigital.wordpress.com/2013/01/16/quick-tip-how-to-draw-a-star-with-svg-and-javascript/
function calculateStarPoints(cx, cy, arms, outerRadius, innerRadius, startAngle=0) {
  var pts = [];
  var angle = Math.PI / arms;

  for (var i = 0; i < 2*arms; i++) {
    var r = (i & 1) == 0 ? outerRadius : innerRadius;

    var currX = cx + Math.cos(i * angle + startAngle * Math.PI / 180) * r;
    var currY = cy + Math.sin(i * angle + startAngle * Math.PI / 180) * r;

    pts.push(currX);
    pts.push(currY);
  }

  return pts.join(",");
}