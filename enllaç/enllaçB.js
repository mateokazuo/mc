let fet = false;

function mira (cosa) {
	console.log(JSON.parse(JSON.stringify(cosa)));
}

let Mides;
let Amplada;
let Alçada;

window.addEventListener('resize', mesura);

let marge, alçada, amplada, finEsc;

let plànol;

let llenç;

let pati;

let punts;
d3.csv('vrx.csv', function(d) {
	d.xPos = +d.xPos;
	d.zPos = +d.zPos;
	return d;
}).then( function(data) {
	punts = data;
	mesura();
});

function caminar() {
	d3.json('camins.json').then(generalitat);
}

function mesura() {
	d3.select('#plànol').selectAll('*').remove();
	const amunt = d3.select('#amunt').node().offsetHeight;
	Alçada = window.innerHeight - amunt;
	Amplada = d3.max([window.innerWidth, Alçada*0.5020689655172413]);
	finEsc = d3.min([Alçada,Amplada])/800;
	marge = {dalt: 30*finEsc, dreta: 150*finEsc, baix: 50*finEsc, esquerra: 125*finEsc};
	alçada = Alçada - marge.dalt - marge.baix;
	amplada = Amplada - marge.dreta - marge.esquerra;
	caminar();
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
		.range(['peru', 'forestgreen', 'greenyellow', 'darkorchid', 'cyan', 'mediumseagreen']);
	let gruix = d3.scaleOrdinal()
		.domain([3, 2, -1])
		.range([10, 3, 3]);
	let opact = d3.scaleOrdinal()
		.domain([3, 2, -1])
		.range([1, 1, 1]);
	let alç = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'ap', 'as', 'a', 'c', 'x', 'ax'])
		.range([30, 20, 12, 12, 12, 12, 0, 0, 0, 0]);
	let amp = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'ap', 'as', 'a', 'c', 'x', 'ax'])
		.range([20, 12, 8, 12, 12, 12, 0, 0, 0, 0]);
	let rad = d3.scaleOrdinal()
		.domain(['e', 'g', 'p', 's', 'ap', 'as', 'a', 'c', 'x', 'ax'])
		.range([4, 2, 1, 4, 4, 4, 0, 0, 0, 0]);
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
	let obj = {grx:gruix, col:esc.c(dada.zona), opc:esc.o(dada.classe), cls:dada.classe, zon:dada.zona, lin:regle(dada, parades), codis:dada.traça};
	return obj;
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
			.attr('zona', d => d.zon)
	return 0;
}

function recP(dada, esc) {
	let alç = esc.alç(dada.classe);
	let amp = esc.amp(dada.classe);
	let radi = esc.rad(dada.classe);
	let xPos = esc.x(dada.xPos);
	let yPos = esc.z(dada.zPos);
	return{alç:alç, amp:amp, r:radi, xPos:xPos, zPos:yPos, cls:dada.classe, codi:dada.codi, nom:dada.nom, esp:dada.espai};
}

function portals(fons, rects) {
	fons.append('g')
		.selectAll('rect')
		.data(rects)
		.enter()
		.append('rect')
			.attr('AAA', d => d.codi)
			.attr('x', d => d.xPos-d.amp/2)
			.attr('y', d => d.zPos-d.alç/2)
			.attr('height', d => d.alç)
			.attr('width', d=> d.amp)
			.attr('rx', d => d.r)
			.attr('ry', d => d.r)
			.attr('fill', d => d.cls.includes('s') ? 'silver':'orchid')
			.attr('stroke-width', 2)
			.attr('stroke', d => d.cls.includes('s') ? 'dimgray':'midnightblue')
			.attr('classe', d => d.cls);
	return 0;
}
const marX = -10;
const marY = -5;

