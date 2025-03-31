import bot from "./bot.js";
import { findContentByID } from "./models/content.js";
import { findUserByChatId } from "./models/user.js";
import values from "./values.js";

const orderManager = () => {
    const activeOrderSessions = new Map();

    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const username = query.from.username || "Невідомий користувач";
        const data = query.data;

        if (data === "order_product" || data === "custom_order") {
            const user = await findUserByChatId(chatId);
            const orderDetails = await findContentByID(user?.goods);
            const price = orderDetails?.price || "Не вказано";
            const category = orderDetails?.category_id || "Не вказано";
            const stockStatus = data === "order_product" ? "готовий товар" : "індивідуальний дизайн";

            activeOrderSessions.set(userId, values.admin_chatId);

            bot.sendMessage(
                values.admin_chatId,
                `🛍 НОВЕ ЗАМОВЛЕННЯ!
👤 Користувач: @${username} (ID: ${userId})
📦 Товар: ${category}
💰 Ціна: ${price} грн
📦 Статус: ${stockStatus}

📩 Відповідайте, відповідаючи на його повідомлення. /end ${userId} для завершення діалогу`
            );

            bot.sendMessage(chatId, "✅ Ваше замовлення прийнято! Менеджер зв'яжеться з вами найближчим часом.");
        }
    });

    bot.on("message", (msg) => {
        const userId = msg.chat.id;
        if (!activeOrderSessions.has(userId)) return;

        if (msg.text) {
            bot.sendMessage(values.admin_chatId, `📩 Повідомлення від @${msg.from.username || "Невідомий"} (ID: ${userId}):\n${msg.text}`);
        } else if (msg.photo) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            bot.sendPhoto(values.admin_chatId, fileId, { caption: `📷 Фото від @${msg.from.username || "Невідомий"} (ID: ${userId})` });
        } else if (msg.document) {
            const fileId = msg.document.file_id;
            bot.sendDocument(values.admin_chatId, fileId, { caption: `📄 Документ від @${msg.from.username || "Невідомий"} (ID: ${userId})` });
        } else if (msg.sticker) {
            const fileId = msg.sticker.file_id;
            bot.sendSticker(values.admin_chatId, fileId);
        } else if (msg.voice) {
            const fileId = msg.voice.file_id;
            bot.sendVoice(values.admin_chatId, fileId, { caption: `🎤 Голосове повідомлення від @${msg.from.username || "Невідомий"} (ID: ${userId})` });
        }
    });

    bot.on("message", (msg) => {
        if (msg.reply_to_message) {
            const match = msg.reply_to_message.text.match(/ID: (\d+)/);
            if (match) {
                const userId = Number(match[1]);
                if (msg.text) {
                    bot.sendMessage(userId, `📩 Менеджер: ${msg.text}`);
                } else if (msg.photo) {
                    const fileId = msg.photo[msg.photo.length - 1].file_id;
                    bot.sendPhoto(userId, fileId, { caption: "📷 Від менеджера" });
                } else if (msg.document) {
                    const fileId = msg.document.file_id;
                    bot.sendDocument(userId, fileId, { caption: "📄 Від менеджера" });
                } else if (msg.sticker) {
                    const fileId = msg.sticker.file_id;
                    bot.sendSticker(userId, fileId);
                } else if (msg.voice) {
                    const fileId = msg.voice.file_id;
                    bot.sendVoice(userId, fileId, { caption: "🎤 Від менеджера" });
                }
            }
        }
    });

    bot.onText(/\/end (\d+)/, (msg, match) => {
        const userId = Number(match[1]);
        if (activeOrderSessions.has(userId)) {
            activeOrderSessions.delete(userId);
            bot.sendMessage(userId, "🔚 Ваше замовлення завершено. Дякуємо за покупку! 🙌", {
                reply_markup: {
                    inline_keyboard: [[{ text: "🆕 Нове замовлення", callback_data: "startover" }]]
                }
            });
            bot.sendMessage(values.admin_chatId, `✅ Замовлення користувача (ID: ${userId}) завершено.`);
        } else {
            bot.sendMessage(values.admin_chatId, "⚠️ Замовлення з цим ID не знайдено.");
        }
    });
};


export default orderManager;
