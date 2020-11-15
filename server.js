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
                    <ul id="user-list">
                    ${
                        users.map(user=>`
                            <li><a href='/users/${user.name}'>${user.name}</a></li>
                        `).join('')
                    }
                    </ul>
                    <form id="user-form" method="POST">
                        <input type="text" name="name" id="add-user" placeholder="User Name" required/>
                        <button>Create New User</button>
                    </form>
                    




                </body>
            </html>
        `);
    }catch(ex){
        next(ex);
    }
});
                    // <h4>OR (not working yet)</h4>
                    // <form id="complete-item-form" method="POST">
                    //     <input type="text" name="name" id="add-user-full" placeholder="User Name" required/>
                    //     <input type="text" name="name" id="add-category-full" placeholder="Category Name" required/>
                    //     <input type="text" name="content" id="add-item-full" placeholder="List Item" required/>
                    //     <button>Create List Item</button>
                    // </form>

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
                            <div class = "list-item-box">
                                <li><a href='/users/${req.params.name}/${category.name}'>${category.name}</a></li>
                                <form class="delete-form" method='POST' action='/users/${req.params.name}/${category.id}?_method=DELETE'>
                                    <button>X</button>
                                </form>
                                <form class = "complete-form">
                                    <button><span>&#10003</span></button>
                                </form>
                            </div>
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

//add category
app.post('/users/:name',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where: {
                name: req.params.name
            }
        });
        const newCat = await Category.create(req.body);
        newCat.userId = user.id;
        await newCat.save();
        res.redirect(`/users/${req.params.name}`);

    }catch(ex){
        next(ex);
    }
});

//delete category: not working because the items under it are referencing the category. Cascade? Or delete children first
app.delete('/users/:name/:id',async(req,res,next)=>{
    try{
        const cat = await Category.findOne({
            where: { id: req.params.id }
        });
        // console.log(cat);
        // await cat.destroy();
        // res.redirect(`/users/${req.params.name}/${req.params.id}`);

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
                            <div class="list-item-box">
                                <li>${item.content}</li>
                                <form class = "delete-form" method='POST' action='/users/${req.params.name}/${req.params.catname}/${item.id}?_method=DELETE'>
                                    <button>X</button>
                                </form>
                                <form class = "complete-form">
                                    <button><span>&#10003</span></button>
                                <form>
                            </div>
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

//Create list items
app.post('/users/:name/:catname',async(req,res,next)=>{
    try{
        const category = await Category.findOne({
            where: {
                name: req.params.catname
            }
        });
        const newItem = await Item.create(req.body);
        newItem.categoryId = category.id;
        await newItem.save();
        res.redirect(`/users/${req.params.name}/${req.params.catname}`);

    }catch(ex){
        next(ex);
    }
});

//destroy list items
app.delete('/users/:name/:catname/:id',async(req,res,next)=>{
    try{
        const deleteThis = await Item.findOne({
            where: { id: req.params.id }
        });
        console.log(deleteThis);
        await deleteThis.destroy();
        res.redirect(`/users/${req.params.name}/${req.params.catname}`);

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