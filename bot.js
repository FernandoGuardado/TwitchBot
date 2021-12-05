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
  channels: ['kriptxnic', 'omnibal', 'yxgster']
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

function match(channel, self) {let rawData = fs.readFileSync('cod_data.json');
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
          const response = await fetch(`https://www.checkmategaming.com/profile/${CMG[channel]}#scheduled-matches`);
          const profileBody = await response.text();

          const $ = cheerio.load(profileBody);
          const match = $('.buttons-container').find("a").attr('href');

          client.say(channel, `checkmategaming.com${match}`).catch(function (err) {
              console.log(err)
            });
      }; getMatchLink()
    }
  })
}