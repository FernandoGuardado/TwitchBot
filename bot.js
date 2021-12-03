// twitch bot created by Fernando Guardado a.k.a Kriptxnic
const tmi = require("tmi.js");
var request = require('request');
require("dotenv").config();

// twitch bot config
const config = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [process.env.KRIPTXNIC],
};

// create bot client
const client = new tmi.client(config);
// register event handlers

client.on("message", onMessageHandler);
client.on("connected", onConnectHandler);
client.connect().catch(console.error);

// hanlder functions
function onConnectHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onMessageHandler(channel, tags, msg, self) {
  if (self) return;

  const command = msg.trim();

  if (command.toLowerCase() === "!match") {
    request({
      uri: "https://www.checkmategaming.com/profile/25980/kriptonic#scheduled-matches",
    }, (error, response, body) => {
      if (body.includes('No matches found')) {
        // currentMatch = buttons-container

        client.say(channel, 'No matches currently scheduled on CMG').catch(function (err) {
          console.log(err)
        });
      }
      else {
        client.say(channel, `https://www.checkmategaming.com/profile/25980/kriptonic#scheduled-matches`).catch(function (err) {
          console.log(err)
        });
      }
    })
  }
}
