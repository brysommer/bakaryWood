import bot from "./bot.js";
import { Content, findContentByID } from "./models/content.js";
import { createUser, findUserByChatId, updateUserByChatId } from "./models/user.js";

const escapeMarkdown = (text) => {
    const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    return text.split('').map(char => escapeChars.includes(char) ? `\\${char}` : char).join('');
}

const sendCard = async (product, chatId) => {
    const cardDetails = await findContentByID(product);

                if (!cardDetails || !cardDetails.media) {
                    return bot.sendMessage(chatId, "❌ Товар не знайдено.");
                }

                const mediaFiles = [cardDetails.media, cardDetails.media1, cardDetails.media2, cardDetails.media3]
                    .filter(media => media) 
                    .map((media, index) => ({
                        type: "photo", 
                        media: media,
                        caption: index === 0 
                            ? `🔸 *Ціна:* ${cardDetails.price || "Не вказана"} грн` 
                            : undefined, 
                        parse_mode: "Markdown"
                    }));

                const cardMenu = [
                    [
                        { text: "⬅️ Попередня", callback_data: "previous_product" },
                        { text: "➡️ Наступна", callback_data: "next_product" }
                    ],
                    [
                        { text: "🛒 Замовити", callback_data: `order_product` }
                    ],
                    [
                        { text: "🖌 Індивідуальний дизайн", callback_data: `custom_order` }
                    ]
                ];

                const reply_markup = { inline_keyboard: cardMenu };

                if (mediaFiles.length > 1) {
                    bot.sendMediaGroup(chatId, mediaFiles).then(() => {
                        bot.sendMessage(chatId, cardDetails.text, { reply_markup });
                    });
                } else {
                    bot.sendPhoto(chatId, mediaFiles[0].media, {
                        caption: mediaFiles[0].caption,
                        parse_mode: "Markdown",
                        reply_markup
                    });
                }
}


const hello = () => {
    bot.setMyCommands([
        {command: '/startover', description: 'Почати спочатку'},
     //   {command: '/rules', description: 'Регламент надання товару після покупки, правила повернення'},
     //   {command: '/support', description: 'Звязок з підтримкою'},
      ]);
    
    bot.on('callback_query', async (query) => {
        const action = query.data;
        const chatId = query.message.chat.id;

        const user = await findUserByChatId(chatId);

        const totalCount = await Content.count();

        switch (action) {


            case 'buy_product': 
                const product = user?.goods || 1;
                console.log(product)
                
                await sendCard(product, chatId);

            break;

            case "previous_product":

                console.log(user.goods)
                const goods = user?.goods == 1 ? totalCount : user?.goods - 1;

                console.log(user?.goods, totalCount, user?.goods - 1)

                await updateUserByChatId(chatId, {goods});

                await sendCard(goods, chatId);
            break;

            case "next_product":

                const goodsNext = user?.goods == totalCount ? 1 : user?.goods + 1;

                await updateUserByChatId(chatId, {goods: goodsNext});

                await sendCard (goodsNext, chatId);
            break;

            case "startover":
                if (!user) await createUser(chatId);

                const menu = [
                    [
                        {
                            text: "Замовити продукцію",
                            callback_data: "buy_product"
                        }
                    ],
                ];
                                
                    bot.sendMessage(chatId, `👋 Вітаємо у BakeryWoodBot!
    Ми майстри у виготовленні унікальних виробів з деревини 🌳.
    Мене звуть менеджер Воллі і я допоможу замовити те, що тобі до смаку 😌✨.
    Оформлю твоє замовлення швидко та з задоволенням! 💼`, { 
                        reply_markup: {
                            inline_keyboard: menu
                        } 
                    });
            break;
/*
            case "custom_order":
                bot.sendMessage(chatId, "Менеджер незабаром звяжеться з вами!")
            break;
*/
            case 'photographs_ind':
            case 'boxes_ind':
            case 'puzzles_ind':
            
            break;
        }
})

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        const user = await findUserByChatId(chatId);
        switch (msg.text) {
            case '/start':
            case '/startover':

                if (!user) await createUser(chatId);

                const menu = [
                    [
                        {
                            text: "Замовити продукцію",
                            callback_data: "buy_product"
                        }
                    ],
                ];
                                
                    bot.sendMessage(chatId, `👋 Вітаємо у BakeryWoodBot!
    Ми майстри у виготовленні унікальних виробів з деревини 🌳.
    Мене звуть менеджер Воллі і я допоможу замовити те, що тобі до смаку 😌✨.
    Оформлю твоє замовлення швидко та з задоволенням! 💼`, { 
                        reply_markup: {
                            inline_keyboard: menu
                        } 
                    });
            break;

            case '/rules':
                bot.sendMessage(chatId, `### Регламент надання навчальних курсів після придбання та повернення

#### 1. Загальні положення

#### 6.`);
            break;

        }
    });
}

export default hello;