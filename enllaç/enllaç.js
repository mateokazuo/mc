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
	d3.json("camins.json").then(dibuixar);
}

function escales(rcrX, rcrZ, ranX=[0,amplada], ranZ=[0, alçada]) {
	// recorregut X, Z
	let fonsX = d3.scaleLinear()
		.domain(rcrX)
		.range(ranX);
	let fonsZ = d3.scaleLinear()
		.domain(rcrZ)
		.range(ranZ);
	let color = d3.scaleOrdinal()
		.domain(['n', 's', 'e', 'o', 'g', 'v'])
		.range(['crimson', 'forestgreen', 'peru', 'darkorchid', 'cyan', 'mediumseagreen']);
	let gruix = d3.scaleOrdinal()
		.domain([3, 2, -1])
		.range([10, 3, 0]);
	let opact = d3.scaleOrdinal()
		.domain([3, 2, -1])
		.range([1, 1, 0]);
	let alç = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'z', 'c', 'x'])
		.range([15, 10, 6, 6, 0, 0, 0]);
	let amp = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'z', 'c', 'x'])
		.range([10, 6, 4, 6, 0, 0, 0]);
	let rad = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'z', 'c', 'x'])
		.range([4, 2, 1, 4, 0, 0, 0]);
	return {x:fonsX, z:fonsZ, c:color, g:gruix, o:opact, alç:alç, amp:amp, rad:rad};
}

function camí(dada) {
	// dada és un camí
	let traça = dada.traça;
	let traçat = traça.map(pt => punts.find(d => d.codi === pt));
	let xCoords = traçat.map(d => d.xPos);
	let zCoords = traçat.map(d => d.zPos);
	return {xCoords: xCoords, zCoords: zCoords};
}

function linP(dada, esc) {
	// dada és un camí
	const gruix = esc.g(dada.classe);
	let dCam = camí(dada);
	let xPt = dCam.xCoords.map(esc.x);
	let yPt = dCam.zCoords.map(esc.z);
	return {x:xPt, y:yPt, grx:gruix, col:esc.c(dada.zona), opc:esc.o(dada.classe), cls:dada.classe, zon:dada.zona};
}

function línia(d) {
	return d3.line()
		.x((_,i) => +d.x[i])
		.y((_,i) => +d.y[i])(d.x);
}

function camins(fons, dades, esc) {
	// dades són camins
	const línies = dades.map(d => linP(d, esc));
	fons.append('g')
		.selectAll('path')
		.data(línies)
		.enter()
		.append('path')
			.attr('d', d => línia(d))
			.attr('stroke', d => d.col)
			.attr('stroke-width', d => d.grx)
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('fill', 'none')
			.attr('opacity', d => d.opc)
			.attr('classe', d => d.cls)
			.attr('zona', d => d.zon);
	return 0;
}

function recP(dada, esc) {
	let alçada = esc.alç(dada.classe);
	let amplada= esc.amp(dada.classe);
	let radi = esc.rad(dada.classe);
	let xPos = esc.x(dada.xPos)-amplada;
	let yPos = esc.z(dada.zPos)-alçada;
	return{alç:alçada*2, amp:amplada*2, r:radi, x:xPos, y:yPos, cls:dada.classe};
}

function portals(fons, dades, esc) {
	// dades són punts
	const rects = dades.map(d => recP(d, esc));
	fons.append('g')
		.selectAll('rect')
		.data(rects)
		.enter()
		.append('rect')
			.attr('x', d => d.x)
			.attr('y', d => d.y)
			.attr('height', d => d.alç)
			.attr('width', d=> d.amp)
			.attr('rx', d => d.r)
			.attr('ry', d => d.r)
			.attr('fill', d => d.cls==='s' ? 'silver':'orchid')
			.attr('stroke-width', 2)
			.attr('stroke', d => d.cls==='s' ? 'dimgray':'midnightblue')
			.attr('classe', d => d.cls);
	return 0;
}

let capa;

function amagatall(fons, pts, trc, esc){
	const ple = 1;
	const rcrX = d3.extent(pts.map(d => d.xPos));
	const rcrZ = d3.extent(pts.map(d => d.zPos));
	const defX = esc.x(rcrX[0])-ple;
	const defZ = esc.z(rcrZ[0])-ple;
	const defAlç = esc.z(rcrZ[1])-esc.z(rcrZ[0])+2*ple;
	const defAmp = esc.x(rcrX[1])-esc.x(rcrX[0])+2*ple;
	capa = fons.append('rect')
			.attr('x', defX)
			.attr('y', defZ)
			.attr('height', defAlç)
			.attr('width', defAmp)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('fill', 'white')
			.attr('stroke', 'black')
			.attr('stroke-width', 3)
			.attr('classe', 'capa')
			.attr('defX', defX)
			.attr('defZ', defZ)
			.attr('defAlç', defAlç)
			.attr('defAmp', defAmp)
			.on('mouseover', veure)
			.on('mouseleave', amagar);
}

function veure(event) {
	const T = 100;
	const dX = 500;
	const dY = 300;
	capa.transition()
		.duration(100)
		.ease(d3.easeCubic)
		.attr('x', +capa.attr('x')-dX)
		.attr('y', +capa.attr('y')-dY)
		.attr('height', +capa.attr('height')+dY)
		.attr('width', +capa.attr('width')+dX);
}

function amagar(event, d) {
	capa.transition()
		.duration(100)
		.ease(d3.easeCubic)
		.attr('x', +capa.attr('defX'))
		.attr('y', +capa.attr('defZ'))
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
}

function dibuixar(traces) {
	const rcrX = d3.extent(punts.map(d => d.xPos));
	const rcrZ = d3.extent(punts.map(d => d.zPos));
	let ranX=[0,alçada*(rcrX[1]-rcrX[0])/(rcrZ[1]-rcrZ[0])];
	let ranZ=[0, alçada];
	let esc = escales(rcrX, rcrZ, ranX, ranZ);
	let traM = traces.filter(d => d.zona != 'v');
	let punM = punts.filter(d => d.classe!= 'z');
	camins(llenç, traM, esc);
	portals(llenç, punM, esc);
	let amT = traces.filter(d => d.zona === 'v');
	let amP = punts.filter(d => d.classe=== 'z');
	amagatall(llenç, amP, amT, esc);
}
