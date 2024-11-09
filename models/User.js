import mongoose from 'mongoose';
//Schema is a property of mongoose, we re jus using schema with in the mongoose, mongoose method
import { Schema, model } from 'mongoose';


//const userSchema = new mongoose.Schema({
//    //we create blueprint for a user document, all the validation needed, ..
//})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        minLength: 5,
        maxLength: 20,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    //user can own multiple posts, one to many relationships
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        //required: true
    }]
})
// the above schema setting.. every single collection going to follow, Schema is per collection with our lesson5 db, this particular model created will deal only with User collection only
//models what we use to talk to collections


//defining indexes
userSchema.index({ username: 1 }) // 1 is for ascending operation
//mongo will automatically create these indexes with in mongodb database when application starts, this can be expensive, it can be switch of in production env with - mongoose.set('autoIndex', false) in main file


//defing instance methods
userSchema.methods.sayHello = function () {
    return `Hello! My name is ${this.name}`; //this keyword refers to instace 
}

//defining static model method
userSchema.statics.getByUsername = async function (input) {
    //with statics this keyword is actually going to refer the actual model, cause model is going to call this method..
    return await this.findOne({ username: input });
}

//virtuals are data types of mongoose, which dont really exist in database, we cannot query them, but they exist, they get updated every single time we run the program
//virtual values bypass the validation rules, bbecause its not inserted into database- may lead to potential vulnerability...
userSchema.virtual("yellName").get(function () {
    return `Hello!! heyy ${this.name}!!!`
})

//aliases re used to allow an imaginary property to get and set the value of another property, this typically used to save bandwidth, as it allows to store data in fields with much shorter, less dexcriptive names


//export default mongoose.model("User", userSchema );
//we re impoting model method from mongoose on top, no need to mention mongoose.model
export default model("User", userSchema);


//inorder to actually run this file we have to import this our main file server.js or index.js..., once we run this file we can see a new database created on atlas Mongo db with User collection