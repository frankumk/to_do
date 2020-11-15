const express = require('express');
const app = express();
const { db, syncAndSeed, models: { User, Category, Item} } = require('./db');
const path = require('path');
const header = require('./templates.js');

app.use(express.static(path.join(__dirname,'./assets')));
app.use(express.urlencoded({ extended: false}));
app.use(require('method-override')('_method'));

app.get('/users',async(req,res,next)=>{
    try{
        const users = await User.findAll();
        res.send(`
            <!DOCTYPE html>
            <html>
                ${header()}
                <body>
                    <h1>TO DO TRACKER</h1>
                    <h2>Users</h2>
                    <ul>
                    ${
                        users.map(user=>`
                            <li><a href='/users/${user.name}'>${user.name}</a></li>
                        `).join('')
                    }
                    </ul>
                    <form id="user-form" method="POST">
                        <input type="text" name="name" id="add-user" required/>
                        <button>Create New User</button>
                    </form>
                </body>
            </html>
        `);
    }catch(ex){
        next(ex);
    }
});

app.post('/users',async(req,res,next)=>{
    try{
        await User.create(req.body);
        res.redirect('/users');

    }catch(ex){
        next(ex);
    }
});

// replace with app.use('/users',require('./routes/users'));
app.get('/users/:name',async(req,res,next)=>{
    try{
        const categories = await Category.findAll({
            include: [User]
        });
        res.send(`
            <!DOCTYPE html>
            <html>
                ${header()}
                <body>
                    <nav>
                        <a href='/users'>Back</a>
                    </nav>
                    <h1>TO DO TRACKER</h1>
                    <h2>${req.params.name}'s Categories</h2>
                    <ul>
                    ${
                        categories.map(category=>{if(category.user.name === req.params.name){ return `
                            <li><a href='/users/${req.params.name}/${category.name}'>${category.name}</a></li>
                        `}}).join('')
                    }
                    </ul>
                    <form id="cat-form" method="POST">
                        <input type="text" name="name" userId="${req.params.name}" id="add-category" required/>
                        <button>Create New Category</button>
                    </form>
                </body>
            </html>
        `);

    }catch(ex){
        next(ex);
    }
});

app.post('/users/:name',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where: {
                name: req.params.name
            }
        });
        //console.log(user.id);
        const newCat = await Category.create(req.body);
        newCat.userId = user.id;
        newCat.save();
        res.redirect(`/users/${req.params.name}`);

    }catch(ex){
        next(ex);
    }
});

// replace with app.use('/categories',require('./routes/categories'));
app.get('/users/:name/:catname',async(req,res,next)=>{
    try{
        //res.send(req.params);
        const items = await Item.findAll({
            include: {
                model: Category,
                include: {
                    model: User
                }
            }
        });
        res.send(`
            <!DOCTYPE html>
            <html>
                ${header()}
                <body>
                    <nav>
                        <a href='/users/${req.params.name}'>Back</a>
                     |   <a href='/users'>Home</a>
                    </nav>
                    <h1>${req.params.name}'s ${req.params.catname} Tracker</h1>
                    <h2>List</h2>
                    <ul>
                    ${
                        items.map(item=>{
                            if(item.category.user.name === req.params.name && item.category.name === req.params.catname){
                            return `
                            <li>${item.content}</li>
                        `}}).join('')
                    }
                    </ul>
                    <form id="user-form" method="POST">
                        <input type="text" name="content" id="add-item" required/>
                        <button>Create New Item</button>
                    </form>
                </body>
            </html>
        `);

    }catch(ex){
        next(ex);
    }
});



app.use((err,req,res,next)=>{
    console.log(err);
});

const init = async()=>{
    try{
        await db.authenticate();
        await syncAndSeed();

        const port = process.env.PORT || 3000
        app.listen(port, () => console.log(`listening on port ${port}`))
    }catch(ex){
        console.log(ex);
    }
}

init();