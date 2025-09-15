import { Telegraf } from "telegraf";
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN!);

let savedPrice: number = 2.54; 
let userId: number | undefined = undefined;

async function getAxs() {
    try {
        const response: Response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=usd', {
            headers: {
                'x_cg_demo_api_key': process.env.API_KEY!,
            }
        })

        if (!response.ok){
            if(userId) await bot.telegram.sendMessage(userId, `Error http: ${response.status}`);
            return;
        } 

        const data = await response.json();
        
        return data['axie-infinity']['usd'];

    } catch(error){
        const msg = error instanceof Error ? error.message : String(error);
        if (userId) await bot.telegram.sendMessage(userId, msg);
    }
}

setInterval(async () => {
  const actualPrice = await getAxs();

  console.log(actualPrice)

  if (actualPrice !== undefined) {
    if (actualPrice > savedPrice) {
        if(userId) bot.telegram.sendMessage(userId, `Subió ${actualPrice}`)
        savedPrice = actualPrice;
    } else if (actualPrice < savedPrice) {
        if(userId) bot.telegram.sendMessage(userId, `Bajó ${actualPrice}`)
        savedPrice = actualPrice;
    }
  }
}, 360_000);


bot.start((ctx) => {
    userId = ctx.chat.id 
    ctx.reply(`Bienvenido ${ctx.from.first_name}`)
});

bot.command("price", async (ctx) => {
    const actualPrice = await getAxs();

    if(actualPrice !== savedPrice) savedPrice = actualPrice;

    ctx.reply(`Precio actual del AXS: ${actualPrice}`);
});

bot.launch();