function nomP(pt, esc) {
	let obj
	switch (pt.esp) {
		case 'ee':
			obj = {nom:pt.nom, dreta:`calc(100% - ${pt.xPos+marX+marge.esquerra}px)`, amunt:`${pt.zPos+marY+marge.dalt+pt.alç/2}px`, trans:'translateY(-50%)', ali:'right'};
			break;
		case 'ae':
			obj = {nom:pt.nom, dreta:`calc(100% - ${pt.xPos+marX+marge.esquerra}px)`, baix:`calc(100% - ${pt.zPos+marY+marge.dalt}px)`, ali:'right'};
			break;
		case 'be':
			obj = {nom:pt.nom, dreta:`calc(100% - ${pt.xPos+marX+marge.esquerra}px)`, amunt:`${pt.zPos+marY+marge.dalt+pt.alç}px`, ali:'right'};
			break;
		case 'dd':
			obj = {nom:pt.nom, esquerra:`${pt.xPos+marX+marge.esquerra+pt.amp+5}px`, amunt:`${pt.zPos+marY+marge.dalt+pt.alç/2}px`, trans:'translateY(-50%)', ali:'left'};
			break;
		case 'ad':
			obj = {nom:pt.nom, esquerra:`${pt.xPos+marX+marge.esquerra+pt.amp}px`, baix:`calc(100% - ${pt.zPos+marY+marge.dalt-pt.alç/2}px)`, ali:'left'};
			break;
		case 'bd':
			obj = {nom:pt.nom, esquerra:`${pt.xPos+marX+marge.esquerra+pt.amp}px`, amunt:`${pt.zPos+marY+marge.dalt+pt.alç}px`, ali:'left'};
			break;
		case 'aa':
			obj = {nom:pt.nom, esquerra:`${pt.xPos+marX+marge.esquerra+pt.amp/2}px`, baix:`calc(100% - ${pt.zPos+marY+marge.dalt-pt.alç/2}px)`, trans:'translateX(-50%)', ali:'center'};
			break;
		case 'bb':
			obj = {nom:pt.nom, esquerra:`${pt.xPos+marX+marge.esquerra+pt.amp/2}px`, amunt:`${pt.zPos+marY+marge.dalt+pt.alç}px`, trans:'translateX(-50%)', ali:'center'};
			break;
		case 'xx':
			obj = {nom:''};
			break;
		default:
			console.log(pt.esp)
			throw new Error('Orientació desconeguda.');
	}
	obj.mida = esc.m(pt.cls);
	obj.sep = esc.s(pt.cls);
	obj.codi = pt.codi;
	obj.cls = pt.cls;
	return obj;
}

function noms(dades) {
	d3.select('#plànol')
		.selectAll('.etiqueta')
		.data(dades)
		.enter()
		.append('div')
			.style('position', 'absolute')
			.style('display', 'flex')
			.style('flex-direction', 'column')
			.style('justify-content', 'center')
			.style('font-family', 'Tahoma')
			.style('font-size', d => d.mida)
			.style('line-height', d => d.sep)
			.style('font-weight', d => parseInt(d.mida)>13*finEsc?'bold':'normal')
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix)
			.style('transform', d => d.trans)
			.style('text-align', d => d.ali)
			.html(d => d.nom)
			.attr('codi', d => d.codi)
			.attr('classe', d => d.cls)
			.attr('class', 'etiqueta');
}

