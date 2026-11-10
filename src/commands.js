import { InlineKeyboard } from "grammy"

export function registerCommands(bot) {
  bot.command("start", (ctx) => {
    ctx.reply("سلام! ربات فعاله 🌹")
  })
}
