let c = document.getElementById('myCanvas');
let ctx = c.getContext("2d");
let table = document.getElementById("pointsTable");

let valve_state = false; // Клапан, true = открыт
let bulb_state = true; // Груша, true = разжата
let ballast_h = 200; // Высота балластного груза
let bulb_close_degree = 1; // 0 - открыта, 1 - закрыта
let bulb_press_time;
let stop_cycle = true;
let water_h;
let initial_h;
let ballast_water_h;
let water_volume = 3350;
let ruler_h = 250;
let lab_mode = false;

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

let pmax, pmin, pmid, vmax, tmax, tmin, timemin = 0, timemax = 80000;

function startPhysics(){
	volume = bulb_volume + bottle_volume;
	temperature = atmosphere_temperature = Number(document.getElementById("atmTemperature").value);
	pressure = atmosphere_pressure = Number(document.getElementById("atmPressure").value);	
	bulb_close_degree_ph = 0;
	pastTime = 0;
	initial_h = water_h;
	vmin = bottle_volume;
	vmax = bottle_volume + bulb_volume;
	pmin = atmosphere_pressure;
	pmax = pmin * Math.pow(vmax/vmin, poisson);
	tmin = atmosphere_temperature;
	tmax = tmin * Math.pow(vmax/vmin, poisson - 1);
	pmid = pmax * tmin/tmax;
}

