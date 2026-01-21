const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
let db;
async function initDb() { if(!db){ await client.connect(); db = client.db("earningBot"); } return db; }

module.exports = async (req,res)=>{
  const chatId = parseInt(req.query.chatId);
  if(!chatId) return res.status(400).send("Missing chatId");

  const db = await initDb();
  const user = await db.collection("users").findOne({chatId});
  if(!user) return res.status(404).send("User not found");

  return res.json(user);
};