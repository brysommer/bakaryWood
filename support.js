import bot from "./bot.js";
import { findContentByID } from "./models/content.js";
import { findUserByChatId } from "./models/user.js";
import values from "./values.js";

const orderManager = () => {
    // Список активних замовлень
    const activeOrderSessions = new Map();

    // Користувач активує замовлення (через кнопку)
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const username = query.from.username || "Невідомий користувач";
        const data = query.data;

        if (data ==="order_product" || data === "custom_order") {
            
            const user = await findUserByChatId(chatId);
            const orderDetails = await findContentByID(user?.goods);
            const price = orderDetails?.price || "Не вказано";
            const category = orderDetails?.category_id || "Не вказано";
            const stockStatus = data ==="order_product" ? "готовий товар" : "індивідуальний дизайн";

            // Додаємо користувача в чергу замовлень
            activeOrderSessions.set(userId, values.admin_chatId);

            // Сповіщаємо менеджера
            bot.sendMessage(
                values.admin_chatId,
                `🛍 НОВЕ ЗАМОВЛЕННЯ!\n👤 Користувач: @${username} (ID: ${userId})\n📦 Товар: ${category}\n💰 Ціна: ${price} грн\n📦 Статус: ${stockStatus}\n\n📩 Відповідайте, відповідаючи на його повідомлення. /end 429789892 для заверщення діалогу`,
            );

            // Сповіщаємо користувача
            bot.sendMessage(chatId, "✅ Ваше замовлення прийнято! Менеджер зв'яжеться з вами найближчим часом.");
        }
    });

    // Перенаправлення повідомлень клієнта менеджеру
    bot.on("message", (msg) => {
        const userId = msg.chat.id;
        const text = msg.text;

        if (activeOrderSessions.has(userId)) {
            bot.sendMessage(
                values.admin_chatId,
                `📩 Повідомлення від @${msg.from.username || "Невідомий"} (ID: ${userId}):\n${text}`,
                { reply_markup: { force_reply: true } }
            );
        }
    });

    // Обробка відповідей менеджера
    bot.on("message", (msg) => {
        const text = msg.text;

        if (msg.reply_to_message) {
            const match = msg.reply_to_message.text.match(/ID: (\d+)/);
            if (match) {
                const userId = Number(match[1]);
                bot.sendMessage(userId, `📩 Менеджер: ${text}`);
            }
        }
    });

    // Завершення замовлення
    bot.onText(/\/end (\d+)/, (msg, match) => {
        const userId = Number(match[1]);

        if (activeOrderSessions.has(userId)) {
            activeOrderSessions.delete(userId);
            bot.sendMessage(userId, "🔚 Ваше замовлення завершено. Дякуємо за покупку! 🙌", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🆕 Нове замовлення", callback_data: "startover" }]
                    ]
                }
            });
            
            bot.sendMessage(values.admin_chatId, `✅ Замовлення користувача (ID: ${userId}) завершено.`);
        } else {
            bot.sendMessage(values.admin_chatId, "⚠️ Замовлення з цим ID не знайдено.");
        }
    });
}

export default orderManager;
