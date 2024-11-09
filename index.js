import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;

//connect to db
await mongoose.connect(process.env.ATLAS_URI);
console.log(`Connected to Mongo`);

//pulling in User Model
import User from "./models/User.js"
import Post from "./models/Posts.js"

//turning off auto indexing for production env
//mongoose.set('autoIndex', false);

//mongoose has connection event listeners
//mongoose.connection.on('open', () => {
//    console.log(`Connected to Mongo`)
//})

//instance methods - creating new documents..
//newUser is instance ethod
const newUser = new User({
    name: "John Doe",
    email: "john@test.com",
    password: "123456",
    username: "johnjohn"
})
//console.log(newUser);//returns a new object, all objects methods can be used on this instance method
//this is still in mongoose, not on mongodb yet, to save on db save() - save is a promise, we need await, async to handle
//await newUser.save();


//invoke instance method
//console.log(newUser.sayHello());

//invoke static method
const user = await User.getByUsername("johnjohn");
//console.log(user);

console.log(user.yellName);


//body parser middleware
app.use(express.json());

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);

    } catch (err) {
        res.send(err).status(400);
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.send(err).status(400);
    }
})

app.get('/', async (req, res) => {
    //res.send("Learning Mongoose");
    //create is static method
    const newUser = await User.create({
        name: "Samwise Gamgee",
        email: "test@test.com",
        password: "123456",
        username: "samsam"
    })
    res.send(newUser);
})

//create user
app.post('/users', async (req, res) => {
    try {
        ////instance method, we can use all good ols js manipulations on user b4 creating...
        //const user = new User(req.body);
        //await user.validate();
        //await user.save();

        //static method
        const newUser = await User.create(req.body);
        res.status(200).json(newUser);
    } catch (err) {
        res.send(err).status(400);
    }
})

//get User posts
app.get('/users/:id/posts', async (req, res) => {
    try {
        const userPosts = await User.findById(req.params.id).populate("posts");
        res.status(200).json(userPosts);
    } catch (err) {
        res.send(err).status(400);
    }

})


//create a post
app.post('/posts/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(400).send("No User Found for given id");
        }
        //const post = await Post.create() need await for static method
        const post = new Post(req.body);
        post.userId = user._id;

        user.posts.push(post._id);

        await post.save();
        await user.save();

        res.status(201).json(post);

    } catch (err) {
        res.send(err).status(400);
    }
})


//update user
app.put('/users/:id', async (req, res) => {
    try {
        //third argument -options- just to get the updated user
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.send(err).status(400);
    }
})

//delete user
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndUpdate(req.params.id);
        res.status(200).json(deletedUser);
    } catch (err) {
        res.send(err).status(400);
    }
})



app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
})