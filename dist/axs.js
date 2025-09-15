"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const telegraf_1 = require("telegraf");
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
let savedPrice = 2.54;
let userId = undefined;
async function getAxs() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=usd', {
            headers: {
                'x_cg_demo_api_key': process.env.API_KEY,
            }
        });
        if (!response.ok) {
            if (userId) {
                await bot.telegram.sendMessage(userId, `Error http: ${response.status}`);
            }
            return;
        }
        const data = await response.json();
        return data['axie-infinity']['usd'];
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (userId) {
            await bot.telegram.sendMessage(userId, msg);
        }
    }
}
function startPriceWatcher(userId) {
    setInterval(async () => {
        const actualPrice = await getAxs();
        if (actualPrice !== undefined) {
            if (actualPrice > savedPrice) {
                if (userId)
                    bot.telegram.sendMessage(userId, `Subió a ${actualPrice}`);
                savedPrice = actualPrice;
            }
            else if (actualPrice < savedPrice) {
                if (userId)
                    bot.telegram.sendMessage(userId, `Bajó a ${actualPrice}`);
                savedPrice = actualPrice;
            }
            else {
                if (userId)
                    bot.telegram.sendMessage(userId, `Se mantiene en ${actualPrice}`);
            }
        }
    }, 10000);
}
bot.start((ctx) => {
    userId = ctx.chat.id;
    ctx.reply(`Bienvenido ${ctx.from.first_name}!`);
    startPriceWatcher(userId);
});
bot.command("price", async (ctx) => {
    userId = ctx.chat.id;
    const actualPrice = await getAxs();
    if (actualPrice !== savedPrice)
        savedPrice = actualPrice;
    ctx.reply(`Precio actual del AXS: ${actualPrice}`);
});
bot.launch();
