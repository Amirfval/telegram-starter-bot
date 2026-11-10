
import { InlineKeyboard } from "grammy"

const ADMIN_ID = 7184167495

const categories = [
  "تلگرام استارز ⭐",
  "تون (TON) 💎",
  "تلگرام پرمیوم 🌟",
  "گیفت استارز 🎁",
  "ووچرهای ویژه 🎟️",
  "خدمات رشد واقعی 📈"
]

let products = [
  { id: 1, category: "تلگرام استارز ⭐", name: "100 استارز", price: 150000 },
  { id: 2, category: "تلگرام استارز ⭐", name: "500 استارز", price: 700000 },
  { id: 3, category: "تلگرام پرمیوم 🌟", name: "پرمیوم یک ماهه", price: 250000 },
  { id: 4, category: "گیفت استارز 🎁", name: "گیفت ویژه", price: 200000 }
]

let nextId = 5
const userStates = new Map()

function mainMenu() {
  return new InlineKeyboard()
    .text("🛍 فروشگاه", "shop")
    .row()
    .text("👤 حساب کاربری", "account")
    .text("📞 پشتیبانی", "support")
    .row()
    .text("📋 راهنما", "help")
}

function adminMenu() {
  return new InlineKeyboard()
    .text("➕ افزودن محصول", "add_product")
    .row()
    .text("💰 تغییر قیمت", "change_price")
    .row()
    .text("📦 فهرست محصولات", "admin_products")
    .row()
    .text("🏠 منوی اصلی", "home")
}

function isAdmin(ctx) {
  return ctx.from?.id === ADMIN_ID
}

