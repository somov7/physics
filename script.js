let c = document.getElementById('myCanvas');
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
let ruler_h = 250;

let lastTime;
let thisTime;
let deltaTime;
let pastTime;

let timeScale = 1;
let isPause = 0;

const startx = -50, starty = 150;
const bulb_press_period = 350;
const bulb_press_period_ph = 350;

/* Физика */
const bulb_volume = 0.5;  
const bottle_volume = 5; // Литры
const poisson = 1.4; // Коэффициент Пуассона
const g = 9.81; // м / с
const water_rho = 1000; // кг / м^3
let atmosphere_pressure = 101300 // Па
let atmosphere_temperature = 303.1 // Кельвины
let volume, temperature, pressure;

let pmax, pmin, vmax, vmin;

function startPhysics(){
	volume = bulb_volume + bottle_volume;
	temperature = atmosphere_temperature = Number(document.getElementById("atmTemperature").value);
	pressure = atmosphere_pressure = Number(document.getElementById("atmPressure").value);	
	bulb_close_degree_ph = 0;
	pastTime = 0;
	vmin = bottle_volume;
	vmax = bottle_volume + bulb_volume;
	pmin = atmosphere_pressure;
	pmax = pmin * Math.pow(vmax/vmin, poisson);
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
			let new_temperature = atmosphere_temperature + (temperature - atmosphere_temperature) * Math.pow(Math.E, -0.000104 * deltaTime);
			pressure *= new_temperature / temperature;
			temperature = new_temperature;
		}
	}
	ballast_water_h = (water_volume - 2 * ballast_h + (pressure - atmosphere_pressure) / (water_rho * g) * 100 * (450/ruler_h)) / 51;
	water_h = water_volume - ballast_h - ballast_water_h * 50;
}

function updateCaptures(){
	document.getElementById("printVolume").innerHTML = Math.round(volume * 100) / 100 + " Л";
	document.getElementById("printPressure").innerHTML = Math.round(pressure) + " Па";
	document.getElementById("printTemperature").innerHTML = Math.round(temperature * 10) / 10 + " К (" + Math.round((temperature - 273.15) * 10) / 10 + " °C)";
	document.getElementById("printTime").innerHTML = Math.round(pastTime / 10) / 100 + " сек";
	valveButtonCaptionUpdate();
}

/* Конец физики */

document.addEventListener('keydown', (event) => {
	if(event.keyCode == 32){
		if(bulb_close_degree > 0)
			togglePause();
	}
});

let draw_dash = true; 
let mx, my;

function getCursorPos(e){
	draw_dash = true;
	mx = e.clientX;
	my = e.clientY;
	redraw();
}

function ungetCursorPos(e){
	draw_dash = false;	
	redraw();
}

function toggleLine(e){
	draw_dash = !draw_dash;
	redraw();
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
	document.getElementById("plots").hidden = false;
	cycle();
}

function setBallastHeight(){	
	ballast_h = Number(document.getElementById("ballastHeight").value);
	ballast_h -= 68;
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
	if(p){
		document.getElementById("atmTemperature").value = Math.min(document.getElementById("atmTemperature").value, document.getElementById("atmTemperature").max);
		document.getElementById("atmTemperature").value = Math.max(document.getElementById("atmTemperature").value, document.getElementById("atmTemperature").min);	
		document.getElementById("atmTemperatureC").value = Math.round((Number(document.getElementById("atmTemperature").value) - 273.15) * 20) / 20;
	}
	else{
		document.getElementById("atmTemperatureC").value = Math.min(document.getElementById("atmTemperatureC").value, document.getElementById("atmTemperatureC").max);
		document.getElementById("atmTemperatureC").value = Math.max(document.getElementById("atmTemperatureC").value, document.getElementById("atmTemperatureC").min);
		document.getElementById("atmTemperature").value = Math.round((Number(document.getElementById("atmTemperatureC").value) + 273.15) * 20) / 20;
	}

}

function connectPressure(){
	document.getElementById("atmPressure").value = Math.min(document.getElementById("atmPressure").value, document.getElementById("atmPressure").max);
	document.getElementById("atmPressure").value = Math.max(document.getElementById("atmPressure").value, document.getElementById("atmPressure").min);
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
	document.getElementById("plots").hidden = true;
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
	document.getElementById("ballastHeight").value = 555;
	setBallastHeight();
	bulb_close_degree = 0;
	volume = bottle_volume + bulb_volume;
	pressure = atmosphere_pressure;
	temperature = atmosphere_temperature;
	pastTime = 0;
	isPause = 0;
	document.getElementById("plots").hidden = true;
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
	updatePV();
	redraw();
	lastTime = thisTime;
	if(!stop_cycle)
		window.requestAnimationFrame(cycle);
	else
		reset();
}