let capa, camIn, porIn, camVe, porVe;
function amagatall(fons, pts, trc, esc){
	const ple = 1;
	const rcrX = d3.extent(pts.map(d => d.xPos));
	const rcrZ = d3.extent(pts.map(d => d.zPos));
	const defX = esc.x(rcrX[0])-ple;
	const defZ = esc.z(rcrZ[0])-ple;
	const defAlç = esc.z(rcrZ[1])-esc.z(rcrZ[0])+2*ple;
	const defAmp = esc.x(rcrX[1])-esc.x(rcrX[0])+2*ple;
	const dX = 230*finEsc;
	const dZ = dX*(rcrZ[1]-rcrZ[0])/(rcrX[1]-rcrX[0]);
	const pleA = 0*finEsc;
	const pleB = 30*finEsc;
	const pleD = 10*finEsc;
	const pleE = 40*finEsc;
	const veuX = defX;
	const veuZ = defZ-dZ;
	const veuAlç = defAlç+dZ;
	const veuAmp = defAmp+dX;
	const mPle = 15-ple;
	const escVe = escales(rcrX, rcrZ, [veuX+mPle+pleE,veuX+veuAmp-mPle], [veuZ+mPle+pleA,veuZ+veuAlç-mPle]);
	porVe = pts.map(d => recP(d, escVe));
	camVe = trc.map(d => linP(d, escVe, porVe, regle1));
	const escIn = escales(rcrX, rcrZ, [defX,defX+defAmp], [defZ,defZ+defAlç]);
	porIn = pts.map(d => recP(d, escIn));
	camIn = trc.map(d => linP(d, escIn, porIn, regle1));

	capa = fons.append('rect')
			.attr('x', defX)
			.attr('y', defZ)
			.attr('height', 0)
			.attr('width', 0)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('fill', 'white')
			.attr('stroke', 'black')
			.attr('stroke-width', 3)
			.attr('classe', 'COI')
			.attr('defX', defX).attr('defZ', defZ)
			.attr('defAlç', defAlç).attr('defAmp', defAmp)
			.attr('veuX', veuX).attr('veuZ', veuZ)
			.attr('veuAlç', veuAlç+pleA+pleB).attr('veuAmp', veuAmp+pleD+pleE);
	// primer segment de primera línia amagada
	let am0 = porIn.find(d => d.codi===camIn[0].codis[0]);
	let am1 = porIn.find(d => d.codi===camIn[0].codis[1]);

	let dx,dy,linA, linB, linC, Xesc;
	Xesc = {c:function(x){return 'mediumseagreen'}, o:function(x){return 1}, g:function(x){return 10}}
	dx = am1.xPos-am0.xPos;
	dy = am1.zPos-am0.zPos;
	if (dx === dy) {throw new Error("Línia nul·la.")}
	if (dx === 0) {
		linB = linP({traça:['pA','pB'], zona:'v', classe:-1},Xesc,[{codi:'pA',xPos:defX,zPos:am0.zPos},{codi:'pB',xPos:defX +defAmp,zPos:am0.zPos}],regle1);
		am0 = porVe.find(d => d.codi===am0.codi);
		linC = linP({traça:['pA','pB'], zona:'v', classe:-1},Xesc,[{codi:'pA',xPos:veuX,zPos:am0.zPos},{codi:'pB',xPos:veuX+ veuAmp+pleD+pleE,zPos:am0.zPos}],regle1);
		am0 = pBonics.find(d => d.codi===amagaI);
		am1 = pBonics.find(d => d.codi===amagaF);
		linA = linP({traça:['pA','pB'], zona:'v', classe:3},Xesc,[{codi:'pA',xPos:am0.xPos,zPos:am0.zPos},{codi:'pB',xPos:am1.xPos,zPos:am1.zPos}],regle1);
	} else if (dy === 0) {
		linB = linP({traça:['pA','pB'], zona:'v', classe:-1},Xesc,[{codi:'pA',xPos:am0.xPos,zPos:defZ},{codi:'pB',xPos:am0.xPos,zPos:defZ+ defAlç}],regle1);
		am0 = porVe.find(d => d.codi===am0.codi);
		linC = linP({traça:['pA','pB'], zona:'v', classe:-1},Xesc,[{codi:'pA',xPos:am0.xPos,zPos:veuZ},{codi:'pB',xPos:am0.xPos,zPos:veuZ+ veuAlç+pleA+pleB}],regle1);
		am0 = pAmBonics.find(d => d.codi===am0.codi);
		am1 = pAmBonics.find(d => d.codi===am1.codi);
		linA = linP({traça:['pA','pB'], zona:'v', classe:3},Xesc,[{codi:'pA',xPos:am0.xPos,zPos:am0.zPos},{codi:'pB',xPos:am1.xPos,zPos:am1.zPos}],regle1);

	} else {throw new Error("Línia no ortogonal...")}
	capa.attr('linA', linA.lin).attr('linB', linB.lin).attr('linC', linC.lin);
}

