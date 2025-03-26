import { Content } from '../models/content.js';
import { Users } from '../models/user.js';

const DEBUG = true;

const main = async () => {
    try {
        const syncState = await Promise.all([
            Content.sync(),
            Users.sync()
        ]);
        
        
        
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
};

main();
