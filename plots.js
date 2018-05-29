c = document.getElementById('plot1Canvas');
let plot1 = c.getContext("2d");
plot1.translate(25, 10);

c = document.getElementById('plot2Canvas');
let plot2 = c.getContext("2d");
plot2.translate(25, 10);

c = document.getElementById('plotH');
let plot3 = c.getContext("2d");
plot3.translate(20, 10);

c = document.getElementById('plot3Canvas');
let plot4 = c.getContext("2d");
plot4.translate(25, 10);

let px;
let py;

function plotPV(){
	plot1.textAlign = "center";
	plot1.fillStyle = "#000000";
	plot1.clearRect(-20, -10, 380, 310);

	plot1.beginPath();
	plot1.moveTo(20, 20);
	plot1.lineTo(20, 280);
	plot1.lineTo(280, 280);
	plot1.stroke();

	plot1.beginPath(); // vmin
	plot1.moveTo(30, 275);
	plot1.lineTo(30, 285);	
	plot1.stroke();

	plot1.beginPath(); // vmax
	plot1.moveTo(270, 275);  
	plot1.lineTo(270, 285);	
	plot1.stroke();

	plot1.beginPath(); // pmax
	plot1.moveTo(15, 30); 
	plot1.lineTo(25, 30);	
	plot1.stroke();

	plot1.beginPath(); // pmin
	plot1.moveTo(15, 270);
	plot1.lineTo(25, 270);	
	plot1.stroke();

	plot1.beginPath(); // pmid
	plot1.moveTo(15, 103.57);
	plot1.lineTo(25, 103.57);	
	plot1.stroke();

	plot1.font="20px Segoe UI"
	plot1.fillText("P (кПа)", 15, 10);
	plot1.fillText("V (л)", 300, 285);

	plot1.font="14px Segoe UI"
	plot1.fillText(vmin, 30, 297);
	plot1.fillText(vmax, 270, 297);

	plot1.fillText(Math.round(pmax / 100) / 10, -5, 35);
	plot1.fillText(Math.round(pmin / 100) / 10, -5, 270);
	plot1.fillText(Math.round(pmid / 100) / 10, -5, 108.57);

	plot1.setLineDash([10, 10]);
	let p = atmosphere_pressure;
	let v = 5.5;
	px = 30 + (v - vmin) / (vmax - vmin) * 240;
	py = 270 - (p - pmin) / (pmax - pmin) * 240;
	
	plot1.lineWidth = 2;
	plot1.beginPath();
	plot1.moveTo(px, py);
	for(v = vmax; v >= vmin; v -= 0.001){
		p = atmosphere_pressure * Math.pow(vmax / v, poisson);  
		px = 30 + (v - vmin) / (vmax - vmin) * 240;
		py = 270 - (p - pmin) / (pmax - pmin) * 240;
		plot1.lineTo(px, py);
	}
	let t = atmosphere_temperature * Math.pow(vmax / vmin, poisson - 1);
	p *= atmosphere_temperature / t;  
	py = 270 - (p - pmin) / (pmax - pmin) * 240;
	plot1.lineTo(30, py);
	plot1.stroke();
	plot1.lineWidth = 1;
	plot1.setLineDash([]);
}

function updatePV(){
	plotPV();
	//plot1.beginPath();
	//plot1.fillStyle = "#000000";
	//plot1.arc(px, py, 1, 0, 2*Math.PI);
	//plot1.fill();
	px = 30 + (volume - vmin) / (vmax - vmin) * 240;
	py = 270 - (pressure - pmin) / (pmax - pmin) * 240;
	plot1.beginPath();
	plot1.fillStyle = "#ff0000";
	plot1.arc(px, py, 5, 0, 2*Math.PI);
	plot1.fill();	
}

