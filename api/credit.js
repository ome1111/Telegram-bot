const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function initDb() {
  if(!db){ await client.connect(); db = client.db("earningBot"); }
  return db;
}

module.exports = async (req, res) => {
  if(req.method !== "POST") return res.status(400).send("Invalid method");

  const { chatId, revenue, type } = req.body;
  if(!chatId || !revenue) return res.status(400).send("Missing data");

  const db = await initDb();
  const user = await db.collection("users").findOne({ chatId });
  if(!user) return res.status(404).send("User not found");

  await db.collection("users").updateOne(
    { chatId },
    { $inc: { balance: revenue, earnings: revenue, xp: 1 } }
  );

  return res.json({ ok:true, newBalance: user.balance + revenue });
};
