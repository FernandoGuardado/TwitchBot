// twitch bot created by Fernando Guardado a.k.a Kriptxnic
import fetch from "node-fetch";
import cheerio from "cheerio";
import tmi from "tmi.js";
import request from "request";
import dotenv from "dotenv/config";
import fs from "fs";

// TODO add error checks for undefined CMG
// TODO add firebase (firestore) for data; users, cod_data, everything... !!!
// TODO move twitch bot config to own file; i.e. make an app/index.js
// TODO try and import cod folder through an index.js

// twitch bot config
const config = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: ["kriptxnicbot"],
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
  const channelName = channel.replace(/[^\w\s]/gi, "");

  if (self) return;

  const command = msg.trim();

  if (command.toLowerCase() === "!match") {
    match(channelName);
  }
}

function match(channel, self) {
  const rawData = fs.readFileSync("build/CallOfDuty/cod_data.json");
  const user_data = JSON.parse(rawData).Users[channel];
  const CMG = user_data.CMG;

  request(
    {
      uri: `https://www.checkmategaming.com/profile/${CMG}#scheduled-matches`,
    },
    (error, response, body) => {
      if (body.includes("No matches found")) {
        client
          .say(channel, "No matches currently scheduled on CMG")
          .catch(function (err) {
            console.log(err);
          });
      } else {
        const getMatchLink = async () => {
          // get profile/scheduled matches body
          const response = await fetch(
            `https://www.checkmategaming.com/profile/${CMG}#scheduled-matches`
          );
          const profile_body = await response.text();
          let $ = cheerio.load(profile_body);
          // get match link
          const match = $(".buttons-container").find("a").attr("href");

          request(
            {
              uri: `https://www.checkmategaming.com/${match}`,
            },
            (error, response, body) => {
              // TODO test rest of function without async function; use body for match_body?
              const getMatchDetails = async () => {
                const match_response = await fetch(
                  `https://www.checkmategaming.com/${match}`
                );
                const match_body = await match_response.text();
                let $ = cheerio.load(match_body);   // target match body with cheerio

                // check to see if player is in the match
                if (!match_body.includes(CMG.replace(/[0-9]/g, ""))) {
                  client
                    .say(channel, "No matches currently scheduled on CMG")
                    .catch(function (err) {
                      console.log(err);
                    });
                  return;
                }

                // check to see if cash match
                if (match_body.toLowerCase().includes("cash")) {
                  var cash_match = $(".match-details-pool").text();
                  cash_match = cash_match.substring(0, cash_match.indexOf(" ")).replace("Total", "").replace(/\s/g, "");
                }

                // get map list
                var map_list = [];
                $(".maps-info-container")
                  .find(".map-item")
                  .each(function (index, e) {
                    map_list.push($(e).find("span").text());
                  });
                for (let i = 0; i < map_list.length; i++) {
                  if (map_list[i].includes("Search")) {
                    map_list[i] = map_list[i]
                      .replace("Search and Destroy:", "")
                      .replace("Host", "")
                      .split(":")[0];
                  } else if (map_list[i].includes("Hardpoint")) {
                    map_list[i] = map_list[i]
                      .replace("Hardpoint:", "")
                      .replace("Host", "")
                      .split(":")[0];
                  }
                }
                if (map_list.length > 1) {
                  if (cash_match) {
                    var match_message = `${cash_match} pool | `;
                    for (let i = 0; i < map_list.length; i++) {
                      match_message += `Map ${i + 1}: ${map_list[i]} | `;
                    }
                    match_message += `checkmategaming.com${match}`;

                    client.say(channel, match_message).catch(function (err) {
                      console.log(err);
                    });
                  } else {
                    var match_message = "";
                    for (let i = 0; i < map_list.length; i++) {
                      match_message += `Map ${i + 1}: ${map_list[i]} | `;
                    }
                    match_message += `checkmategaming.com${match}`;

                    client.say(channel, match_message).catch(function (err) {
                      console.log(err);
                    });
                  }
                } else {
                  if (cash_match) {
                    client
                      .say(
                        channel,
                        `${cash_match} pot Bo1: ${map_list[0]} | checkmategaming.com${match}`
                      )
                      .catch(function (err) {
                        console.log(err);
                      });
                  }
                  else {
                    client
                      .say(
                        channel,
                        `Bo1: ${map_list[0]} | checkmategaming.com${match}`
                      )
                      .catch(function (err) {
                        console.log(err);
                      });
                  }
                }
              };
              getMatchDetails();
            }
          );
        };
        getMatchLink();
      }
    }
  );
}
