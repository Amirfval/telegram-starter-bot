
import { InlineKeyboard } from "grammy";

const ADMIN_ID = 7184167495;

const products = [
  { id: 1, name: "تلگرام استارز", price: 100, category: "stars" },
  { id: 2, name: "تلگرام پریمیوم", price: 200, category: "premium" },
  { id: 3, name: "گیفت تلگرام", price: 150, category: "gift" },
  { id: 4, name: "TON", price: 100, category: "ton" },
];

const categories = {
  stars: "تلگرام استارز",
  premium: "تلگرام پریمیوم",
  gift: "گیفت تلگرام",
  ton: "TON",
};

const mainMenu = new InlineKeyboard()
  .text("⭐ استارز", "cat_stars").row()
  .text("💎 پریمیوم", "cat_premium").row()
  .text("🎁 گیفت", "cat_gift").row()
  .text("💠 TON", "cat_ton").row()
  .text("👤 حساب من", "account").row()
  .text("💰 افزایش موجودی", "wallet").row()
  .text("📞 پشتیبانی", "support");

export function registerCommands(bot) {
  const states = new Map();

  bot.command("start", async (ctx) => {
    await ctx.reply("سلام! به فروشگاه خوش آمدی 🌹", {
      reply_markup: mainMenu,
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply("برای دیدن فروشگاه /start را بزن.");
  });

  bot.command("admin", async (ctx) => {
    if (!ctx.from || ctx.from.id !== ADMIN_ID) {
      return ctx.reply("شما دسترسی مدیریت ندارید.");
    }

    const keyboard = new InlineKeyboard()
      .text("افزودن محصول", "add").row()
      .text("تغییر قیمت", "price").row()
      .text("حذف محصول", "delete").row()
      .text("فهرست محصولات", "list");

    await ctx.reply("پنل مدیریت", {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery("home", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("منوی اصلی", { reply_markup: mainMenu });
  });

  for (const key of Object.keys(categories)) {
    bot.callbackQuery(`cat_${key}`, async (ctx) => {
      await ctx.answerCallbackQuery();

      const items = products.filter((p) => p.category === key);

      if (items.length === 0) {
        return ctx.reply("محصولی در این دسته نیست.");
      }

      const keyboard = new InlineKeyboard();

      for (const p of items) {
        keyboard.text(
          `${p.name} - ${p.price} تومان`,
          `product_${p.id}`
        ).row();
      }

      keyboard.text("بازگشت", "home");

      await ctx.reply(categories[key], {
        reply_markup: keyboard,
      });
    });
  }

  bot.callbackQuery(/^product_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();

    const id = Number(ctx.match[1]);
    const p = products.find((item) => item.id === id);

    if (!p) return ctx.reply("محصول پیدا نشد.");

    await ctx.reply(
      `نام: ${p.name}\nقیمت: ${p.price} تومان\nبرای سفارش با پشتیبانی تماس بگیر.`
    );
  });

  bot.callbackQuery("account", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`شناسه کاربری: ${ctx.from.id}\nموجودی: صفر تومان`);
  });

  bot.callbackQuery("wallet", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("درگاه پرداخت هنوز متصل نشده است.");
  });

  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("برای پشتیبانی با مدیر فروشگاه تماس بگیر.");
  });

  bot.callbackQuery("list", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

    const result = products
      .map((p) => `${p.id} - ${p.name} - ${p.price}`)
      .join("\n");

    await ctx.reply(result || "محصولی وجود ندارد.");
  });

  bot.callbackQuery("add", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

    states.set(ctx.from.id, "add");
    await ctx.reply("نام | قیمت | دسته\nمثال:\nمحصول جدید | 500 | stars");
  });

  bot.callbackQuery("price", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

    states.set(ctx.from.id, "price");
    await ctx.reply("شناسه محصول | قیمت جدید\nمثال:\n1 | 500");
  });

  bot.callbackQuery("delete", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

    states.set(ctx.from.id, "delete");
    await ctx.reply("شناسه محصول را بفرست.");
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.from || ctx.from.id !== ADMIN_ID) {
      return next();
    }

    const state = states.get(ctx.from.id);
    if (!state || ctx.message.text.startsWith("/")) {
      return next();
    }

    const parts = ctx.message.text.split("|").map((x) => x.trim());

    if (state === "add") {
      const name = parts[0];
      const price = Number(parts[1]);
      const category = parts[2];

      if (
        !name ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Object.prototype.hasOwnProperty.call(categories, category)
      ) {
        return ctx.reply("اطلاعات اشتباه است. دوباره طبق نمونه بفرست.");
      }

      const id = Math.max(0, ...products.map((p) => p.id)) + 1;
      products.push({ id, name, price, category });

      states.delete(ctx.from.id);
      return ctx.reply("محصول اضافه شد.");
    }

    if (state === "price") {
      const id = Number(parts[0]);
      const price = Number(parts[1]);
      const product = products.find((p) => p.id === id);

      if (!product || !Number.isFinite(price) || price <= 0) {
        return ctx.reply("شناسه یا قیمت نامعتبر است.");
      }

      product.price = price;
      states.delete(ctx.from.id);
      return ctx.reply("قیمت تغییر کرد.");
    }

    if (state === "delete") {
      const id = Number(ctx.message.text.trim());
      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        return ctx.reply("محصول پیدا نشد.");
      }

      products.splice(index, 1);
      states.delete(ctx.from.id);
      return ctx.reply("محصول حذف شد.");
    }
  });
}
