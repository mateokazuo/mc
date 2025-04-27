let fet = false;

function mira (cosa) {
	console.log(JSON.parse(JSON.stringify(cosa)));
}

let Mides;
let Amplada;
let Alçada;

//window.addEventListener('resize', mesura);

let marge, alçada, amplada, finEsc;

let plànol;

let llenç;

let pati;

let act;
const t0 = performance.now();
d3.csv('activitat.csv').then(data => {
	act = data.map(row => {
		return Object.values(row).map(cell => parseFloat(cell));
	});
	mesura();
});

function caminar() {
	d3.json('camins.json').then(generalitat);
}


function mesura() {
	d3.select('#món').selectAll('*').remove();
	const amunt = d3.select('#amunt').node().offsetHeight;
	Alçada = window.innerHeight - amunt;
	Amplada = window.innerWidth;
	finEsc = d3.min([Alçada,Amplada])/800;
	marge = {dalt: 0*finEsc, dreta: 0*finEsc, baix: 0*finEsc, esquerra: 0*finEsc};
	alçada = Alçada - marge.dalt - marge.baix;
	amplada = Amplada - marge.dreta - marge.esquerra;

	caminar();
}

let base = document.createElement('custom');
llenç = d3.select(base);

function generalitat(dades) {
	const t1 = performance.now();
	mira([Alçada, Amplada])
	plànol = d3.select('#món')
		.append('canvas')
			.attr('width', 1000)
			.attr('height', 600)
			.style('position', 'absolute');
	let contx = plànol.node().getContext('2d');

	const cols = d3.scaleSequential()
		.domain([0, 13])
		.interpolator(d3.interpolateRainbow);
	const iso = d3.contours()
		.size([259, 459])
		.thresholds([0,1,2,3,4,5,6,7,8,9,10,11,12]);
	const poli = iso(act);
	let escX = 1000/259;
	let escY = 600/459;
	let pts = 0;
	let pls = 0;
	console.log(poli)
	const t2 = performance.now();
	for (let i=0; i<poli.length; i++) { // per cada multipolígon
		contx.beginPath();
		let mpy = poli[i].coordinates; // agafa multipolígon
		for (let j=0; j<mpy.length; j++) { // per cada polígon
			let ply = mpy[j][0]; // agafa polígon
			contx.moveTo(ply[0][0]*escX,ply[0][1]*escY);
			pls += 1;
			console.log(ply[0][0] * escX, ply[0][1] * escY);
			for (let k=1; k<ply.length; k++) { // per cada punt
				contx.lineTo(ply[k][0]*escX, ply[k][1]*escY);
				pts += 1;
			}
			contx.closePath();
			//contx.stroke();
			contx.fillStyle = cols(i);
			contx.fill();
		}
	}
	console.log('Punts: ', pts);console.log('Polígons: ', pls);
	const t3 = performance.now();
	console.log('Import time:', t1 - t0, 'ms');
	console.log('Processing time:', t2 - t1, 'ms');
	console.log('Rendering time:', t3 - t2, 'ms');
}
