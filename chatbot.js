const Bot = require('node-telegram-bot-api');
const request = require('request');
const token = require('./token');
const token_w = require('./token_w');
const url_wol_token = require('./token_wol');

//Variables del wheater
const city_l = 'Lima';
const city_i = 'Ica';
var city = city_l;
const url_w = 'http://api.openweathermap.org/data/2.5/weather?';
const url_l = url_w + 'q=Lima,pe&appid=' + token_w + '&lang=es';
//Variables del wolfram
//URL: url_wol_base + url_wol_token + url_wol_input1 + url_wol_pregunta + url_wol_input2 + url_wol_city + url_wol_input3  
const url_wol_base = 'http://api.wolframalpha.com/v2/query?appid=';
const url_wol_input1 = '&input=';
var   url_wol_pregunta = 'population';
const url_wol_input2 = '%20of%20';
var   url_wol_city = 'lima,pe';
const url_wol_input3 = '&includepodid=Result&format=plaintext&output=json';
var wol_extra = "";
//Otras variables
const trigger_l = 'LIMA';
const trigger_i = 'ICA';
const trigger_here = 'AQUI';
const trigger_gps = 'GPS';
const start = '/START';

const bot = new Bot(token, {polling: true});

const sti_bruce  = 'CAADAgADPQADyIsGAAER4mZIkRHRsgI';
const sti_putin  = 'CAADBAADMQQAAjJQbQAB-nKAEeKNehgC';
const sti_cumber = 'CAADBAADVwQAAjJQbQABOfFMYKmwNfkC';
const sti_willis = 'CAADBAAD3QMAAjJQbQAB1hVkkW6QXtoC';

const prepareData = (body) => {
 if(typeof JSON.parse(body).main === "undefined"){
    return ' Tiempo no encontrado.\n Revise la ciudad ingresada.\n';
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
  }		
};

bot.on('message', (msg) => {
// se evalua el valor de msg.text

// "AQUI"
 if (msg.text.toString().toUpperCase() === trigger_here) {
    var option = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: "My phone number",
                request_contact: true
            }], ["Cancel"]]
        }
    };
    bot.sendMessage(msg.chat.id, "How can we contact you?", option).then(() => {
        // handle user phone
            bot.once("contact",(msg)=>{
            var option = {
                "parse_mode": "Markdown",
                "reply_markup": {
                    "one_time_keyboard": true,
                    "keyboard": [[{
                        text: "My location",
                        request_location: true
                    }], ["Cancel"]]
                }
            };
            bot.sendMessage(msg.chat.id, 
			                util.format('Thank you %s with phone %s! And where are you?', msg.contact.first_name, msg.contact.phone_number),
                            option)
            .then(() => {
                bot.once("location",(msg)=>{
                    bot.sendMessage(msg.chat.id, "We will deliver your order to " + [msg.location.longitude,msg.location.latitude].join(";"));
                })
            })
        })
    });
// GPS
// } else if (msg.text.toString().toUpperCase() === trigger_gps) {
//  return request(url_l, (err, resp, body) => {
//   bot.sendMessage(msg.chat.id, "GPS", request_location: true)
//   bot.sendMessage(msg.chat.id, "We will deliver your order to " + [msg.location.longitude,msg.location.latitude].join(";"));
//  });
// LIMA
 } else if (msg.text.toString().toUpperCase() === trigger_l) {
   url_wol_city = msg.text.toString().toLowerCase();
   url_wol_pregunta = "altitude";
   const url_wol_tmp = url_wol_base + url_wol_token + url_wol_input1 + url_wol_pregunta + 
                       url_wol_input2 + url_wol_city + url_wol_input3;
   request(url_wol_tmp, { json: true }, (err, resp, body) => {
   if (err) { return console.log(err); }
   wol_extra = body.queryresult.pods[0].subpods[0].plaintext;
  });
  return request(url_l, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, prepareData(body) + 'Altitud: ' + wol_extra);
   bot.sendSticker(msg.chat.id, sti_putin);
  });
// /START
  } else if (msg.text.toString().toUpperCase() === start) {
   const usuario = msg.from.username;
   return request(url_l, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, 'Hola ' + usuario + ', escribe la ciudad para saber el tiempo y clima.', {
	reply_markup: {keyboard: [[city_l], [city_i]]
	              }
	});
   bot.sendSticker(msg.chat.id, sti_bruce);
   });
 }
// validar que solo se trabaja con textos (no parece robusto)
 else if (Object.prototype.toString.call(msg.text) === "[object String]") {
   city = msg.text.toString().toLowerCase();
   const url = url_w + 'q=' + city + '&appid=' + token_w + '&lang=es';
   return request(url, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, 'Buscando datos para esta ciudad: ' + city + '\n' + prepareData(body));
  }); 
 }
 else {
   return request(url_l, (err, resp, body) => {
   bot.sendMessage(msg.chat.id, 'Ciudad incorrecta. Revise lo ingresado. ' + '\n');
  });  
 }
});

bot.on('photo',(msg)=>{
   return request(url_l, (err, resp, body) => {
       bot.sendMessage(msg.chat.id, 'Ha enviado una foto. Por favor, vuelva a intentar. ' +'\n');    
  });  
});

bot.on('video',(msg)=>{
    bot.sendMessage(msg.chat.id, 'Ha enviado un video. Por favor, vuelva a intentar. ' +'\n');    
});

bot.on('audio',(msg)=>{
    bot.sendMessage(msg.chat.id, 'Ha enviado un audio. Por favor, vuelva a intentar. ' +'\n');    
});

bot.on('sticker',(msg)=>{
   return request(url_l, (err, resp, body) => {
    bot.sendMessage(msg.chat.id, 'Ha enviado un sticker. Por favor, vuelva a intentar. ' +'\n');    
  });  
});

bot.on("location",(msg)=>{
    bot.sendMessage(msg.chat.id, "We will deliver your order to " + [msg.location.longitude,msg.location.latitude].join(";"));    
});
