import env from "dotenv";
import TelegramBot, { Message } from "node-telegram-bot-api";
import * as redis from "redis";

// env Config
env.config({
  path: "./.env",
});

// Redis Config
const client = redis.createClient({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string),
});
client.on("connect", () => {
  console.log("Redis connected!");
});

// Bot
const bot = new TelegramBot(process.env.TOKEN as string, { polling: true });
bot.on("message", async (msg: Message) => {
  const text = msg.text as string;
  const sender = msg.from?.id as number;

  client.get(`${sender}`, async (err, status) => {
    if (text == "/start" || text == "بازگشت") {
      client.DEL(`${sender}`);
      await bot.sendMessage(
        sender,
        "سلام. لطفا یکی از گزینه ها را انتخاب کنید.",
        {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            keyboard: [
              [{ text: "دیده بان جدید" }],
              [{ text: "دیده بان های من" }],
            ],
            resize_keyboard: true,
          },
        }
      );
    } else if (status) {
      if (status == "new_watcher") {
        await bot.sendMessage(sender, "لینک وارد شده: " + text, {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            keyboard: [[{ text: "بازگشت" }]],
            resize_keyboard: true,
          },
        });
      }
    } else if (text == "دیده بان جدید") {
      client.set(`${sender}`, "new_watcher");
      await bot.sendMessage(sender, "لطفا لینک دیده بان را وارد نمایید.", {
        reply_to_message_id: msg.message_id,
        reply_markup: {
          keyboard: [[{ text: "بازگشت" }]],
          resize_keyboard: true,
        },
      });
    } else if (text == "دیده بان های من") {
    }
  });
});
