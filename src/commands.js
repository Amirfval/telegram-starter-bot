
import { InlineKeyboard } from "grammy"

const ADMIN_ID = 7184167495

// محصولات فروشگاه
const products = [
  { id: 1, name: "تلگرام استارز", price: 100, category: "stars" },
  { id: 2, name: "تلگرام پریمیوم", price: 200, category: "premium" },
  { id: 3, name: "گیفت تلگرام", price: 150, category: "gift" },
  { id: 4, name: "TON", price: 100, category: "ton" },
]

const categories = {
  stars: "⭐ تلگرام استارز",
  premium: "💎 تلگرام پریمیوم",
  gift: "🎁 گیفت تلگرام",
  ton: "💠 TON",
}

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

  // شروع ربات
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "سلام! به فروشگاه ما خوش اومدی 🌹\n\nاز منوی زیر انتخاب کن:",
      { reply_markup: mainMenu }
    )
  })

  // راهنما
  bot.command("help", (ctx) =>
    ctx.reply("برای دیدن فروشگاه دستور /start را بزن.")
  )

  // پنل مدیریت
  bot.command("admin", async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.reply("⛔ دسترسی مدیریت ندارید.")
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

  // منوی اصلی
  bot.callbackQuery("home", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("منوی اصلی:", { reply_markup: mainMenu })
  })

  // نمایش دسته‌بندی‌ها
  for (const [key, title] of Object.entries(categories)) {
    bot.callbackQuery(`cat_${key}`, async (ctx) => {
      await ctx.answerCallbackQuery()

      const items = products.filter(p => p.category === key)

      if (items.length === 0) {
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

  // انتخاب محصول
  bot.callbackQuery(/^product_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()

    const id = Number(ctx.match[1])
    const product = products.find(p => p.id === id)

    if (!product) {
      return ctx.reply("محصول پیدا نشد.")
    }

    await ctx.reply(
      `محصول: ${product.name}\nقیمت: ${product.price} تومان\n\nبرای سفارش با پشتیبانی تماس بگیر.`
    )
  })

  // حساب کاربری
  bot.callbackQuery("account", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      `👤 حساب کاربری\nشناسه شما: ${ctx.from.id}\nموجودی نمایشی: ۰ تومان`
    )
  })

  // افزایش موجودی
  bot.callbackQuery("wallet", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      "💰 بخش افزایش موجودی\n\nدرگاه پرداخت هنوز متصل نشده است."
    )
  })

  // پشتیبانی
  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      "برای پشتیبانی، لطفاً با مدیر فروشگاه تماس بگیرید."
    )
  })

  // فهرست محصولات برای مدیر
  bot.callbackQuery("admin_list", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (ctx.from.id !== ADMIN_ID) return

    const list = products.map(
      p => `${p.id}. ${p.name} - ${p.price} تومان`
    ).join("\n")

    await ctx.reply(list || "محصولی وجود ندارد.")
  })

  // افزودن محصول
  bot.callbackQuery("admin_add", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "add")

    await ctx.reply(
      "نام محصول | قیمت | دسته را بفرست:\n\nمثال:\nاستارز ۵۰ عددی | ۱۰۰۰۰ | stars\n\nدسته‌ها: stars, premium, gift, ton"
    )
  })

  // تغییر قیمت
  bot.callbackQuery("admin_price", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "price")

    await ctx.reply(
      "شناسه محصول | قیمت جدید\nمثال:\n1 | 25000"
    )
  })

  // حذف محصول
  bot.callbackQuery("admin_delete", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (ctx.from.id !== ADMIN_ID) return

    adminStates.set(ctx.from.id, "delete")

    await ctx.reply("شناسه محصولی که می‌خواهی حذف کنی را بفرست.")
  })

  // دریافت پیام‌های مدیر برای مدیریت محصولات
  bot.on("message:text", async (ctx, next) => {
    if (ctx.from.id !== ADMIN_ID) return next()

    const state = adminStates.get(ctx.from.id)

    if (!state || ctx.message.text.startsWith("/")) {
      return next()
    }

    const parts = ctx.message.text.split("|").map(x => x.trim())

    if (state === "add") {
      const name = parts[0]
      const price = Number(parts[1])
      const category = parts[2]

      if (
        !name ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Object.hasOwn(categories, category)
      ) {
        return ctx.reply("اطلاعات اشتباه است. دوباره طبق نمونه بفرست.")
      }

      products.push({
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        name,
        price,
        category,
      })

      adminStates.delete(ctx.from.id)

      return ctx.reply("✅ محصول با موفقیت اضافه شد.")
    }

    if (state === "price") {
      const id = Number(parts[0])
      const price = Number(parts[1])
      const product = products.find(p => p.id === id)

      if (!product || !Number.isFinite(price) || price <= 0) {
        return ctx.reply("شناسه یا قیمت اشتباه است.")
      }

      product.price = price
      adminStates.delete(ctx.from.id)

      return ctx.reply("✅ قیمت محصول تغییر کرد.")
    }

    if (state === "delete") {
      const id = Number(ctx.message.text.trim())
      const index = products.findIndex(p => p.id === id)

      if (index < 0) {
        return ctx.reply("محصول پیدا نشد.")
      }

      products.splice(index, 1)
      adminStates.delete(ctx.from.id)

      return ctx.reply("✅ محصول حذف شد.")
    }
  })
}
