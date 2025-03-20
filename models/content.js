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
    course: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serial: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: true,
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



const findContentByCourse = async (course) => {
    const res = await Content.findAll({ where: { course } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};


export {
    Content,
    createContent,
    findContentByCourse,
};   