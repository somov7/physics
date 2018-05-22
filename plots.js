c = document.getElementById('plot1Canvas');
let plot1 = c.getContext("2d");
plot1.translate(20, 0);

let px;
let py;

function plotPV(){
	plot1.textAlign = "center";
	plot1.fillStyle = "#000000";
	plot1.clearRect(-20, 0, 370, 300);

	plot1.beginPath();
	plot1.moveTo(20, 20);
	plot1.lineTo(20, 280);
	plot1.lineTo(280, 280);
	plot1.stroke();

	plot1.beginPath();
	plot1.moveTo(30, 275);
	plot1.lineTo(30, 285);	
	plot1.stroke();

	plot1.beginPath();
	plot1.moveTo(270, 275);
	plot1.lineTo(270, 285);	
	plot1.stroke();

	plot1.beginPath();
	plot1.moveTo(15, 30);
	plot1.lineTo(25, 30);	
	plot1.stroke();

	plot1.beginPath();
	plot1.moveTo(15, 270);
	plot1.lineTo(25, 270);	
	plot1.stroke();

	plot1.font="20px Segoe UI"
	plot1.fillText("P (кПа)", 15, 20);
	plot1.fillText("V (л)", 300, 285);

	plot1.font="13px Segoe UI"
	plot1.fillText(vmin, 30, 295);
	plot1.fillText(vmax, 270, 295);

	plot1.fillText(Math.round(pmax / 100) / 10, -2, 35);
	plot1.fillText(Math.round(pmin / 100) / 10, -2, 275);

	plot1.setLineDash([10, 10]);
	let p = atmosphere_pressure;
	let v = 5.5;
	px = 30 + (v - vmin) / (vmax - vmin) * 240;
	py = 270 - (p - pmin) / (pmax - pmin) * 240;
	
	plot1.lineWidth = 0.5;
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
	plot1.arc(px, py, 3, 0, 2*Math.PI);
	plot1.fill();	
}