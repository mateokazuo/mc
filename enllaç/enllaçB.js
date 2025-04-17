var fet = false;

function mira (cosa) {
	console.log(JSON.parse(JSON.stringify(cosa)));
}

var Mides;
var Amplada = 800;
var Alçada = 800;

//window.addEventListener('resize', actMida);

function actMida() {
	Mides = document.getElementById('plànol').getBoundingClientRect();
	Amplada = Mides.width;
	Alçada = Mides.height;
	if (fet) {
		alçada = Amplada - marge.dalt - marge.baix;
		amplada = Alçada - marge.dreta - marge.esquerra;
		llenç.attr('width', Amplada)
			.attr('height', Alçada);
		dibuixar()
		};
}

var marge = {dalt: 30, dreta: 30, baix: 30, esquerra: 30},
	alçada = Amplada - marge.dalt - marge.baix,
	amplada = Alçada - marge.dreta - marge.esquerra;

var plànol = d3.select('#plànol')
	.append('svg')
		.attr('width', Amplada)
		.attr('height', Alçada)

var fons = plànol.append('rect')
	.attr('width', '100%')
	.attr('height', '100%')
	.attr('fill', 'maroon')
	.attr('opacity', 0.2);

var llenç = plànol.append('g')
	.attr('transform', `translate(${marge.esquerra},${marge.dalt})`);


let punts;
d3.csv('vrx.csv', function(d) {
	d.xPos = +d.xPos;
	d.zPos = +d.zPos;
	return d;
}).then( function(data) {
	punts = data;
	caminar();
});

function caminar() {
	d3.json('camins.json').then(novaEscala);
}

function escales(rcrX, rcrZ, ranX=[0,Amplada], ranZ=[0, Alçada]) {
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
		.range([30, 20, 12, 12, 0, 0, 0]);
	let amp = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'z', 'c', 'x'])
		.range([20, 12, 8, 12, 0, 0, 0]);
	let rad = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'z', 'c', 'x'])
		.range([4, 2, 1, 4, 0, 0, 0]);
	return {x:fonsX, z:fonsZ, c:color, g:gruix, o:opact, alç:alç, amp:amp, rad:rad};
}

function camí(dada, parades) {
	// dada és un camí
	let traça = dada.traça;
	let traçat = traça.map(pt => parades.find(d => d.codi === pt));
	let xCoords = traçat.map(d => d.xPos);
	let zCoords = traçat.map(d => d.zPos);
	return {xCoords: xCoords, zCoords: zCoords};
}

function linP(dada, esc, parades, regle) {
	// dada és un camí
	const gruix = esc.g(dada.classe);
	return {grx:gruix, col:esc.c(dada.zona), opc:esc.o(dada.classe), cls:dada.classe, zon:dada.zona, lin:regle(dada, parades), codis:dada.traça};
}

function regle1(dada, parades) {
	let dCam = camí(dada, parades);
	let x = dCam.xCoords;
	let y = dCam.zCoords;
	return d3.line()
		.x((_,i) => x[i])
		.y((_,i) => y[i])(x);
}

function camins(fons, línies) {
	fons.append('g')
		.selectAll('path')
		.data(línies)
		.enter()
		.append('path')
			.attr('d', d => d.lin)
			.attr('stroke', d => d.col)
			.attr('stroke-width', d => d.grx)
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('fill', 'none')
			.attr('opacity', 1)
			.attr('classe', d => d.cls)
			.attr('class', d => d.zon);
	return 0;
}

function recP(dada, esc) {
	let alçada = esc.alç(dada.classe);
	let amplada= esc.amp(dada.classe);
	let radi = esc.rad(dada.classe);
	let xPos = esc.x(dada.xPos);
	let yPos = esc.z(dada.zPos);
	return{alç:alçada, amp:amplada, r:radi, xPos:xPos, zPos:yPos, cls:dada.classe, codi:dada.codi};
}