function calcPhysics(){
	if(bulb_close_degree < 0.999){
		bulb_close_degree += deltaTime / bulb_press_period;
		if(bulb_close_degree >= 0.999)
			bulb_close_degree = 0.999;
	}
	if(bulb_close_degree_ph < 1){
		/*bulb_close_degree_ph += deltaTime / bulb_press_period_ph;*/
		bulb_close_degree_ph = 2 * pastTime / bulb_press_period_ph - Math.pow(pastTime / bulb_press_period_ph, 2);		
		if(pastTime > bulb_press_period_ph)
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
			let new_temperature = atmosphere_temperature + (temperature - atmosphere_temperature) * Math.pow(Math.E, -0.00006 * deltaTime);
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
	document.getElementById("printTimeLab").innerHTML = "Время: " + Math.round(pastTime / 500) / 2 + (Math.round(pastTime / 500) % 2 ? " сек" : ".0 сек");
	valveButtonCaptionUpdate();
}

/* Конец физики */

document.addEventListener('keydown', (event) => {
	if(event.keyCode == 32 || event.keyCode == 80){
		if(bulb_close_degree > 0)
			togglePause();
	}	
	if(event.keyCode == 27){
		if(document.getElementById("plots").hidden == false)
			togglePlots();
		document.getElementById("lab").hidden = true;
	}
});

let draw_dash = true; 
let my;

function getCursorPos(e){
	draw_dash = true;
	my = e.clientY;
	redraw();
}

function ungetCursorPos(e){
	draw_dash = false;	
	redraw();
}

function getPoint(e){
	if(!lab_mode)
		return;
	if(bulb_close_degree == 0){
		document.getElementById("h0").value = Math.round((650 - e.clientY) / (450 / ruler_h)); 
		return;
	}
	let current_h = e.clientY;
	let temp_time = Math.round(pastTime / 500) / 2;
	let temp_h = (650 - current_h) / (450 / ruler_h);
	if(table.rows.length > 20 || (table.rows.length > 0 && temp_time == Number(table.rows[table.rows.length - 1].cells[0].innerHTML)))
		return;
	if(table.rows.length == 3)
		document.getElementById("calcPoints").disabled = false;
	let new_row = table.insertRow(-1);
	new_row.insertCell(0).innerHTML = temp_time;
	new_row.insertCell(1).innerHTML = Math.round(temp_h);
	new_row.insertCell(2).innerHTML = "";
	new_row.insertCell(3).innerHTML = "";//document.getElementById("h0").value;
}

function calcPoints(){
	let th0 = document.getElementById("h0").value, tht = document.getElementById("ht").value; 
	if(isNaN(th0) || isNaN(tht) || th0 < 0 || th0 > 250 || tht < 0 || tht > 250){
		alert("Заполните h<sub>0</sub> и h<sub>T</sub>");
		return;
	}
	for(let i = 1; i < table.rows.length; i++){
		let cur_row = table.rows[i];
		cur_row.cells[2].innerHTML = Number(document.getElementById("ht").value) - Number(cur_row.cells[1].innerHTML);
		cur_row.cells[3].innerHTML = Math.round(Math.log(cur_row.cells[2].innerHTML) * 100) / 100;
	}
	document.getElementById("buildHPlot").disabled = false;
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

function togglePlots(){
	let st = document.getElementById("plots").hidden;
	document.getElementById("plots").hidden = !st;	
	if(document.getElementById("plots").hidden)
		document.getElementById("showPlots").value = "Показать графики";	
	else
		document.getElementById("showPlots").value = "Спрятать графики";
}

function pressBulb(){
	bulb_state = false;
	stop_cycle = false;
	bulb_press_time = lastTime = performance.now();
	plotPVTt();
	startPhysics();
	document.getElementById("modeSlider").disabled = true;
	document.getElementById("modeCheckbox").disabled = true;
	document.getElementById("modeName").style = "color:#888";
	document.getElementById("bulbButton").disabled = true;
	document.getElementById("ballastHeight").disabled = true;
	document.getElementById("ballastHeight").hidden = true;
	if(!lab_mode){
		document.getElementById("stateOutput").hidden = false;
		document.getElementById("showPlots").hidden = false;
	}
	else{
		document.getElementById("labOutput").hidden = false;
		document.getElementById("buildHPlot").hidden = false;
		document.getElementById("pointsTable").hidden = false;
	}
	document.getElementById("pauseButton").disabled = false;
	document.getElementById("atmPressure").disabled = true;
	document.getElementById("atmTemperature").disabled = true;
	document.getElementById("atmTemperatureC").disabled = true;
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

function toggleMode(){
	lab_mode = !lab_mode;
	draw_dash = !lab_mode;
	if(lab_mode){
		document.getElementById("modeName").innerHTML = "Лабораторная";
		document.getElementById("labOutput2").hidden = false;	
	}
	else{
		document.getElementById("modeName").innerHTML = "Демонстрация";
		document.getElementById("labOutput2").hidden = true;	
	}
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

function calculate(coeff_k){
	let ht = Number(document.getElementById("ht").value);
	let hs = (ht - Math.round(Math.exp(coeff_k)));
	let h0 = Number(document.getElementById("h0").value);
	let dhs = h0 - hs;
	let dht = h0 - ht;
	let rmu = 286.69; 
	document.getElementById("labFormula").innerHTML = 
		"K = " +
		coeff_k +
		", e<sup>K</sup> = " +
		Math.round(Math.exp(coeff_k)) + 
		"<br>h<sub>T</sub> = h<sub>s</sub>(&infin;) = " +
		ht +  " (мм)" +
		//"<br>h<sub>s</sub> = h<sub>s</sub>(0) = h<sub>T</sub> - e<sup>K</sup> = " +
		"<br>h<sub>s</sub> = h<sub>s</sub>(0) = " + 
		ht + " - " + Math.round(Math.exp(coeff_k)) + " = " + hs +  " (мм)" +
		"<br>Δh<sub>T</sub> = h<sub>0</sub> - h<sub>T</sub> = " + h0 + " - " + ht + " = " + dht + " (мм)" +
		"<br>Δh<sub>s</sub> = h<sub>0</sub> - h<sub>s</sub> = " + h0 + " - " + hs + " = " + dhs + " (мм)" +
		"<br>с<sub>v уд.</sub> = " + Math.round(rmu * dht / (dhs - dht)) +  " (Дж / кг * К)" +
		"<br>с<sub>p уд.</sub> = " + Math.round(rmu * dhs / (dhs - dht)) +  " (Дж / кг * К)" +
		"<br>&gamma; = " + Math.round(dhs / dht * 100) / 100;
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
	lab_mode = false;
	document.getElementById("modeSlider").disabled = false;
	document.getElementById("modeCheckbox").disabled = false;
	document.getElementById("modeName").style = "color:#black";
	document.getElementById("plots").hidden = true;
	document.getElementById("timeScaleRange").value = 0;
	document.getElementById("stateOutput").hidden = true;
	document.getElementById("labOutput").hidden = true;
	document.getElementById("labOutput2").hidden = true;
	document.getElementById("atmPressure").value = 101300;
	document.getElementById("atmTemperature").value = 293.15;
	document.getElementById("atmTemperatureC").value = 20;
	document.getElementById("modeCheckbox").checked = false;
	document.getElementById("showPlots").hidden = true;
	document.getElementById("buildHPlot").hidden = true;
	document.getElementById("buildHPlot").disabled = true;
	document.getElementById("h0").value = document.getElementById("ht").value = "";
	document.getElementById("pointsTable").hidden = true;
	document.getElementById("lab").hidden = true;
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
	plot2.clearRect(-20, -10, 380, 310);
	bulb_close_degree = 0;
	volume = bottle_volume + bulb_volume;
	pressure = atmosphere_pressure;
	temperature = atmosphere_temperature;
	pastTime = 0;
	isPause = 0;
	opv = opp = opt = optime = undefined;
	document.getElementById("modeSlider").disabled = false;
	document.getElementById("modeCheckbox").disabled = false;
	document.getElementById("modeName").style = "color:#black";
	document.getElementById("plots").hidden = true;
	document.getElementById("bulbButton").disabled = false;
	document.getElementById("ballastHeight").disabled = false;
	document.getElementById("ballastHeight").hidden = false;
	document.getElementById("stateOutput").hidden = true;
	document.getElementById("labOutput").hidden = true;
	document.getElementById("pauseButton").disabled = true;
	document.getElementById("pauseButton").value = "Пауза";
	document.getElementById("atmPressure").disabled = false;
	document.getElementById("atmTemperature").disabled = false;
	document.getElementById("atmTemperatureC").disabled = false;
	document.getElementById("showPlots").hidden = true;
	document.getElementById("buildHPlot").hidden = true;
	document.getElementById("buildHPlot").disabled = true;
	document.getElementById("h0").value = document.getElementById("ht").value = "";
	document.getElementById("calcPoints").disabled = true;
	while(document.getElementById("pointsTable").rows.length > 1)
	    document.getElementById("pointsTable").deleteRow(-1);
	document.getElementById("pointsTable").hidden = true;
	document.getElementById("lab").hidden = true;
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
	//if(lab_mode)
	calcPhysics();
	updateCaptures();
	updatePV();
	updatePVTt();
	updatePT();
	redraw();
	lastTime = thisTime;
	if(!stop_cycle)
		window.requestAnimationFrame(cycle);
	else
		reset();
}
