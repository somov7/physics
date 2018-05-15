let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

let valve_state = false; // Клапан, true = открыт
let bulb_state = true; // Груша, true = разжата
let ballast_h = 200; // Высота балластного груза
let bulb_close_degree = 1; // 0 - открыта, 1 - закрыта
let bulb_press_time;
let stop_cycle = true;
let water_h;
let ballast_water_h;
let water_volume = 3350;

let lastTime;
let thisTime;
let deltaTime;
let pastTime;

let timeScale = 1;
let isPause = 0;

const startx = -50, starty = 150;
const bulb_press_period = 150;
const bulb_press_period_ph = 450;

/* Физика */
const bulb_volume = 0.5; 
const bottle_volume = 5; // Литры
const poisson = 1.4;
const g = 9.81;
const water_rho = 1000;
let atmosphere_pressure = 101300 // Па
let atmosphere_temperature = 303.1 // Кельвины
let volume, temperature, pressure;

function startPhysics(){
	volume = bulb_volume + bottle_volume;
	temperature = atmosphere_temperature = Number(document.getElementById("atmTemperature").value);
	pressure = atmosphere_pressure = Number(document.getElementById("atmPressure").value);	
	bulb_close_degree_ph = 0;
	pastTime = 0;
}

function calcPhysics(){
	if(bulb_close_degree < 0.999){
		bulb_close_degree += deltaTime / bulb_press_period;
		if(bulb_close_degree >= 0.999)
			bulb_close_degree = 0.999;
	}
	if(bulb_close_degree_ph < 1){
		bulb_close_degree_ph += deltaTime / bulb_press_period_ph;
		if(bulb_close_degree_ph > 1)
			bulb_close_degree_ph = 1;
		let new_volume = bottle_volume + bulb_volume * (1 - bulb_close_degree_ph);
		temperature *= Math.pow(volume / new_volume, poisson - 1);
		pressure *= Math.pow(volume / new_volume, poisson);
		volume = new_volume;
	}
	else{
		if(valve_state){
			temperature = atmosphere_temperature + (temperature - atmosphere_temperature) * Math.pow(Math.E, -0.00153 * deltaTime);
			pressure = atmosphere_pressure + (pressure - atmosphere_pressure) * Math.pow(Math.E, -0.002 * deltaTime);
		}
		else{
			let new_temperature = atmosphere_temperature + (temperature - atmosphere_temperature) * Math.pow(Math.E, -0.000145 * deltaTime);
			pressure *= new_temperature / temperature;
			temperature = new_temperature;
		}
	}
	ballast_water_h = (water_volume - 2 * ballast_h + (pressure - atmosphere_pressure) / (water_rho * g) * 100) / 51;
	water_h = water_volume - ballast_h - ballast_water_h * 50;
}

function updateCaptures(){
	document.getElementById("printVolume").innerHTML = Math.round(volume * 100) / 100 + " Л";
	document.getElementById("printPressure").innerHTML = Math.round(pressure) + " Па";
	document.getElementById("printTemperature").innerHTML = Math.round(temperature * 10) / 10 + " К (" + Math.round((temperature - 273.15) * 10) / 10 + " °C)";
	document.getElementById("printTime").innerHTML = Math.round(pastTime / 10) / 100 + " сек";
	document.getElementById("printWater").innerHTML = Math.round(((water_h) / 3) * 10) / 10 + " мм";
	valveButtonCaptionUpdate();
}

/* Конец физики */

function drawFloor(){
	ctx.beginPath();
	ctx.moveTo(50, 600);
	ctx.lineTo(960, 600);	
	ctx.stroke();

	for (let i = 0; i < 22; ++i) {
      ctx.beginPath();
      ctx.moveTo(60 + i * 40, 640);
      ctx.lineTo(100 + i * 40, 600);
      ctx.stroke();
    }
}

function drawValve(){
	if (valve_state){
		ctx.beginPath();
		ctx.moveTo(252.1, 61);
		ctx.lineTo(259, 57);
		ctx.stroke();
	}
	else{
		ctx.beginPath();
		ctx.moveTo(259,65);
		ctx.lineTo(259,57);
		ctx.stroke();
	}

}