function portals(fons, rects) {
	fons.append('g')
		.selectAll('rect')
		.data(rects)
		.enter()
		.append('rect')
			.attr('x', d => d.x-d.amp/2)
			.attr('y', d => d.y-d.alç/2)
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
	const dX = 500;
	const dZ = 300;
	const veuX = defX-dX;
	const veuZ = defZ-dZ;
	const veuAlç = defAlç+dZ;
	const veuAmp = defAmp+dX;
	const mPle = 10;
	const escIn = escales(rcrX, rcrZ, [defX,defX+defAmp], [defZ,defZ+defAlç]);
	const camIn = trc.map(d => linP(d, escIn, regle1));
	const porIn = pts.map(d => recP(pts, escIn));
	const escVe = escales(rcrX, rcrZ, [veuX+mPle,veuX+veuAmp-mPle], [veuZ+mPle,veuZ+veuAlç-mPle]);
	const camVe = trc.map(d => linP(d, escVe, regle1));
	const porVe = pts.map(d => recP(d, escVe));
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
			.attr('defX', defX).attr('defZ', defZ)
			.attr('defAlç', defAlç).attr('defAmp', defAmp)
			.attr('veuX', veuX).attr('veuZ', veuZ)
			.attr('veuAlç', veuAlç).attr('veuAmp', veuAmp)
			.on('mouseover', function(event) {
				veure(camVe, porVe);
			})
			.on('mouseleave', function(event) {
				amagar(camIn, porIn);
			});
}

const T = 300;
function veure(cam, por) { // veure funció línia (regle1)
	const x = +capa.attr('veuX');
	const y = +capa.attr('veuZ');
	const alç = +capa.attr('veuAlç');
	const amp = +capa.attr('veuAmp');
	capa.transition().duration(T).ease(d3.easeCubic)
		.attr('x', x)
		.attr('y', y)
		.attr('height', alç)
		.attr('width', amp);
	llenç.selectAll('path')
		.filter(function() {return this.classList.contains('v')})
		.transition().duration(T).ease(d3.easeCubic)
		.attr('d', (d,i) => cam[i].lin)
		.attr('stroke-width', 3);
}

function amagar(cam, por) {
	capa.transition()
		.duration(T)
		.ease(d3.easeCubic)
		.attr('x', +capa.attr('defX'))
		.attr('y', +capa.attr('defZ'))
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
	llenç.selectAll('path')
		.filter(function() {return this.classList.contains('v')})
		.transition().duration(T).ease(d3.easeCubic)
		.attr('d', (d,i) => cam[i].lin)
		.attr('stroke-width', 0);
}

var realL, realP, bonicL, bonicP;

function novaEscala(dades) {
	bonic(dades, punts);
}

function primer(dades) {
	let rcrX = d3.extent(punts.map(d => d.xPos));
	let rcrZ = d3.extent(punts.map(d => d.zPos));
	let ranX=[0,alçada*(rcrX[1]-rcrX[0])/(rcrZ[1]-rcrZ[0])];
	let ranZ=[0, alçada];
	let esc = escales(rcrX, rcrZ, ranX, ranZ);

	realP = punts.map(d => recP(d, esc));
	realL = dades.map(d => linP(d, esc, realP, regle1));

	dibuixar(realL.filter(d => d.zon != 'v'), realP.filter(d => d.cls!= 'z'));
/* refer amb punts/dades processades
	let amT = dades.filter(d => d.zona === 'v');
	let amP = punts.filter(d => d.classe=== 'z');
	amagatall(llenç, amP, amT, esc);
	let amagaP = amP.map(d => recP(d, esc));
	let amagaL = amT.map(d => linP(d, esc, amagaP, regle1));

	camins(llenç, amagaL);
	portals(llenç, amagaP);*/
}

function escBon(rcrXp, ranXp, rcrXn, ranXn, rcrZp, ranZp, rcrZn, ranZn) {
	let fonsXp = d3.scaleLinear().domain(rcrXp).range(ranXp);
	let fonsXn = d3.scaleLinear().domain(rcrXn).range(ranXn);
	let fonsZp = d3.scaleLinear().domain(rcrZp).range(ranZp);
	let fonsZn = d3.scaleLinear().domain(rcrZn).range(ranZn);
	return {Xp:fonsXp, Xn:fonsXn, Zp:fonsZp, Zn:fonsZn};
}

function cRel(línia, dada) {
	// línia és l'objecte importat
	// dada són xCoords,zCoords corresponents
	let dx, dy, lon, dir;
	let rCam = Array(dada.xCoords.length).fill(0);
	for (let i = rCam.length-1; i > 0; i--) {
		dx = dada.xCoords[i]-dada.xCoords[i-1];
		dy = dada.zCoords[i]-dada.zCoords[i-1];
		if (dx === dy) {throw new Error("Línia nul·la.")}
		if (dx === 0) {
			lon = dy;
			if (lon > 0) {dir = 's'} else {dir = 'n'}
		} else if (dy === 0) {
			lon = dx;
			if (lon > 0) {dir = 'e'} else {dir = 'o'}
		} else {throw new Error("Línia no ortogonal.")}
		rCam[i] = {lon:Math.abs(lon), dir:dir, est:línia.traça[i]};
	}
	línia.ori = línia.traça[0];
	línia.lin = rCam.slice(1);
	return línia;
}

