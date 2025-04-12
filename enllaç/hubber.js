const marge = {dalt: 30, dreta: 30, baix: 30, esquerra: 30},
	alçada = 820 - marge.dalt - marge.baix,
	amplada = alçada;

const llenç = d3.select("#plànol")
	.append("svg")
		.attr("width", amplada + marge.esquerra + marge.dreta)
		.attr("height", alçada + marge.dalt + marge.baix)
	.append("g")
		.attr("transform", `translate(${marge.esquerra},${marge.dalt})`);

let punts;
d3.csv("vrx.csv", function(d) {
	d.xPos = +d.xPos;
	d.zPos = +d.zPos;
	return d;
}).then( function(data) {
	punts = data;
	caminar();
});

function caminar() {
	d3.csv("camins.csv").then(dibuixar);
}

function camí(dades) {
	let inici = punts.find(d => d.codi === dades.inici);
	let fi = punts.find(d => d.codi === dades.fi);
	let xCoords = [inici.xPos, fi.xPos];
	let zCoords = [inici.zPos, fi.zPos];
	let dir;
	if (xCoords[0] === xCoords[1]) {
		dir = 'ns';
		xCoords = xCoords[0];
	} else if (zCoords[0] === zCoords[1]) {
		dir = 'eo'
		zCoords = zCoords[0];
	} else {
		console.log(dades);
		console.log(inici);
		console.log(fi);
		throw new Error("Camí no ortogonal.");
	}
	return {xCoords: xCoords, zCoords: zCoords, dir: dir};
}

function dibuixar(dades) {
	const gruix = 3;
	const xRang = punts.map(d => d.xPos);
	const zRang = punts.map(d => d.zPos);
	const x = d3.scaleLinear()
		.domain(d3.extent(xRang))
		.range([0, amplada]);
	const z = d3.scaleLinear()
		.domain(d3.extent(zRang))
		.range([0, alçada]);
	function rectangle(d) {
		let dCam = camí(d);
		let xPt;
		let yPt;
		let alç;
		let amp;
		if (dCam.dir === 'ns') {
			amp = gruix*2;
			alç = Math.abs(z(dCam.zCoords[0])-z(dCam.zCoords[1]));
			xPt = x(dCam.xCoords)-gruix;
			yPt = z(d3.min(dCam.zCoords));
		} else if (dCam.dir === 'eo') {
			alç = gruix*2
			amp = Math.abs(x(dCam.xCoords[0])-x(dCam.xCoords[1]));
			xPt = x(d3.min(dCam.xCoords));
			yPt = z(dCam.zCoords)-gruix;
		} else {
			console.log(d);
			throw new Error("Direcció no esperada.");
		}
		return {x: xPt,	y: yPt,	amp: amp, alç: alç};
	}
	llenç.append("g")
		.selectAll("rect")
		.data(dades)
		.enter()
		.append("rect")
			.attr('x', d => rectangle(d).x)
			.attr('y', d => rectangle(d).y)
			.attr('width', d => rectangle(d).amp)
			.attr('height', d => rectangle(d).alç)
			.attr('stroke', 'red')
			.attr('fill', 'red');
}

