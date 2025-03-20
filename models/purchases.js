import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Purchase extends Model {}
Purchase.init({
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'purchase',
    sequelize
});


const createNewPurchaseByChatId = async (chat_id, course_name) => {
    let res;
    try {
        res = await Purchase.create({ chat_id, course_name });
        res = res.dataValues;
        logger.info(`Created purchase with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to purchase user: ${err}`);
    }
    return res;
};



const findPurchaseByChatId = async (chat_id) => {
    const res = await User.findOne({ where: { chat_id: chat_id } });
    if (res) return res.dataValues;
    return res;
};

export {
    Purchase,
    createNewPurchaseByChatId,
    findPurchaseByChatId,
};   