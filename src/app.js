// index.js configures & runs main twitch bot
import tmi from "tmi.js";

// twitch bot config
const config = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: ["kriptxnic", "omnibal", "yxgster", "daunttt", "tuttuhl"],
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
