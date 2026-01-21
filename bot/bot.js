const { Telegraf, Markup } = require("telegraf");
const { MongoClient } = require("mongodb");
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_API);
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function initDb(){
  if(!db){
    await client.connect();
    db = client.db("earningBot");
  }
  return db;
}

// Start / Main Menu
bot.start(async (ctx)=>{
  const db = await initDb();
  const chatId = ctx.from.id;
  let user = await db.collection("users").findOne({chatId});
  if(!user){
    await db.collection("users").insertOne({
      chatId,
      username: ctx.from.username || ctx.from.first_name,
      balance:0,
      xp:0,
      level:1,
      referrals:[],
      earnings:0
    });
    if(ctx.startPayload){
      const ref = parseInt(ctx.startPayload);
      const refUser = await db.collection("users").findOne({chatId: ref});
      if(refUser){
        await db.collection("users").updateOne(
          { chatId: ref },
          { $push: { referrals: chatId } }
        );
      }
    }
  }

  ctx.reply("Welcome! Choose an option:", Markup.inlineKeyboard([
    [Markup.button.callback("💰 Earn", "earn")],
    [Markup.button.callback("🎰 Spin Wheel", "spin")],
    [Markup.button.callback("📝 Tasks", "tasks")],
    [Markup.button.callback("🏆 Leaderboards", "leaderboard")],
    [Markup.button.callback("👥 Referral", "referral")],
    [Markup.button.callback("📊 Balance & XP", "balance")],
    [Markup.button.callback("💸 Withdraw", "withdraw")],
    [Markup.button.callback("⚙️ Help", "help")]
  ]));
});

// Earn button
bot.action("earn", async (ctx)=>{
  ctx.editMessageText("Choose earning method:", Markup.inlineKeyboard([
    [Markup.button.url("AdsGram Video", "https://sad.adsgram.ai/js/sad.min.js")],
    [Markup.button.url("GigaPub Video", "https://ad.gigapub.tech/script?id=5303")],
    [Markup.button.url("Monetag / Adsterra Click", process.env.MONETAG_LINK)],
    [Markup.button.callback("⬅️ Back", "main")]
  ]));
});

// Leaderboard
bot.action("leaderboard", async ctx=>{
  const db = await initDb();
  const users = db.collection("users");
  const topEarners = await users.find({}).sort({earnings:-1}).limit(10).toArray();
  const topRef = await users.find({}).sort({"referrals.length":-1}).limit(10).toArray();
  let msg = "🏆 Top Earners:\n";
  topEarners.forEach((u,i)=> msg+=`${i+1}. ${u.username} → $${u.earnings}\n`);
  msg+="\n👥 Top Referrers:\n";
  topRef.forEach((u,i)=> msg+=`${i+1}. ${u.username} → ${u.referrals.length} referrals\n`);
  ctx.editMessageText(msg);
});

// Launch bot with webhook
bot.launch({ webhook:{
  domain: process.env.WEBAPP_URL,
  hookPath: `/bot`
}});