export function registerCommands(bot) {

  bot.command("start", async (ctx) => {
    userStates.delete(ctx.from.id)

    await ctx.reply(
      "سلام 👋\nبه فروشگاه دیجیتال ما خوش آمدی.\n\nاز منوی زیر استفاده کن:",
      { reply_markup: mainMenu() }
    )
  })

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "📋 راهنمای ربات\n\n" +
      "/start - منوی اصلی\n" +
      "/shop - مشاهده فروشگاه\n" +
      "/admin - پنل مدیریت"
    )
  })

  bot.command("shop", async (ctx) => {
    await showCategories(ctx)
  })

  bot.command("admin", async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply("⛔ شما دسترسی مدیریت ندارید.")
    }

    await ctx.reply("⚙️ پنل مدیریت فروشگاه:", {
      reply_markup: adminMenu()
    })
  })

  bot.command("id", async (ctx) => {
    await ctx.reply(`شناسه کاربری شما:\n${ctx.from.id}`)
  })

  bot.callbackQuery("home", async (ctx) => {
    await ctx.answerCallbackQuery()
    userStates.delete(ctx.from.id)

    await ctx.reply("🏠 منوی اصلی:", {
      reply_markup: mainMenu()
    })
  })

  bot.callbackQuery("shop", async (ctx) => {
    await ctx.answerCallbackQuery()
    await showCategories(ctx)
  })

  bot.callbackQuery("account", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      `👤 حساب کاربری\n\nشناسه شما: ${ctx.from.id}\nنام: ${ctx.from.first_name}`
    )
  })

  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      "📞 برای پشتیبانی، پیام خود را همین‌جا ارسال کنید."
    )
  })

  bot.callbackQuery("help", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      "برای خرید، وارد فروشگاه شوید و دسته‌بندی موردنظر را انتخاب کنید."
    )
  })

  bot.callbackQuery(/^category:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()

    const category = ctx.match[1]
    const items = products.filter(p => p.category === category)

    if (items.length === 0) {
      return ctx.reply("فعلاً محصولی در این دسته وجود ندارد.")
    }

    const keyboard = new InlineKeyboard()

    for (const item of items) {
      keyboard.text(
        `${item.name} - ${item.price.toLocaleString("fa-IR")} تومان`,
        `product:${item.id}`
      ).row()
    }

    keyboard.text("🔙 بازگشت به دسته‌ها", "shop")

    await ctx.reply(`🛍 محصولات دسته ${category}:`, {
      reply_markup: keyboard
    })
  })

  bot.callbackQuery(/^product:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()

    const id = Number(ctx.match[1])
    const product = products.find(p => p.id === id)

    if (!product) {
      return ctx.reply("محصول پیدا نشد.")
    }

    const keyboard = new InlineKeyboard()
      .text("🛒 ثبت درخواست خرید", `buy:${product.id}`)
      .row()
      .text("🔙 بازگشت به فروشگاه", "shop")

    await ctx.reply(
      `📦 ${product.name}\n\n` +
      `دسته: ${product.category}\n` +
      `قیمت: ${product.price.toLocaleString("fa-IR")} تومان\n\n` +
      "برای ثبت درخواست روی دکمه زیر بزنید.",
      { reply_markup: keyboard }
    )
  })

  bot.callbackQuery(/^buy:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()

    const id = Number(ctx.match[1])
    const product = products.find(p => p.id === id)

    if (!product) {
      return ctx.reply("محصول پیدا نشد.")
    }

    await ctx.reply(
      `درخواست خرید شما ثبت شد.\n\n` +
      `محصول: ${product.name}\n` +
      `قیمت: ${product.price.toLocaleString("fa-IR")} تومان\n\n` +
      "این فقط یک درخواست آزمایشی است و پرداختی انجام نشده است."
    )

    await bot.api.sendMessage(
      ADMIN_ID,
      `📥 درخواست خرید جدید\n\nکاربر: ${ctx.from.id}\nمحصول: ${product.name}\nقیمت: ${product.price}`
    )
  })

  bot.callbackQuery("add_product", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (!isAdmin(ctx)) return

    userStates.set(ctx.from.id, { action: "add_name" })

    await ctx.reply(
      "نام محصول جدید را وارد کنید:"
    )
  })

  bot.callbackQuery("change_price", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (!isAdmin(ctx)) return

    if (products.length === 0) {
      return ctx.reply("محصولی وجود ندارد.")
    }

    const keyboard = new InlineKeyboard()

    for (const product of products) {
      keyboard.text(
        `${product.name} (شناسه ${product.id})`,
        `edit:${product.id}`
      ).row()
    }

    await ctx.reply("محصول موردنظر را انتخاب کنید:", {
      reply_markup: keyboard
    })
  })

  bot.callbackQuery(/^edit:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()

    if (!isAdmin(ctx)) return

    const id = Number(ctx.match[1])
    const product = products.find(p => p.id === id)

    if (!product) {
      return ctx.reply("محصول پیدا نشد.")
    }

    userStates.set(ctx.from.id, {
      action: "change_price",
      productId: id
    })

    await ctx.reply("قیمت جدید را فقط به عدد وارد کنید:")
  })

  bot.callbackQuery("admin_products", async (ctx) => {
    await ctx.answerCallbackQuery()

    if (!isAdmin(ctx)) return

    if (products.length === 0) {
      return ctx.reply("هنوز محصولی ثبت نشده است.")
    }

    const text = products.map(p =>
      `شناسه: ${p.id}\nنام: ${p.name}\nدسته: ${p.category}\nقیمت: ${p.price.toLocaleString("fa-IR")} تومان`
    ).join("\n\n")

    await ctx.reply("📦 فهرست محصولات:\n\n" + text)
  })

  bot.on("message:text", async (ctx) => {
    const state = userStates.get(ctx.from.id)

    if (!state) return

    if (!isAdmin(ctx)) {
      userStates.delete(ctx.from.id)
      return
    }

    const value = ctx.message.text.trim()

    if (state.action === "add_name") {
      state.name = value
      state.action = "add_price"

      return ctx.reply("قیمت محصول را به عدد وارد کنید:")
    }

    if (state.action === "add_price") {
      const price = Number(value)

      if (!Number.isSafeInteger(price) || price <= 0) {
        return ctx.reply("لطفاً قیمت معتبر و مثبت وارد کنید.")
      }

      state.price = price
      state.action = "add_category"

      const keyboard = new InlineKeyboard()

      categories.forEach((category, index) => {
        keyboard.text(category, `newcat:${index}`).row()
      })

      return ctx.reply("دسته‌بندی محصول را انتخاب کنید:", {
        reply_markup: keyboard
      })
    }

    if (state.action === "change_price") {
      const price = Number(value)

      if (!Number.isSafeInteger(price) || price <= 0) {
        return ctx.reply("قیمت معتبر وارد کنید.")
      }

      const product = products.find(
        p => p.id === state.productId
      )

      if (!product) {
        userStates.delete(ctx.from.id)
        return ctx.reply("محصول پیدا نشد.")
      }

      product.price = price
      userStates.delete(ctx.from.id)

      return ctx.reply("✅ قیمت محصول تغییر کرد.")
    }
  })

  categories.forEach((category, index) => {
    bot.callbackQuery(`newcat:${index}`, async (ctx) => {
      await ctx.answerCallbackQuery()

      if (!isAdmin(ctx)) return

      const state = userStates.get(ctx.from.id)

      if (!state || state.action !== "add_category") {
        return ctx.reply("فرایند افزودن محصول منقضی شده است.")
      }

      products.push({
        id: nextId++,
        name: state.name,
        price: state.price,
        category
      })

      userStates.delete(ctx.from.id)

      await ctx.reply("✅ محصول با موفقیت اضافه شد.")
    })
  })
}

async function showCategories(ctx) {
  const keyboard = new InlineKeyboard()

  categories.forEach(category => {
    keyboard.text(category, `category:${category}`).row()
  })

  keyboard.text("🏠 منوی اصلی", "home")

  await ctx.reply("🛍 یک دسته‌بندی انتخاب کنید:", {
    reply_markup: keyboard
  })
}