const T = 300;
function veure(cam, por) { // veure funció línia (regle1)
	const x = +capa.attr('veuX');
	const y = +capa.attr('veuZ');
	const alç = +capa.attr('veuAlç');
	const amp = +capa.attr('veuAmp');
	capa.transition().duration(T).ease(d3.easeCubic)
		.attr('y', y)
		.attr('height', alç)
		.attr('width', amp);
	pati.transition().duration(T).ease(d3.easeCubic)
		.style('top', (y+marge.dalt-2)+'px')
		.attr('height', 10+alç)
		.attr('width', 10+amp);
	capa2.transition().duration(T).ease(d3.easeCubic)
		.attr('y', 2)
		.attr('height', alç)
		.attr('width', amp);
	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')<0})
		.data(cam).transition().duration(T).ease(d3.easeCubic)
		.attr('d', d => d.lin)
		.attr('stroke-width', 3);
	llenç.selectAll('rect')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(por).transition().duration(T).ease(d3.easeCubic)
		.attr('x', d => d.xPos-d.amp/2)
		.attr('y', d => d.zPos-d.alç/2)
		.attr('height', d => d.alç)
		.attr('width', d => d.amp);
	barra.transition().duration(T).ease(d3.easeCubic)
		.attr('d', capa.attr('linC'))
		.attr('stroke-width', 10);
	d3.select('#plànol').selectAll('.etiqueta')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(etiqRM).style('transform', d => d.trans)
		.transition().duration(T).ease(d3.easeCubic)
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix)
			.style('opacity', 1);
	d3.select('#plànol').selectAll('.etiqueta')
		.filter(function() {return !d3.select(this).attr('classe').includes('a')})
		.transition().duration(T).ease(d3.easeCubic)
			.style('opacity', 0)
			.on('end', function() {
				d3.select(this).style('transform', 'translateX(-550%)');
			});

}

function amagar(cam, por) {
	capa.transition().duration(T).ease(d3.easeCubic)
		.attr('y', +capa.attr('defZ'))
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
	pati.transition().duration(T).ease(d3.easeCubic)
		.style('top', (marge.dalt+ +capa.attr('defZ')-2)+'px')
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
	capa2.transition().duration(T).ease(d3.easeCubic)
		.attr('y', 2)
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));

	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')<0})
		.data(cam).transition().duration(T).ease(d3.easeCubic)
		.attr('d', d => d.lin)
		.attr('stroke-width', 0);
	llenç.selectAll('rect')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(por).transition().duration(T).ease(d3.easeCubic)
		.attr('x', d => d.xPos-d.amp/2)
		.attr('y', d => d.zPos-d.alç/2)
		.attr('height', 0)
		.attr('width', 0);
	barra.transition().duration(T).ease(d3.easeCubic)
		.attr('d', capa.attr('linB'))
		.attr('stroke-width', 0);
	d3.select('#plànol').selectAll('.etiqueta')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(etiqRA).transition().duration(T).ease(d3.easeCubic)
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix)
			.style('opacity', 0).on('end', function() {
				d3.select(this).style('transform', 'translateX(-550%)');
			});
	d3.select('#plànol').selectAll('.etiqueta')
			.data(etiqR).style('transform', d => d.trans)
			.transition().duration(T).ease(d3.easeCubic)
			.style('opacity', 1);
}

let realL, realP, amagaL, amagaP, amT, amP, panX, panZ, escGran;


