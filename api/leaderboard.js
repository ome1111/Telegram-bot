const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
let db;
async function initDb(){ if(!db){ await client.connect(); db = client.db("earningBot"); } return db; }

module.exports = async (req,res)=>{
  const db = await initDb();
  const users = db.collection("users");
  const topEarners = await users.find({}).sort({earnings:-1}).limit(10).toArray();
  const topRef = await users.find({}).sort({"referrals.length":-1}).limit(10).toArray();

  return res.json({ topEarners, topRef });
};