import { Sequelize } from 'sequelize';
import path from 'path';

const _dirname = process.cwd();
const dbpath = path.join(_dirname, 'bakerywood.db');


export const sequelize = new Sequelize({
    storage: dbpath,
    dialect: 'sqlite',
    logging: false
});