function real(línies) {
	let dades = JSON.parse(JSON.stringify(línies));
	let parades = JSON.parse(JSON.stringify(punts));
	let rcrX = d3.extent(punts.map(d => d.xPos));
	let rcrZ = d3.extent(punts.map(d => d.zPos));
	panX=[0,alçada*(rcrX[1]-rcrX[0])/(rcrZ[1]-rcrZ[0])];
	panZ=[0, alçada];
	escGran = escales(rcrX, rcrZ, panX, panZ);

	realP = parades.map(d => recP(d, escGran));
	realL = dades.map(d => linP(d, escGran, realP, regle1)).filter(d => !d.zon.includes('v'));
	realP = realP.filter(d => !d.cls.includes('a'));
	amT = dades.filter(d => d.zona.includes('v'));
	amP = parades.filter(d => d.classe.includes('a'));
}

function escBon(rcrXp, ranXp, rcrXn, ranXn, rcrZp, ranZp, rcrZn, ranZn) {
	let fonsXp = d3.scaleLog().domain(rcrXp).range(ranXp);
	let fonsXn = d3.scaleLog().domain(rcrXn).range(ranXn);
	let fonsZp = d3.scaleLog().domain(rcrZp).range(ranZp);
	let fonsZn = d3.scaleLog().domain(rcrZn).range(ranZn);
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
		rCam[i] = {lon:Math.abs(lon), dir:dir, est:línia.traça[i], classe:línia.classe, ajs:línia.ajust};
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
	línia.lon = escala(línia.lon)*línia.ajs;
	mira(finEsc)
	return línia;
}

function dRel(línia, esc) {
	línia.lin = línia.lin.map((d, i) => eRel(d, esc));
	return línia;
}

function ésEntre (pt, ori, dest) {
	ori = punts.find(d => d.codi===ori);
	dest = punts.find(d => d.codi===dest);
	let x0,z0,x1,z1;
	x0 = ori.xPos; z0 = ori.zPos;
	x1 = dest.xPos; z1 = dest.zPos;
	if (x0 === x1) {
		if (d3.min([z0,z1])<=pt.zPos && pt.zPos<=d3.max([z0,z1]) && x0 === pt.xPos) {
			pt.rz = (pt.zPos-z0)/(z1-z0);
			pt.rx = 0;
			return true;
		} else {return false;}
	} else if (z0 === z1) {
		if (d3.min([x0,x1])<=pt.xPos && pt.xPos<=d3.max([x0,x1]) && z0 === pt.zPos) {
			pt.rx = (pt.xPos-x0)/(x1-x0);
			pt.rz = 0;
			return true;
		} else {return false;}
	} else {
		throw new Error("Línies no ortogonals!");
	}
}

function fim(boo) {
	if (boo) {
		return -1;
	}
	return 1;
}

function endreça(a, b, d) {
	a = punts.find(d => d.codi === a);
	b = punts.find(d => d.codi === b);
	switch (d) {
		case 'n':
			return fim(a.zPos > b.zPos);
		case 's':
			return fim(a.zPos < b.zPos);
		case 'e':
			return fim(a.xPos < b.xPos);
		case 'o':
			return fim(a.xPos > b.xPos);
		default:
			throw new Error("Direcció inesperada?");
	}
}