function plotPT(){
	plot4.lineWidth = 1;
	plot4.setLineDash([]);
	plot4.textAlign = "center";
	plot4.fillStyle = "#000000";
	plot4.clearRect(-20, -10, 380, 310);

	plot4.beginPath();
	plot4.moveTo(20, 20);
	plot4.lineTo(20, 280);
	plot4.lineTo(280, 280);
	plot4.stroke();

	plot4.beginPath(); // tmin
	plot4.moveTo(30, 275);
	plot4.lineTo(30, 285);	
	plot4.stroke();

	plot4.beginPath(); // tmax
	plot4.moveTo(270, 275);  
	plot4.lineTo(270, 285);	
	plot4.stroke();

	plot4.beginPath(); // pmax
	plot4.moveTo(15, 30); 
	plot4.lineTo(25, 30);	
	plot4.stroke();

	plot4.beginPath(); // pmin
	plot4.moveTo(15, 270);
	plot4.lineTo(25, 270);	
	plot4.stroke();

	plot4.beginPath(); // pmid
	plot4.moveTo(15, 103.57);
	plot4.lineTo(25, 103.57);	
	plot4.stroke();

	plot4.font="20px Segoe UI"
	plot4.fillText("P (кПа)", 15, 10);
	plot4.fillText("T (К)", 300, 285);

	plot4.font="14px Segoe UI"
	plot4.fillText(Math.round(tmin * 10) / 10, 30, 297);
	plot4.fillText(Math.round(tmax * 10) / 10, 270, 297);

	plot4.fillText(Math.round(pmax / 100) / 10, -5, 35);
	plot4.fillText(Math.round(pmin / 100) / 10, -5, 270);
	plot4.fillText(Math.round(pmid / 100) / 10, -5, 108.57);

	plot4.setLineDash([10, 10]);
	let p = atmosphere_pressure;
	let t = atmosphere_temperature;
	px = 30 + (t - tmin) / (tmax - tmin) * 240;
	py = 270 - (p - pmin) / (pmax - pmin) * 240;
	
	plot4.lineWidth = 2;
	plot4.beginPath();
	plot4.moveTo(px, py);
	for(t = tmin; t <= tmax; t += 0.001){
		p = atmosphere_pressure * Math.pow(tmin / t, poisson / (1 - poisson));  
		px = 30 + (t - tmin) / (tmax - tmin) * 240;
		py = 270 - (p - pmin) / (pmax - pmin) * 240;
		plot4.lineTo(px, py);
	}
	py = 270 - (pmid - pmin) / (pmax - pmin) * 240;
	plot4.lineTo(30, py);
	plot4.stroke();
	plot4.lineWidth = 1;
	plot4.setLineDash([]);
}

function updatePT(){
	plotPT();
	px = 30 + (temperature - tmin) / (tmax - tmin) * 240;
	py = 270 - (pressure - pmin) / (pmax - pmin) * 240;
	plot4.beginPath();
	plot4.fillStyle = "#ff0000";
	plot4.arc(px, py, 5, 0, 2*Math.PI);
	plot4.fill();	
}

function plotPVTt(){
	plot2.textAlign = "center";
	plot2.fillStyle = "#000000";
	plot2.stokeStyle = "#000000";
	plot2.clearRect(-20, -10, 980, 310);

	plot2.beginPath();
	plot2.moveTo(20, 20);
	plot2.lineTo(20, 280);
	plot2.lineTo(880, 280);
	plot2.stroke();

	plot2.beginPath();
	plot2.moveTo(20, 275);
	plot2.lineTo(20, 285);	
	plot2.stroke();

	plot2.setLineDash([10, 10]);
	plot2.beginPath();
	plot2.moveTo(130, 285);	
	plot2.lineTo(130, 20);
	plot2.stroke();
	plot2.setLineDash([]);

	plot2.beginPath();
	plot2.moveTo(870, 275);
	plot2.lineTo(870, 285);	
	plot2.stroke();

	plot2.font="20px Segoe UI"
	plot2.fillStyle = "#087c06";
	plot2.fillText("P (кПа),", 15, 10);
	plot2.fillStyle = "#d6250a";
	plot2.fillText("V (л),", 75, 10);
	plot2.fillStyle = "#307fff";
	plot2.fillText("T (К)", 120, 10);
	plot2.fillStyle = "#000000";
	plot2.fillText("t (сек)", 910, 285);

	plot2.font="14px Segoe UI"
	plot2.fillText(Math.round(timemin / 1000), 20, 297);
	plot2.fillText(Math.round(bulb_press_period / 10) / 100, 130, 297);
	plot2.fillText(Math.round(timemax / 1000), 870, 297);

}

let pv, pp, pt, ptime;
let opv, opp, opt, optime;

