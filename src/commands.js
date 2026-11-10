
import { InlineKeyboard } from "grammy"

const ADMIN_ID = 7184167495

// محصولات نمونه؛ فعلاً در حافظه نگهداری می‌شوند
const products = [
  { id: 1, name: "تلگرام استارز", price: 100, category: "stars" },
  { id: 2, name: "تلگرام پریمیوم", price: 200, category: "premium" },
  { id: 3, name: "گیفت تلگرام", price: 150, category: "gift" },
  { id: 4, name: "TON", price: 100, category: "ton" },
]

const mainMenu = new InlineKeyboard()
  .text("⭐ تلگرام استارز", "cat_stars").row()
  .text("💎 تلگرام پریمیوم", "cat_premium").row()
  .text("🎁 گیفت تلگرام", "cat_gift").row()
  .text("💠 TON", "cat_ton").row()
  .text("👤 حساب کاربری", "account").row()
  .text("💰 افزایش موجودی", "wallet").row()
  .text("📞 پشتیبانی", "support")

export function registerCommands(bot) {
  const adminStates = new Map()

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "سلام! به فروشگاه ما خوش اومدی 🌹\n\nاز منوی زیر انتخاب کن:",
      { reply_markup: mainMenu }
    )
  })

  bot.command("help", (ctx) =>
    ctx.reply("برای شروع /start را بزنید.")
  )

  bot.command("admin", async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply("⛔ شما دسترسی مدیریت ندارید.")
    }

    const keyboard = new InlineKeyboard()
      .text("➕ افزودن محصول", "admin_add").row()
      .text("💰 تغییر قیمت", "admin_price").row()
      .text("🗑 حذف محصول", "admin_delete").row()
      .text("📦 فهرست محصولات", "admin_list").row()
      .text("🏠 منوی اصلی", "home")

    await ctx.reply("⚙️ پنل مدیریت", {
      reply_markup: keyboard,
    })
  })

  bot.callbackQuery("home", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("منوی اصلی:", { reply_markup: mainMenu })
  })

  const categories = {
    stars: "⭐ تلگرام استارز",
    premium: "💎 تلگرام پریمیوم",
    gift: "🎁 گیفت تلگرام",
    ton: "💠 TON",
  }

  for (const [key, title] of Object.entries(categories)) {
    bot.callbackQuery(`cat_${key}`, async (ctx) => {
      await ctx.answerCallbackQuery()

      const items = products.filter(p => p.category === key)

      if (!items.length) {
        return ctx.reply("فعلاً محصولی در این دسته وجود ندارد.")
      }

      const keyboard = new InlineKeyboard()

      for (const item of items) {
        keyboard.text(
          `${item.name} - ${item.price} تومان`,
          `product_${item.id}`
        ).row()
      }

      keyboard.text("🏠 منوی اصلی", "home")

      await ctx.reply(title, { reply_markup: keyboard })
    })
  }

  bot.callbackQuery(/^product_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const id = Number(ctx.match[1])
    const product = products.find(p => p.id === id)

    if (!product) return ctx.reply("محصول پیدا نشد.")

    await ctx.reply(
      `محصول: ${product.name}\nقیمت: ${product.price} تومان\n\nبرای ثبت سفارش با پشتیبانی تماس بگیر.`
    )
  })

  bot.callbackQuery("account", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply(
      `👤 حساب کاربری\nشناسه شما: ${ctx.from.id}\nموجودی نمایشی: ۰ تومان`
    )
  })

  bot.callbackQuery("wallet", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply(
      "💰 بخش افزایش موجودی\n\nاین بخش هنوز به درگاه پرداخت متصل نشده است."
    )
  })

  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("برای پشتیبانی، شناسه مدیر فروشگاه را از مدیر دریافت کنید.")
  })

  bot.callbackQuery("admin_list", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (ctx.from.id !== ADMIN_ID) return

    const list = products.map(
      p => `${p.id}. ${p.name} - ${p.price} تومان`
    ).join("\n")

    await ctx.reply(list || "محصولی وجود ندارد.")
  })

  bot.callbackQuery("admin_add", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "add")
    await ctx.reply(
      "نام محصول، قیمت و دسته را با این قالب بفرست:\n\nنام | قیمت | stars\n\nدسته‌ها: stars ، premium ، gift ، ton"
    )
  })

  bot.callbackQuery("admin_price", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "price")
    await ctx.reply("شناسه محصول و قیمت جدید را بفرست:\n\n1 | 250")
  })

  bot.callbackQuery("admin_delete", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "delete")
    await ctx.reply("شناسه محصولی که می‌خواهی حذف کنی را بفرست.")
  })

  bot.on("message:text", async (ctx, next) => {
    if (ctx.from.id !== ADMIN_ID) return next()

    const state = adminStates.get(ctx.from.id)
    if (!state || ctx.message.text.startsWith("/")) return next()

    const parts = ctx.message.text.split("|").map(x => x.trim())

    if (state === "add") {
      const [name, priceText, category] = parts
      const price = Number(priceText)

      if (!name || !Number.isFinite(price) || price <= 0 ||
          !Object.hasOwn(categories, category)) {
        return ctx.reply("اطلاعات نامعتبر است. دوباره طبق قالب بفرست.")
      }

      products.push({
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        name,
        price,
        category,
      })

      adminStates.delete(ctx.from.id)
      return ctx.reply("✅ محصول اضافه شد.")
    }

    if (state === "price") {
      const id = Number(parts[0])
      const price = Number(parts[1])
      const product = products.find(p => p.id === id)

      if (!product || !Number.isFinite(price) || price <= 0) {
        return ctx.reply("شناسه یا قیمت معتبر نیست.")
      }

      product.price = price
      adminStates.delete(ctx.from.id)
      return ctx.reply("✅ قیمت تغییر کرد.")
    }

    if (state === "delete") {
      const id = Number(ctx.message.text.trim())
      const index = products.findIndex(p => p.id === id)

      if (index < 0) return ctx.reply("محصول پیدا نشد.")

      products.splice(index, 1)
      adminStates.delete(ctx.from.id)
      return ctx.reply("✅ محصول حذف شد.")
    }
  })
}