function recaminar(fills, pts, línies) {
	// iniciar amb pare=-1, acabar quan no fills
	let x0, x1, z0, z1, cam, ori, cum, puntet, net, nets;
	for (let i=0; i<fills.length; i++) {
		cam = fills[i];
		net = línies.filter(d => d.pare===cam.idn);
		ori = pts.find(d => d.codi===cam.ori);
		x0 = ori.xPos; x1 = x0;
		z0 = ori.zPos; z1 = z0;
		for (let j=0; j<cam.lin.length; j++) {
			cum = cam.lin[j];
			switch (cum.dir) {
				case 'n':
					z1 = z0 - cum.lon;
					break;
				case 's':
					z1 = z0 + cum.lon;
					break;
				case 'e':
					x1 = x0 + cum.lon;
					break;
				case 'o':
					x1 = x0 - cum.lon;
					break;
				default:
					throw new Error("Direcció inesperada!");
			}
			nets = net.filter(d => ésEntre(pts.find(p => p.codi===d.ori),ori.codi,cum.est));
			puntet = pts.find(d => d.codi===cum.est);
			puntet.xPos = x1;
			puntet.zPos = z1;
			puntet.bonic = true;
			if (nets.map(d => d.ori).includes(amaga0)) {
				// conté origen de secció amagada
				amagaI = ori.codi;
				amagaF = cum.est;
			}
			if (nets.length > 0) {
				if (nets.length > 1) {
					nets.sort(function(a,b) {return endreça(a.ori,b.ori,cum.dir); })
					let dx = (x1-x0)/(nets.length+1);
					let dz = (z1-z0)/(nets.length+1);
					for (let k=0; k<nets.length; k++) {
						puntet = pts.find(d => d.codi===nets[k].ori);
						puntet.xPos = x0 + dx*(k+1);
						puntet.zPos = z0 + dz*(k+1);
						puntet.bonic = true;
					}
				} else {
					puntet = pts.find(d => d.codi===nets[0].ori)
					puntet.xPos = x0 + puntet.rx*(x1-x0);
					puntet.zPos = z0 + puntet.rz*(z1-z0);
					puntet.bonic = true;
				}
				recaminar(nets, pts, línies);
			}
			x0 = x1;
			z0 = z1;
			ori = pts.find(d => d.codi === cum.est);
		}
	}
	return pts;
}

function puntsBonics(pVells, lNoves) {
	let pNous = JSON.parse(JSON.stringify(pVells));
	let N = pNous.length;
	pNous[0].xPos = amplada/2;
	pNous[0].zPos = alçada/2;
	pNous[0].bonic= true;
	let vells = lNoves.filter(d => d.pare===-1);
	pNous = recaminar(vells, pNous, lNoves);
	return pNous;
}

let ranXX;
let ranZZ;
let pBonics, lBoniques, pAmBonics, lAmBoniques;
function boni(línies, parades) {
	// línies, parades són fitxers importats
	ranXX = [amplada/8, amplada/2];
	ranZZ = [alçada/8, alçada/2];
	let lCoords = línies.map(d => camí(d, parades));
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
	mira(ranX)
	let esc = escales(rcrX, rcrZ, ranX, ranZ);
	pNous = pNous.map(d => recP(d, esc));
	línies= línies.map(d => linP(d, esc, pNous, regle1));
	pBonics = pNous.filter(d => !d.cls.includes('a'));
	lBoniques = línies.filter(d => !d.zon.includes('v'));
	pAmBonics = pNous.filter(d => d.cls.includes('a'));
	lAmBoniques = línies.filter(d => d.zon.includes('v'));
}

function dibuixar(parades, línies) {
	camins(llenç, línies);
	portals(llenç, parades);
}


function ferBonic() {
	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')>=0})
		.data(lBoniques).transition().duration(T).ease(d3.easeCubic)
			.attr('d', d => d.lin);
	llenç.selectAll('rect')
		.filter(function() {return !d3.select(this).attr('classe').includes('a')})
		.data(pBonics).transition().duration(T).ease(d3.easeCubic)
			.attr('x', d => d.xPos-d.amp/2)
			.attr('y', d => d.zPos-d.alç/2);
	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')<0})
		.data(lAmBoniques).transition().duration(T).ease(d3.easeCubic)
			.attr('d', d => d.lin)
			.attr('stroke-width', 2);
	llenç.selectAll('rect')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(pAmBonics).transition().duration(T).ease(d3.easeCubic)
			.attr('x', d => d.xPos-d.amp/2)
			.attr('y', d => d.zPos-d.alç/2)
			.attr('height', d => d.alç)
			.attr('width', d => d.amp);
	capa.transition().duration(T/5).ease(d3.easeCubic)
		.attr('height', 0)
		.attr('width', 0);
	pati.transition().duration(T).ease(d3.easeCubic)
		.attr('height', 0)
		.attr('width', 0);
	capa2.transition().duration(T/5).ease(d3.easeCubic)
		.attr('height', 0)
		.attr('width', 0);
	barra.transition().duration(T).ease(d3.easeCubic)
		.attr('d', capa.attr('linA'))
		.attr('stroke-width', 10)
		.attr('stroke-linecap', 'round');
	d3.select('#plànol').selectAll('.etiqueta')
		.data(etiqB).style('transform', d => d.trans)
		.transition().duration(T).ease(d3.easeCubic)
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix)
			.style('opacity', 1);
}

