import { Purchase } from '../models/purchases.js';
import { logger } from '../logger/index.js';
import { Content } from '../models/content.js';
import { Courses } from '../models/courses.js';

const DEBUG = true;

const main = async () => {
    try {
        const syncState = await Promise.all([
            Purchase.sync(),
            Content.sync(),
            Courses.sync()
        ]);
        
        
        
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
};

main();
