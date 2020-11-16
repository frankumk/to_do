const Sequelize = require('sequelize');
const { STRING, BOOLEAN } = Sequelize;

const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/to_do_db');

const User = db.define('user',{
    name: {
        type:STRING,
        allowNull: false,
        unique: true
    }
})

const Category = db.define('category',{
    name: {
        type: STRING,
        allowNull: false,
    },
    complete: {
        type: BOOLEAN,
        defaultValue: false
    }
});

const Item = db.define('item',{
    content: {
        type: STRING,
        allowNull: false
    },
    complete: {
        type: BOOLEAN,
        defaultValue: false
    }
});

Category.belongsTo(User);
User.hasMany(Category);

Item.belongsTo(Category, {onDelete: 'cascade', onUpdate: 'cascade'});
Category.hasMany(Item);

// Item.belongsTo(User);
// User.hasMany(Item);

const syncAndSeed = async()=>{
    await db.sync({force:true});

    const [kayla,nikolai] = await Promise.all([
        User.create({name:'Kayla'}),
        User.create({name:'Nikolai'}),
    ]);
    const [groceries,today,travel,books] = await Promise.all(
        ['groceries','today','travel','books'].map(name=>Category.create({ name }))
    );

    const [pickles,cookies,bake,hw,greece,patagonia,neuromancer,mudbound] = await Promise.all(
        ['pickles','cookies','bake cookies','do hw','greece','patagonia','neuromancer','mudbound']
        .map(content=>Item.create({content}))
    );

    groceries.userId = nikolai.id;
    travel.userId = kayla.id;
    books.userId = nikolai.id;
    today.userId = kayla.id;
    cookies.complete = true;
    hw.complete = true;
    await Promise.all([books.save(),groceries.save(),today.save(),travel.save()]);
    pickles.categoryId = groceries.id;
    cookies.categoryId = groceries.id;
    bake.categoryId = today.id;
    hw.categoryId = today.id;
    greece.categoryId = travel.id;
    patagonia.categoryId = travel.id;
    neuromancer.categoryId = books.id;
    mudbound.categoryId = books.id;
    await Promise.all([pickles.save(),cookies.save(),bake.save(),hw.save(),greece.save(),patagonia.save(),neuromancer.save(),mudbound.save()]);
}

module.exports = {
    db,
    syncAndSeed,
    models: {
        User,
        Category,
        Item
    }
}