function ferReal() {
	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')>=0})
		.data(realL).transition().duration(T).ease(d3.easeCubic)
			.attr('d', d => d.lin);
	llenç.selectAll('rect')
		.filter(function() {return !d3.select(this).attr('classe').includes('a')})
		.data(realP).transition().duration(T).ease(d3.easeCubic)
			.attr('x', d => d.xPos-d.amp/2)
			.attr('y', d => d.zPos-d.alç/2);
	capa.transition().duration(T).ease(d3.easeCubic)
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
	pati.transition().duration(T).ease(d3.easeCubic)
		.attr('height', 10+ +capa.attr('defAlç'))
		.attr('width', 10+ +capa.attr('defAmp'));
	capa2.transition().duration(T).ease(d3.easeCubic)
		.attr('height', +capa.attr('defAlç'))
		.attr('width', +capa.attr('defAmp'));
	llenç.selectAll('path')
		.filter(function() {return d3.select(this).attr('classe')<0})
		.data(amagaL).transition().duration(T).ease(d3.easeCubic)
			.attr('d', d => d.lin)
			.attr('stroke-width', 0);
	llenç.selectAll('rect')
		.filter(function() {return d3.select(this).attr('classe').includes('a')})
		.data(amagaP).transition().duration(T).ease(d3.easeCubic)
			.attr('x', d => d.xPos-d.amp/2)
			.attr('y', d => d.zPos-d.alç/2)
			.attr('height', 0)
			.attr('width', 0);
	barra.transition().duration(T).ease(d3.easeCubic)
		.attr('d', capa.attr('linB'))
		.attr('stroke-width', 0)
		.attr('stroke-linecap', 'butt');
	d3.select('#plànol').selectAll('.etiqueta')
		.filter(function() {return !d3.select(this).attr('classe').includes('a')})
		.data(etiqR).style('transform', d => d.trans)
		.transition().duration(T).ease(d3.easeCubic)
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix);
	d3.select('#plànol').selectAll('.etiqueta')
	.filter(function() {return d3.select(this).attr('classe').includes('a')})
	.data(etiqRA).transition().duration(T).ease(d3.easeCubic)
			.style('left', d => d.esquerra)
			.style('right', d => d.dreta)
			.style('top', d => d.amunt)
			.style('bottom', d => d.baix)
			.style('opacity', 0).on('end', function() {
				d3.select(this).style('transform', 'translateX(-550%)');
			});;
}

let etiqB, etiqR, etiqRA, etiqRM;
let escB =  {
	m:function(classe) {
		if (classe === 'a') {
			return '0px'
		}
		if (classe.includes('a')) {
			return 12*finEsc+'px'
		}
		switch(classe) {
			case 'e':
				return 20*finEsc+'px';
			case 'g':
				return 15*finEsc+'px';
			case 'p':
				return 12*finEsc+'px';
			case 's':
				return 15*finEsc+'px';
			default:
				return '0px';
		}
	},
	s:function(classe) {
		if (classe === 'a') {
			return '0px'
		}
		if (classe.includes('a')) {
			return 10*finEsc+'px'
		}
		switch(classe) {
			case 'e':
				return 18*finEsc+'px';
			case 'g':
				return 12*finEsc+'px';
			case 'p':
				return 10*finEsc+'px';
			case 's':
				return 12*finEsc+'px';
			default:
				return '0px';
		}
	}
}

