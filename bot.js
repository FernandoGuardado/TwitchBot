// twitch bot created by Fernando Guardado a.k.a Kriptxnic
import fetch from "node-fetch";
import cheerio from "cheerio";
import tmi from "tmi.js";
import request from 'request'
import dotenv from "dotenv/config"
import fs from "fs"

// twitch bot config
const config = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: ['kriptxnicbot']
};

// create bot client
const client = new tmi.client(config);

// register event handlers & connect
client.on("message", onMessageHandler);
client.on("connected", onConnectHandler);
client.connect().catch(console.error);

// hanlder functions
function onConnectHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onMessageHandler(channel, tags, msg, self) {
  const channelName = channel.replace(/[^\w\s]/gi, '');

  if (self) return;

  const command = msg.trim();

  if (command.toLowerCase() === "!match") {
    match(channelName);
  }
}

function match(channel, self) {
  let rawData = fs.readFileSync('cod_data.json');
  let CMG = JSON.parse(rawData).Checkmate

  request({
    uri: `https://www.checkmategaming.com/profile/${CMG[channel]}#scheduled-matches`,
  }, (error, response, body,) => {
    if (body.includes('No matches found')) {
      client.say(channel, 'No matches currently scheduled on CMG').catch(function (err) {
        console.log(err)
      });
    }
    else {
      const getMatchLink = async () => {
        // get profile/scheduled matches body
        const response = await fetch(`https://www.checkmategaming.com/profile/${CMG[channel]}#scheduled-matches`);
        const profile_body = await response.text();
        let $ = cheerio.load(profile_body);
        // get match link
        const match = $('.buttons-container').find('a').attr('href');

        request({
          uri: `https://www.checkmategaming.com/${match}`,
        }, (error, response, body) => {
          const getMatchDetails = async () => {
            const match_response = await fetch(`https://www.checkmategaming.com/${match}`);
            const match_body = await match_response.text();
            let $ = cheerio.load(match_body);

            // get map list
            var map_list = [];
            $('.maps-info-container').find('.map-item').each(function (index, e) {
              map_list.push($(e).find('span').text());
            })
            for (let i = 0; i < map_list.length; i++) {
              if (map_list[i].includes('Search')) {
                map_list[i] = map_list[i].replace('Search and Destroy:', '').replace('Host', '').split(':')[0];
              }
              else if (map_list[i].includes('Hardpoint')) {
                map_list[i] = map_list[i].replace('Hardpoint:', '').replace('Host', '').split(':')[0];
              }
            }
            if (map_list.length > 1) {
              var match_message = ''
              for (let i = 0; i < map_list.length; i++) {
                match_message += `Map ${i + 1}: ${map_list[i]} | `;
              } match_message += `checkmategaming.com${match}`;
              client.say(channel, match_message).catch(function (err) {
                console.log(err);
              })
            }
            else {
              client.say(channel, `Best of 1: ${map_list[0]} | checkmategaming.com${match}`).catch(function (err) {
                console.log(err);
              })
            }
          }; getMatchDetails();
        })
      }; getMatchLink();
    }
  })
}