function updatePVTt(){
	//plotPVTt();
	if(pastTime > timemax)
		return;
	if(pastTime <= bulb_press_period)
		ptime = 30 + (pastTime - timemin) / (bulb_press_period - timemin) * 100;
	else
		ptime = 130 + (pastTime - bulb_press_period) / (timemax - bulb_press_period) * 740;	
	//if(ptime - optime < 0.2)
	//	return;
	pv = 270 - (volume - vmin) / (vmax - vmin) * 240;
	pp = 270 - (pressure - pmin) / (pmax - pmin) * 240;
	pt = 270 - (temperature - tmin) / (tmax - tmin) * 240;
	
	plot2.lineWidth=2;
	plot2.strokeStyle = "#d6250a";
	plot2.beginPath();
	plot2.moveTo(optime, opv);
	plot2.lineTo(ptime, pv);
	plot2.stroke();

	plot2.strokeStyle = "#087c06";
	plot2.beginPath();
	plot2.moveTo(optime, opp);
	plot2.lineTo(ptime, pp);
	plot2.stroke();

	plot2.strokeStyle = "#307fff";
	plot2.beginPath();
	plot2.moveTo(optime, opt);
	plot2.lineTo(ptime, pt);
	plot2.stroke();

	plot2.strokeStyle = "#000000";
	plot2.lineWidth = "1px";

	opv = pv;
	opp = pp;
	opt = pt;
	optime = ptime;
}

let linea, lineb;
let arrx = [], arry = [];
let accum = 0, accum2 = 0, accum3 = 0, accum4 = 0;
let minx, miny, maxx, maxy;

function buildHPlot(){
	document.getElementById("buildHPlot").disabled = true;
	document.getElementById("calcPoints").disabled = true;
	document.getElementById("lab").hidden = false;

	plot3.clearRect(-50, -50, 600, 600);
	plot3.beginPath();
	plot3.moveTo(10, 10);
	plot3.lineTo(10, 490);
	plot3.lineTo(490, 490);
	plot3.stroke();
	
	plot3.beginPath();
	plot3.moveTo(10, 485);
	plot3.lineTo(10, 495);
	plot3.stroke();
	
	plot3.beginPath();
	plot3.moveTo(480, 485);
	plot3.lineTo(480, 495);
	plot3.stroke();

	plot3.beginPath();
	plot3.moveTo(5, 20);
	plot3.lineTo(15, 20);
	plot3.stroke();
	
	minx = 0, maxx = Number(table.rows[table.rows.length - 1].cells[0].innerHTML), miny = 0, maxy = 5;
	for(let i = 1; i < table.rows.length; i++){
		let tr_x = Number(table.rows[i].cells[0].innerHTML);
		let tr_y = Number(table.rows[i].cells[3].innerHTML);
		px = 10 + (tr_x - minx) / (maxx - minx) * 470;
		py = 480 - (tr_y - miny) / (maxy - miny) * 470;
		arrx.push(px);
		arry.push(py);
		plot3.fillStyle = "#ff0000";
		plot3.beginPath();
		plot3.arc(px, py, 5, 0, 2*Math.PI);		
		plot3.fill();
	}
	plot3.font="14px Segoe UI";
	plot3.fillStyle = "black";
	plot3.textAlign = "center"
	plot3.fillText(0, 10, 507);
	plot3.fillText(maxx, 480, 507);
	plot3.fillText(maxy, -5, 25);
	
	plot3.font="20px Segoe UI";
	plot3.fillText("ln(h)", 15, 7);
	plot3.fillText("t (сек)", 520, 495);
	approximate();
	calculate(Math.round((miny + (480 - (10 * linea + lineb)) / (470 / (maxy - miny))) * 100) / 100);
}

function approximate(){
	linea = lineb = 0;
	accum = 0, accum2 = 0, accum3 = 0, accum4 = 0;
	for(let i = 0; i < arrx.length; i++){
		accum += arrx[i] * arry[i];
		accum2 += arrx[i];
		accum3 += arry[i];
		accum4 += arrx[i] * arrx[i];
	}
	linea = (arrx.length * accum - accum2 * accum3) / (arrx.length * accum4 - accum2 * accum2);
	lineb = (accum3 - linea * accum2) / arrx.length;
	arrx.length = arry.length = 0;
	plot3.beginPath();
	plot3.moveTo(10, 10 * linea + lineb);
	plot3.lineTo(480, 480 * linea + lineb);
	plot3.stroke();
	plot3.font="14px Segoe UI";
	plot3.fillText(Math.round((miny + (480 - (10 * linea + lineb)) / (470 / (maxy - miny))) * 100) / 100, -5, 10 * linea + lineb - 5);
}