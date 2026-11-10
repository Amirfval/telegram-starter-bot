
import { InlineKeyboard } from "grammy"

const ADMIN_ID = 7184167495

let products = [
  { id: 1, name: "استارز تلگرام", price: 50, description: "خرید استارز تلگرام" },
  { id: 2, name: "تلگرام پرمیوم", price: 100, description: "اشتراک پرمیوم تلگرام" },
  { id: 3, name: "گیفت تلگرام", price: 75, description: "گیفت استارزی تلگرام" },
  { id: 4, name: "TON", price: 50, description: "محصول مرتبط با تون" },
]

function isAdmin(ctx) {
  return ctx.from?.id === ADMIN_ID
}

function mainMenu() {
  return new InlineKeyboard()
    .text("🛍 محصولات", "products").row()
    .text("👤 حساب کاربری", "account").row()
    .text("💳 افزایش موجودی", "wallet").row()
    .text("📞 پشتیبانی", "support")
}

function adminMenu() {
  return new InlineKeyboard()
    .text("📦 فهرست محصولات", "admin_products").row()
    .text("➕ راهنمای افزودن محصول", "admin_add").row()
    .text("💰 راهنمای تغییر قیمت", "admin_price").row()
    .text("🔙 منوی اصلی", "home")
}

function productMenu() {
  const kb = new InlineKeyboard()
  for (const p of products) {
    kb.text(`${p.name} - ${p.price} ⭐`, `buy_${p.id}`).row()
  }
  kb.text("🔙 بازگشت", "home")
  return kb
}

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "سلام! به فروشگاه تلگرامی خوش آمدی 🌟\n\nاز منوی زیر استفاده کن:",
      { reply_markup: mainMenu() }
    )
  })

  bot.command("admin", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("⛔ دسترسی ندارید.")
    await ctx.reply("🔐 پنل مدیریت", { reply_markup: adminMenu() })
  })

  bot.command("addproduct", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("⛔ دسترسی ندارید.")

    const args = ctx.match.split("|").map(x => x.trim())
    if (args.length < 3) {
      return ctx.reply("فرمت:\n/addproduct نام | قیمت استارز | توضیحات")
    }

    const price = Number(args[1])
    if (!Number.isInteger(price) || price < 1) {
      return ctx.reply("قیمت باید عدد صحیح و بیشتر از صفر باشد.")
    }

    const id = Math.max(0, ...products.map(p => p.id)) + 1
    products.push({
      id,
      name: args[0],
      price,
      description: args.slice(2).join(" | ")
    })

    await ctx.reply(`✅ محصول ${args[0]} اضافه شد.\nشناسه: ${id}`)
  })

  bot.command("price", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("⛔ دسترسی ندارید.")

    const args = ctx.match.trim().split(/\s+/)
    const id = Number(args[0])
    const price = Number(args[1])
    const product = products.find(p => p.id === id)

    if (!product || !Number.isInteger(price) || price < 1) {
      return ctx.reply("فرمت:\n/price شناسه قیمت")
    }

    product.price = price
    await ctx.reply(`✅ قیمت ${product.name} به ${price} استارز تغییر کرد.`)
  })

  bot.command("delproduct", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("⛔ دسترسی ندارید.")

    const id = Number(ctx.match.trim())
    const before = products.length
    products = products.filter(p => p.id !== id)

    await ctx.reply(
      products.length < before ? "✅ محصول حذف شد." : "محصول پیدا نشد."
    )
  })

  bot.command("productsadmin", async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("⛔ دسترسی ندارید.")
    const list = products.map(p =>
      `${p.id} - ${p.name} - ${p.price} ⭐`
    ).join("\n")
    await ctx.reply(list || "هنوز محصولی ثبت نشده است.")
  })

  bot.callbackQuery("home", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText("🏠 منوی اصلی فروشگاه", {
      reply_markup: mainMenu()
    })
  })

  bot.callbackQuery("products", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText("🛍 محصولات فروشگاه:", {
      reply_markup: productMenu()
    })
  })

  bot.callbackQuery("account", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply(
      `👤 حساب کاربری\nشناسه شما: ${ctx.from.id}\n\nبرای مشاهده سفارش‌ها فعلاً با پشتیبانی تماس بگیرید.`
    )
  })

  bot.callbackQuery("wallet", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply(
      "💳 بخش افزایش موجودی\n\nدرگاه پرداخت هنوز متصل نشده است.\nپرداخت محصولات دیجیتالی داخل ربات باید با Telegram Stars انجام شود."
    )
  })

  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("برای پشتیبانی با مدیر فروشگاه تماس بگیرید.")
  })

  bot.callbackQuery("admin_products", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!isAdmin(ctx)) return
    const list = products.map(p =>
      `${p.id} - ${p.name} - ${p.price} ⭐`
    ).join("\n")
    await ctx.reply(list || "محصولی وجود ندارد.")
  })

  bot.callbackQuery("admin_add", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!isAdmin(ctx)) return
    await ctx.reply(
      "برای افزودن محصول این دستور را بفرست:\n/addproduct نام | قیمت استارز | توضیحات"
    )
  })

  bot.callbackQuery("admin_price", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!isAdmin(ctx)) return
    await ctx.reply("برای تغییر قیمت:\n/price شناسه قیمت")
  })

  bot.callbackQuery(/^buy_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const id = Number(ctx.match[1])
    const p = products.find(x => x.id === id)

    if (!p) return ctx.reply("این محصول دیگر موجود نیست.")

    const payload = `product_${p.id}_user_${ctx.from.id}`

    await ctx.api.sendInvoice(
      ctx.chat.id,
      p.name,
      p.description,
      payload,
      "",
      "XTR",
      [{ label: p.name, amount: p.price }]
    )
  })

  bot.on("pre_checkout_query", async (ctx) => {
    const query = ctx.preCheckoutQuery
    const match = query.invoice_payload.match(/^product_(\d+)_user_(\d+)$/)
    const p = match && products.find(x => x.id === Number(match[1]))

    if (
      !p ||
      Number(match[2]) !== query.from.id ||
      query.currency !== "XTR" ||
      query.total_amount !== p.price
    ) {
      return ctx.answerPreCheckoutQuery(false, {
        error_message: "اطلاعات سفارش معتبر نیست."
      })
    }

    await ctx.answerPreCheckoutQuery(true)
  })

  bot.on("message:successful_payment", async (ctx) => {
    const payment = ctx.message.successful_payment
    const match = payment.invoice_payload.match(/^product_(\d+)_user_(\d+)$/)
    const p = match && products.find(x => x.id === Number(match[1]))

    if (
      !p ||
      Number(match[2]) !== ctx.from.id ||
      payment.currency !== "XTR" ||
      payment.total_amount !== p.price
    ) {
      return ctx.reply("پرداخت دریافت شد، اما سفارش نیاز به بررسی مدیر دارد.")
    }

    await ctx.reply(
      `✅ پرداخت ${p.name} با موفقیت تأیید شد.\n\nبرای دریافت محصول با پشتیبانی تماس بگیرید.`
    )

    await ctx.api.sendMessage(
      ADMIN_ID,
      `🧾 پرداخت جدید\nمحصول: ${p.name}\nکاربر: ${ctx.from.id}\nمبلغ: ${p.price} ⭐\nشناسه پرداخت: ${payment.telegram_payment_charge_id}`
    )
  })
}