function drawBottle(){
	/*Bottom part*/
	ctx.beginPath();
	ctx.moveTo(150,120);
	ctx.lineTo(150,580);
	ctx.arcTo(150, 600, 170, 600, 20);
	ctx.lineTo(380,600);
	ctx.arcTo(400,600,400,580,20);
	ctx.lineTo(400,120);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(170,120,20,Math.PI, 1.333*Math.PI);
	ctx.lineTo(255,80);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(295,80);
	ctx.arc(380,120,20,1.667*Math.PI, 2*Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(249,71,10, 0.333*Math.PI, 0, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(301,71,10, 0.667*Math.PI, Math.PI);
	ctx.stroke();

	/*Top part*/
	ctx.beginPath();
	ctx.moveTo(284 - 25,71);
	ctx.lineTo(284 - 25,65);
	ctx.moveTo(284 - 25,57);
	ctx.lineTo(284 - 25,50);
	ctx.lineTo(297 - 25,50);
	ctx.moveTo(303 - 25,50);
	ctx.lineTo(316 - 25,50);
	ctx.lineTo(316 - 25,57);
	ctx.moveTo(316 - 25,65);
	ctx.lineTo(316 - 25,71);
	ctx.stroke();
}

function drawRuler(){
	ctx.rect(660, -100, 80, 700);
	ctx.stroke();

	for(let i = 0; i < 151; i++){
		ctx.beginPath();
		ctx.moveTo(660, 450 - 3 * i);
		if(i % 10 == 0){
			ctx.lineTo(710, 450 - 3 * i);
			ctx.fillText("" + i / 10, 715, 453 - 3 * i);
		}
		else if(i % 5 == 0)
			ctx.lineTo(695, 450 - 3 * i);
		else
			ctx.lineTo(680, 450 - 3 * i);
		ctx.stroke();
	}
}

function drawStick(){
	ctx.beginPath();
	ctx.rect(920, -100, 10, 700);
	ctx.stroke();


	ctx.fillStyle="#FFFFFF";
	ctx.beginPath();
	ctx.rect(750, 320 - ballast_h, 190, 10);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle="#000000";
}

function drawStraw(){
	ctx.beginPath();
	ctx.moveTo(290,57);
	ctx.lineTo(340,57);
	ctx.bezierCurveTo(420, 57, 420, -100, 540, -100);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(290,65);
	ctx.lineTo(340,65);
	ctx.bezierCurveTo(428, 65, 428, -92, 540, -92);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(540, 0, 100, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(640, 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(540, 0, 92, 1.5*Math.PI, 2*Math.PI);
	ctx.lineTo(632, 450);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(732, 450, 100, Math.PI, 2*Math.PI, true);
	ctx.lineTo(832, 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(732, 450, 92, Math.PI, 2*Math.PI, true);
	ctx.lineTo(824, 450 - ballast_h);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(832, 450 - ballast_h);
	ctx.lineTo(832 + 50, 450 - ballast_h);
	ctx.lineTo(832 + 50, 300 - ballast_h);
	ctx.lineTo(824 - 50, 300 - ballast_h);
	ctx.lineTo(824 - 50, 450 - ballast_h);
	ctx.lineTo(824, 450 - ballast_h);
	ctx.stroke();
}

function drawBulb(){
	let bulb_gate_r = 150;
	
	let bulb_gate_theta = Math.PI * 0.333 * (1 - bulb_close_degree) + Math.PI * 0.5 * bulb_close_degree; 

	ctx.beginPath();
	ctx.moveTo(265, 50);
	ctx.lineTo(265 - bulb_gate_r * Math.cos(bulb_gate_theta),50 - bulb_gate_r * Math.sin(bulb_gate_theta));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(285, 50);
	ctx.lineTo(285 + bulb_gate_r * Math.cos(bulb_gate_theta),50 - bulb_gate_r * Math.sin(bulb_gate_theta));
	ctx.stroke();

	if(bulb_close_degree > 0.1){

		let t = Math.tan(bulb_gate_theta);
		let l = 90 + 10 * t;
		let r = 50;
		let alpha = Math.PI * 0.5 - bulb_gate_theta;
		let gamma = Math.PI - Math.asin(l / r * Math.sin(alpha));
		let beta = Math.PI - alpha - gamma;
		let phi = 2 * alpha + beta;

		ctx.beginPath();
		ctx.arc(275, -40, 50, 1.5*Math.PI - phi, 1.5*Math.PI + phi);
		ctx.stroke();	

		ctx.beginPath();
		ctx.moveTo(279, 50);
		ctx.quadraticCurveTo(278, 18, Math.min(298, 285 + 46 / t), 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(271, 50);
		ctx.quadraticCurveTo(272, 18, Math.max(252, 265 - 46 / t), 4);
		ctx.stroke();

		if(bulb_close_degree < 0.45){
			ctx.beginPath();
			ctx.arc(275, -40, 50, 0.5*Math.PI + beta, 0.65*Math.PI, true);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(275, -40, 50, 0.5*Math.PI - beta, 0.35*Math.PI);
			ctx.stroke();
		}
	}
	else{

		ctx.beginPath();
		ctx.arc(275, -40, 50, 0.35*Math.PI, 0.65*Math.PI, true);
		ctx.stroke();	


		ctx.beginPath();
		ctx.moveTo(279, 50);
		ctx.quadraticCurveTo(278, 18, 298, 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(271, 50);
		ctx.quadraticCurveTo(272, 18, 252, 4);
		ctx.stroke();

	}
}

function drawWater(){
	let arc_water_alpha = 0;
	if(water_h > 450)
		water_h = 450;
	if(water_h < 0){
		arc_water_alpha = -water_h / 96;
		water_h = 0;
	}
	
	ctx.lineWidth = 6;
	ctx.strokeStyle="#0099FF";

	ctx.beginPath();
	ctx.moveTo(636, 450 - water_h);
	ctx.lineTo(636, 450);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(636 + 96,450, 96, Math.PI - arc_water_alpha, 2*Math.PI, true);
	ctx.lineTo(828, 450 - ballast_h - 1);
	ctx.stroke();

	ctx.fillStyle="#0099FF";
	ctx.fillRect(775, 450 - ballast_h - ballast_water_h, 106, ballast_water_h - 1);

	ctx.fillStyle="#000000";

	ctx.lineWidth = 1;
	ctx.strokeStyle="#000000";

}

function valveButtonCaptionUpdate(){
	if(valve_state)
		document.getElementById("valveButton").value="Закрыть клапан";
	else
		document.getElementById("valveButton").value="Открыть клапан";
}

function changeValveState(){
	valve_state = !valve_state;
	valveButtonCaptionUpdate();
	redraw();
}

function pressBulb(){
	bulb_state = false;
	stop_cycle = false;
	bulb_press_time = lastTime = performance.now();
	startPhysics();
	document.getElementById("bulbButton").disabled = true;
	document.getElementById("ballastHeight").disabled = true;
	document.getElementById("ballastHeight").hidden = true;
	document.getElementById("stateOutput").hidden = false;
	document.getElementById("pauseButton").disabled = false;
	document.getElementById("atmPressure").disabled = true;
	document.getElementById("atmTemperature").disabled = true;
	document.getElementById("atmTemperatureC").disabled = true;
	cycle();
}

function setBallastHeight(){	
	ballast_h = Number(document.getElementById("ballastHeight").value);
	if(ballast_h < 0)
		ballast_h = 0;
	if(ballast_h > 400)
		ballast_h = 400;
	ballast_water_h = (water_volume - 2 * ballast_h) / 51;
	water_h = ballast_h + ballast_water_h;
	updateCaptures();
	redraw();
}

function changeTimeScale(){
	timeScale = Math.pow(2, document.getElementById("timeScaleRange").value);
	document.getElementById("timeScaleCaption").innerHTML = timeScale + "x";
}

function togglePause(){
	isPause = !isPause;
	if(isPause)
		document.getElementById("pauseButton").value = "Продолжить";
	else
		document.getElementById("pauseButton").value = "Пауза";
}

function connectTemperatures(p){
	if(p)
		document.getElementById("atmTemperatureC").value = Math.round((Number(document.getElementById("atmTemperature").value) - 273.15) * 100) / 100;
	else
		document.getElementById("atmTemperature").value = Math.round((Number(document.getElementById("atmTemperatureC").value) + 273.15) * 100) / 100;

}

function redraw(){
	ctx.clearRect(0, 0, 1200, 800);
	ctx.save();
	ctx.translate(startx, starty);
	drawFloor();
	drawBottle();
	drawValve();
	drawStraw();
	drawRuler();
	drawBulb();
	drawWater();
	drawStick();
	ctx.restore();
}

function set(){
	valve_state = false;
	bulb_state = true;
	ballast_h = 400;
	ballast_water_h = 50;
	water_h = 450;
	timeScale = 1;
	bulb_close_degree = 0;
	volume = bottle_volume + bulb_volume;
	pastTime = 0;
	document.getElementById("timeScaleRange").value = 0;
	document.getElementById("stateOutput").hidden = true;
	document.getElementById("atmPressure").value = 101300;
	document.getElementById("atmTemperature").value = 293.15;
	document.getElementById("atmTemperatureC").value = 20;
	pressure = atmosphere_pressure = Number(document.getElementById("atmPressure").value);
	temperature = atmosphere_temperature = Number(document.getElementById("atmTemperature").value);
	updateCaptures();
	redraw();
}

function reset(){
	valve_state = false;
	bulb_state = true;
	setBallastHeight();
	timeScale = 1;
	bulb_close_degree = 0;
	volume = bottle_volume + bulb_volume;
	pressure = atmosphere_pressure;
	temperature = atmosphere_temperature;
	pastTime = 0;
	isPause = 0;
	document.getElementById("bulbButton").disabled = false;
	document.getElementById("ballastHeight").disabled = false;
	document.getElementById("ballastHeight").hidden = false;
	document.getElementById("stateOutput").hidden = true;
	document.getElementById("pauseButton").disabled = true;
	document.getElementById("pauseButton").value = "Пауза";
	document.getElementById("atmPressure").disabled = false;
	document.getElementById("atmTemperature").disabled = false;
	document.getElementById("atmTemperatureC").disabled = false;
	updateCaptures();
	redraw();
}

function stopCycle(){
	if(stop_cycle)
		reset();
	else
		stop_cycle = true;
}

function cycle(){
	thisTime = performance.now();
	deltaTime = (thisTime - lastTime) * timeScale * (1 - isPause);
	pastTime += deltaTime;
	calcPhysics();
	updateCaptures();
	redraw();
	lastTime = thisTime;
	if(!stop_cycle)
		window.requestAnimationFrame(cycle);
	else
		reset();
}

set();