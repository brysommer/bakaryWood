import { WFP, WFP_CONFIG } from 'overshom-wayforpay';
import values from './values.js';

WFP_CONFIG.DEFAULT_PAYMENT_CURRENCY = 'UAH';

const wfp = new WFP({
    MERCHANT_ACCOUNT: 't_me_03148',
    MERCHANT_SECRET_KEY: values.merchant_sercret,
    MERCHANT_DOMAIN_NAME: '51.20.1.118:3000',
    // service URL needed to receive webhooks
    SERVICE_URL: 'http://51.20.1.118:3000/webhook',
});

const sessionCreate = async (price, courseName, chatId) => {
    const session = await wfp.createInvoiceUrl({
        orderReference: (Math.random() * 1e17).toString(),
        productName: [courseName + ',' + chatId],
        productCount: [1],
        productPrice: [price],
    });
    console.log(session)
    return session.value?.invoiceUrl;
}



export {wfp, sessionCreate}