function eRel(línia, esc) {
	let escala;
	switch(línia.dir) {
		case 'n':
			escala = esc.Zn;
			break;
		case 's':
			escala = esc.Zp;
			break;
		case 'e':
			escala = esc.Xp;
			break;
		case 'o':
			escala= esc.Xn;
			break;
		default:
			throw new Error("Direcció inesperada.")
	}
	línia.lon = escala(línia.lon);
	return línia;
}

function dRel(línia, esc) {
	línia.lin = línia.lin.map((d, i) => eRel(d, esc));
	return línia;
}

function puntsBonics(pVells, lNoves) {
	let pNous = pVells;
	let N = pNous.length;
	pNous[0].xPos = amplada/2;
	pNous[0].zPos = alçada/2;
	pNous[0].bonic= 1;
	let bellesa = [0]; // índexs embellits
	let camins, existeix;
	let iters = 0;
	let x, z, cam, idx;
	const maxit = N;
	while (bellesa.length < N && iters < maxit){
		for (let i=0; i<N; i++) {
			if (!bellesa.includes(i)) {
				camins = lNoves.filter(d => d.lin.map(f => f.est).includes(pNous[i].codi));
				existeix = camins.find(d => bellesa.includes(pNous.findIndex(f => f.codi===d.ori)));
				if (existeix != undefined) {
					// fer camí des d'ori fins a i
					cam = existeix.lin;
					x = pNous[0].xPos;
					z = pNous[0].zPos;
					for (let j=0; j<cam.length; j++) {
						if (cam[j].dir==='n') {
							z -= cam[j].lon;
						} else if (cam[j].dir==='s') {
							z += cam[j].lon;
						} else if (cam[j].dir==='e') {
							x += cam[j].lon;
						} else if (cam[j].dir==='o') {
							x -= cam[j].lon;
						} else {
							throw new Error("Direcció inesperada.");
						}
						idx = pNous.findIndex(d => d.codi===cam[j].est);
						pNous[idx].xPos = x;
						pNous[idx].zPos = z;
						bellesa.push(idx);
					}
				}
			}
		}
		iters += 1;
	}
	if (iters === maxit) {
		throw new Error('Iteracions màximes.')
	}
	return pNous;
}

function regleBonic(dada, parades){
	//...
}

let ranXX = [amplada/4, amplada/2];
let ranZZ = [alçada/4, alçada/2];
let pBonics, lBoniques;
function bonic(línies, parades) {
	// línies, parades són fitxers importats
	var lCoords = línies.map(d => camí(d, parades));
	línies = línies.map((d,i) => cRel(d,lCoords[i]));
	let rcrXp = d3.extent(línies.flatMap(d => d.lin.filter(f => f.dir === 'e').map(f => Math.abs(f.lon))));
	let rcrXn = d3.extent(línies.flatMap(d => d.lin.filter(f => f.dir === 'o').map(f => Math.abs(f.lon))));
	let rcrZp = d3.extent(línies.flatMap(d => d.lin.filter(f => f.dir === 's').map(f => Math.abs(f.lon))));
	let rcrZn = d3.extent(línies.flatMap(d => d.lin.filter(f => f.dir === 'n').map(f => Math.abs(f.lon))));
	let escT = escBon(rcrXp, ranXX, rcrXn, ranXX, rcrZp, ranZZ, rcrZn, ranZZ);
	línies = línies.map(d => dRel(d, escT));
	let pNous = puntsBonics(parades, línies);

	let rcrX = d3.extent(pNous.map(d => d.xPos));
	let rcrZ = d3.extent(pNous.map(d => d.zPos));
	let ranX=[0,amplada];
	let ranZ=[0, alçada];
	let esc = escales(rcrX, rcrZ, ranX, ranZ);
	pBonics = pNous.map(d => recP(d, esc));
	lBoniques= línies.map(d => linP(d, esc, pBonics, regle1));
	mira(pBonics)
	dibuixar(lBoniques, pBonics);

}

function dibuixar(línies, parades) {
	camins(llenç, línies);
	portals(llenç, parades);
}

