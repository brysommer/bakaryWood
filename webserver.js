import e from "express";
import values from "./values.js";
import * as crypto from 'crypto';
import { createNewPurchaseByChatId } from "./models/purchases.js";
import bodyParser from "body-parser";
import bot from "./bot.js";
import { findContentByID } from "./models/content.js";

const sortByLastElement = (array) => {
    return array.sort((a, b) => {
        // Отримуємо останні елементи підмасивів
        const lastElementA = parseFloat(a[a.length - 1]);
        const lastElementB = parseFloat(b[b.length - 1]);

        // Порівнюємо ці елементи
        return lastElementA - lastElementB;
    });
};


const server = () => {

    const app = e();
    const port = 3010;

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    app.post('/webhook', async (req, res) => {
        try {
            const text = req.body;
            console.log("Received raw body:", text);
            
            // Отримання першого ключа об'єкту
            const firstKey = Object.keys(text)[0];
            console.log("First key:", firstKey);
            
            // Якщо ключ виглядає як JSON-рядок, розбираємо його
            const data = JSON.parse(firstKey);
            console.log("Parsed data:", data);
            console.log(data.merchantAccount, data.merchantSignature, data.amount, data.transactionStatus);

            const forHash = [
                data.merchantAccount,
                data.orderReference,
                data.amount,
                data.currency,
                data.authCode,
                data.cardPan,
                data.transactionStatus,
                data.reasonCode,
            ].join(';');

            const expectedMerchantSignature = crypto
                .createHmac('md5', values.merchant_sercret)
                .update(forHash)
                .digest('hex');

            console.log(expectedMerchantSignature);

            if (expectedMerchantSignature !== data.merchantSignature) {
                return res.status(400).json('Corrupted webhook received. Webhook signature is not authentic.');
            }

            const metadata = data?.products[0].name.split(',');
            const chatId = metadata[1];
            const courseName = metadata[0];

            if (data.transactionStatus === 'Approved') {
                if (!chatId || !courseName) {
                    return res.status(400).json('Webhook Error: Missing metadata');
                }
                // Create purchase
                console.log(chatId, courseName);
                await createNewPurchaseByChatId(chatId, courseName);

                const content = await findContentByID(courseName);
                console.log(content);

                for (const el of content) {
                    if (el.type === 'photo') {
                        await bot.sendPhoto(chatId, el.media, { caption: el.text });
                        continue;
                    }
                    await bot.sendDocument(chatId, el.media, { caption: el.text })
                }
                /*
                const sortedArrays = sortByLastElement(content);

                console.log(sortedArrays);
                */

            } else {
                return res.status(200).json('Webhook Error: Unhandled event type');
            }

            const answer = {
                orderReference: data.orderReference,
                status: 'accept',
                time: Date.now(),
                signature: '',
            };
            const forHashString = [answer.orderReference, answer.status, answer.time].join(';');
            const hash = crypto.createHmac('md5', values.merchant_sercret).update(forHashString).digest('hex');
            answer.signature = hash;

            return res.status(200).send(answer);
        } catch (err) {
            console.error('Error processing webhook:', err);
            return res.status(500).send('Server Error');
        }
    });
    
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    });

}

export default server;


  