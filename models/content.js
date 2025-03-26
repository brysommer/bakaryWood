import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Content extends Model {}
Content.init({
    media: {
        type: DataTypes.STRING, 
        allowNull: false,
        unique: false
    },
    text: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    media1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    media2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    media3: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: false,
    modelName: 'content',
    sequelize
});


const createContent = async (contentData) => {
    let res;
    try {
        res = await Content.create({ ...contentData });
        res = res.dataValues;
        logger.info(`Created content: ${res.media}`);
    } catch (err) {
        logger.error(`Impossible to create content: ${err}`);
    }
    return res;
};





const findContentByID = async (id) => {
    const res = await Content.findOne({ where: { id } });
    if (res) return res.dataValues;
    return;
};


export {
    Content,
    createContent,
    findContentByID,
};   