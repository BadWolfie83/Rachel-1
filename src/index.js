import { Client } from "irc-framework";
import { promises as fs } from 'fs';
import Mustache from 'mustache';

const {
  RACHEL_IRC_HOSTNAME,
  RACHEL_IRC_PORT,
  RACHEL_IRC_NICK,
  RACHEL_IRC_CHANNEL,
  RACHEL_IRC_USERNAME,
} = process.env;

const bot = new Client();
const channel = bot.channel(RACHEL_IRC_CHANNEL);
bot.connect({
  host: RACHEL_IRC_HOSTNAME,
  port: RACHEL_IRC_PORT || 6667,
  nick: RACHEL_IRC_NICK || "Rachel",
  username: RACHEL_IRC_USERNAME || "rachel",
  version: "nodejs irc-framework",
  auto_reconnect: true,
  auto_reconnect_max_wait: 30000,
  auto_reconnect_max_retries: 3,
  ping_interval: 30,
  ping_timeout: 120,
});
bot.on(`socket close`, function() {
  console.log(`disconnected.`);
});
bot.on(`registered`, function() {
  console.log(`connected, joining channels....`);
  channel.join();
});

async function getTemplate(filename) {
  return await fs.readFile(filename);
}

/*
{
  nick: 'prawnsalad',
  ident: 'prawn',
  hostname: 'manchester.isp.net',
  gecos: 'prawns real name',
  channel: '#channel',
  time: 000000000,
  account: 'account_name'
}
*/
bot.on(`join`, function(event) {
  getTemplate(`src/templates/welcome-notice.mustache`)
    .then((template) => {
      bot.notice(event.nick, Mustache.render(template.toString(), {
        nick: event.nick,
        channel: event.channel,
      }));
    })
    .catch((error) => {
      console.error(`error sending join notice:`, error);
    });
});

/*
{
  nick: 'prawnsalad',
  ident: 'prawn',
  hostname: 'manchester.isp.net',
  channel: '#channel',
  message: 'My part message',
  time: 000000000
}
 */
bot.on(`part`, function(event) {

});

/*
{
  nick: 'prawnsalad',
  ident: 'prawn',
  hostname: 'manchester.isp.net',
  message: 'Reason why I'm leaving IRC,
  time: 000000000
}
 */
bot.on(`quit`, function(event) {

});

/*
{
  nick: 'prawnsalad',
  ident: 'prawn',
  hostname: 'isp.manchester.net',
  new_nick: 'prawns_new_nick',
  time: 000000000
}
 */
bot.on(`nick`, function(event) {

});


bot.on(`message`, function(event) {
  if(/^!Domme$/.test(event.message)) {
    bot.mode(event.target, `+o`, event.nick);
  }
});