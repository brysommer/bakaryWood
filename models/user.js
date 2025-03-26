import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Users extends Model {}
Users.init({
    chat_id: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        unique: false
    },
    goods: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

}, {
    freezeTableName: false,
    timestamps: false,
    modelName: 'users',
    sequelize
});


const createUser = async (chat_id) => {
    let res;
    try {
        res = await Users.create({chat_id, goods: 1});
        res = res.dataValues;
        logger.info(`Created user: ${res.chat_id}`);
    } catch (err) {
        logger.error(`Impossible to create user: ${err}`);
    }
    return res;
};

const updateUserByChatId = async (chat_id, updateParams) => {
    const res = await Users.update({ ...updateParams } , { where: { chat_id } });
    if (res[0]) {
        const data = await findUserByChatId(chat_id);
        if (data) {
            return data;
        }
        logger.info(`User ${chat_id} updated, but can't read result data`);
    } 
    return undefined;
};


const findUserByChatId = async (chat_id) => {
    const res = await Users.findOne({ where: { chat_id } });
    if (res) return res.dataValues;    
};


export {
    Users,
    createUser,
    findUserByChatId,
    updateUserByChatId
};   