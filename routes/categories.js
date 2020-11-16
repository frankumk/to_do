const {models: { User, Category, Item} } = require('../db');
const path = require('path');
const header = require('../templates.js');

const app = require('express').Router();
module.exports = app;

app.get('/users/:name/:catname',async(req,res,next)=>{
    try{
        //res.send(req.params);
        const items = await Item.findAll({
            include: {
                model: Category,
                include: {
                    model: User
                }
            },
            order: [
                ['content']
            ]
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
                            let style='';
                            if(item.complete===true){
                                style='text-decoration: line-through'
                            }
                            if(item.category.user.name === req.params.name && item.category.name === req.params.catname){
                            return `
                            <div class="list-item-box">
                                <li style="${style}">${item.content}</li>
                                <form class = "delete-form" method='POST' action='/users/${req.params.name}/${req.params.catname}/${item.id}?_method=DELETE'>
                                    <button>X</button>
                                </form>
                                <form class = "complete-form" method="POST" action='/users/${req.params.name}/${req.params.catname}/${item.id}?_method=PUT'>
                                    <button><span>&#10003</span></button>
                                <form>
                            </div>
                        `}}).join('')
                    }
                    </ul>
                    <form id="user-form" method="POST">
                        <input type="text" name="content" id="add-item" >
                        <button>Create New Item</button>
                    </form>
                    <script>

                    </script>
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

//Updating item to complete when user clicks check mark, so that they can get strikethrough style
app.put('/users/:name/:catname/:id',async(req,res,next)=>{
    try{  
        const completed = await Item.findByPk(req.params.id);
        await completed.update({
            complete: true
        });
        res.redirect(`/users/${req.params.name}/${req.params.catname}`);
    }catch(ex){
        next(ex);
    }

});