let escR =  {
	m:function(classe) {
		if (classe === 'a') {
			return '0px'
		}
		if (classe.includes('a')) {
			return '12px'
		}
		switch(classe) {
			case 'e':
				return '20px';
			case 'g':
				return '15px';
			case 'p':
				return '12px';
			case 's':
				return '15px';
			default:
				return '0px';
		}
	},
	s:function(classe) {
		if (classe === 'a') {
			return '0px'
		}
		if (classe.includes('a')) {
			return '10px'
		}
		switch(classe) {
			case 'e':
				return '18px';
			case 'g':
				return '12px';
			case 'p':
				return '10px';
			case 's':
				return '12px';
			default:
				return '0px';
		}
	}
}

let barra, capa2, amaga0, amagaI, amagaF;

function generalitat(dades) {
	mira([Alçada, Amplada])
	plànol = d3.select('#plànol')
		.append('svg')
			.attr("preserveAspectRatio", "xMidYMid meet")
			.style("width", "100%")
			.style("height", "100%")
			.style("position", "absolute")
			.style("top", "0px")
			.style("left", "0px");
	llenç = plànol
		.append('g')
			.attr('transform', `translate(${marge.esquerra},${marge.dalt})`);

	amaga0 = punts.find(d => d.codi===dades.find(f => f.classe<0).traça[0]).codi;
	boni(dades, punts);
	dibuixar(pBonics, lBoniques);
	real(dades);

	etiqB = [...pBonics, ...pAmBonics].map(d => nomP(d, escB));
	etiqR = realP.map(d => nomP(d, escB));
	noms(etiqB);

	let rcrX = d3.extent(punts.map(d => d.xPos));
	let rcrZ = d3.extent(punts.map(d => d.zPos));
	let esc = escales(rcrX, rcrZ, panX, panZ);
	amagatall(llenç, amP, amT, escGran);
	amagaP = amP.map(d => recP(d, escGran));
	etiqRA = porIn.map(d => nomP(d, escR));
	etiqRM = porVe.map(d => nomP(d, escR));
	amagaL = amT.map(d => linP(d, escGran, amagaP, regle1));

	dibuixar(pAmBonics, lAmBoniques);
	pati = d3.select('#plànol')
		.append('svg')
		.attr('height', 0)
		.attr('width', 0)
		.style('z-index', 1)
		.style('position', 'absolute')
		.style('top', (marge.dalt+ +capa.attr('defZ') -2)+'px')
		.style('left', (marge.esquerra+ +capa.attr('defX') -2)+'px');

	barra = llenç.append('path')
		.attr('barra', 's')
		.attr('d', capa.attr('linA'))
		.attr('stroke-width', 10)
		.attr('stroke-linecap', 'round')
		.attr('stroke', 'forestgreen')
		.attr('fill', 'none')
		.attr('classe', 3);
	capa2 = pati.append('rect')
		.attr('fimo', 'sis')
		.attr('x', 2)
		.attr('y', 2)
		.attr('height', 0)
		.attr('width', 0)
		.attr('rx', capa.attr('rx'))
		.attr('ry', capa.attr('ry'))
		.attr('stroke', capa.attr('stroke'))
		.attr('fill', 'transparent')
		.attr('stroke-width', capa.attr('stroke-width'))
		.on('mouseover', function(event) {
			veure(camVe, porVe);
		})
		.on('mouseleave', function(event) {
			amagar(camIn, porIn);
		});
	d3.select("#escala input[name='escala'][value='bonic']").property('checked', true);
	d3.select('#escala').on('change', () => {
		const escala = d3.select("#escala input[name='escala']:checked").node().value;
		if (escala === 'bonic') {ferBonic();} else {ferReal();}
	});
}
