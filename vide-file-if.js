import bot from "./bot.js";
import values from "./values.js";
import { findContentByCourse } from "./models/content.js";

const returnVideoId = () => {

    bot.on('video', async (video) => {
        const fileId = video.video.file_id;
        const chatId = video.chat.id;

        await bot.sendMessage(chatId, fileId)
    });

    

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
      
        // Перевірка, чи повідомлення містить файл
        if (msg.document) {
          const fileId = msg.document.file_id;
          bot.sendMessage(chatId, `ID вашого файлу: ${fileId}`)
            .then(() => {
              console.log(`Відправлено ID файлу: ${fileId}`);
            })
            .catch((error) => {
              console.error('Помилка при відправці повідомлення:', error);
            });
        } 
      });

    bot.on('channel_post', (msg) => {
        console.log(msg)
        console.log(msg.video.file_id)
        if (msg.video) {
            const videoId = msg.video.file_id;
            bot.sendMessage(values.logger_id, `Video ID: ${videoId}`);
        }
    });

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
      
        if (msg.photo) {
          // Отримання ID останньої (найвищої якості) версії фото
          const fileId = msg.photo[msg.photo.length - 1].file_id;
          bot.sendMessage(chatId, `ID вашого фото: ${fileId}`)
            .then(() => {
              console.log(`Відправлено ID фото: ${fileId}`);
            })
            .catch((error) => {
              console.error('Помилка при відправці повідомлення:', error);
            });
        }
    });
}

export default returnVideoId;