const Bot = require('node-telegram-bot-api');
const request = require('request');
const token = require('./token');
const token_w = require('./token_w');
//logging
const winston = require('winston')
winston.level = 'info'
//winston.log('info', 'Hello log files!', {someKey: 'some-value'})
//error,warn,info,verbose,debug,silly

const city_l = 'Lima'
const city_i = 'Ica'

var city = city_l
const url_w = 'http://api.openweathermap.org/data/2.5/weather?'
const url_l = url_w + 'q=Lima,pe&appid=' + token_w + '&lang=es';
const trigger_l = 'LIMA';
const trigger_i = 'ICA';
const start = '/START';

const bot = new Bot(token, {polling: true});

const sti_bruce  = 'CAADAgADPQADyIsGAAER4mZIkRHRsgI';
const sti_putin  = 'CAADBAADMQQAAjJQbQAB-nKAEeKNehgC';
const sti_cumber = 'CAADBAADVwQAAjJQbQABOfFMYKmwNfkC';
const sti_willis = 'CAADBAAD3QMAAjJQbQAB1hVkkW6QXtoC';

const prepareData = (body) => {
 if(typeof JSON.parse(body).main === "undefined"){
    return ' Tiempo no encontrado.\n Revise la ciudad ingresada.\n';
    winston.log('warn', 'Ciudad no encontrada', {'city': city});	
 } else {
   const weather = JSON.parse(body).weather[0].main;
   const weather_d = JSON.parse(body).weather[0].description;

   const pres = JSON.parse(body).main.pressure;
   const hume = JSON.parse(body).main.humidity;
   var num = (JSON.parse(body).main.temp)-273;
   const temp = parseFloat(num).toFixed(2);
   var num = (JSON.parse(body).main.temp_max)-273;
   const tMax = parseFloat(num).toFixed(2);
   var num = (JSON.parse(body).main.temp_min)-273;
   const tMin = parseFloat(num).toFixed(2);

   const nubosidad = JSON.parse(body).clouds.all;

   const ciudad = JSON.parse(body).name;
   const pais = JSON.parse(body).sys.country;
   
   return ' El tiempo es: ' + '\n Temp Max: ' + tMax + '°'
							+ '\n Temp Min: ' + tMin + '°'
                            + '\n Tiempo: ' + weather
                            + '\n Detalle: ' + weather_d 
                            + '\n Humedad: ' + hume + '%'
                            + '\n Nubosidad: ' + nubosidad + '%'
                            + '\n Lugar: ' + ciudad + ', ' + pais
							+ '\n';
    winston.log('info', 'Ciudad encontrada', {'city': city});	
 }		
};

bot.on('message', (msg) => {
 if (msg.text.toString().toUpperCase() === trigger_l) {
  return request(url_l, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, prepareData(body));
   bot.sendSticker(msg.chat.id, sti_putin);
  });
 } else if (msg.text.toString().toUpperCase() === start) {
   const usuario = msg.from.username;
   return request(url_l, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, 'Hola ' + usuario + ', escribe la ciudad para saber el tiempo y clima.', {
//   bot.sendMessage(msg.chat.id, 'Hola , escribe la ciudad para saber el tiempo y clima.', {
	reply_markup: {keyboard: [[city_l], [city_i]]
	              }
	});
   bot.sendSticker(msg.chat.id, sti_bruce);
   });
    winston.log('info', 'Start ejecutado', {'comando': start});	  
 } 
 else {
   city = msg.text.toString().toLowerCase();
   const url = url_w + 'q=' + city + '&appid=' + token_w + '&lang=es';
   return request(url, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, 'Buscando datos para esta ciudad: ' + city + '\n' + prepareData(body));
  }); 
 }
});

