const {config} = require("dotenv")

config({path: "./.env"})

const OPENAI_SECRET_KEY = process.env.OPENAI_SECRET_KEY;

module.exports = {OPENAI_SECRET_KEY};