var express = require("express");
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose");
// APP CONFIG

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE/MODEL_CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now} 
});
var Blog = mongoose.model("Blog",blogSchema);

//RESTFUL ROUTES

app.get("/",function(req,res){
	res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err) {
			console.log("ERROR");
		} else {
			res.render("index",{blogs: blogs});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new",function(req,res){
	res.render("new");
});

//CREATE ROUTES
app.post("/blogs",function(req,res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newBlog){
		if(err){
			res.render("new");
		} else {
			//redirect to index
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show",{blog: foundBlog});
		}
	})
});
//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit",{blog: foundBlog});
		}
	});	
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DESTROY ROUTE
app.delete("/blogs/:id",function(req,res){
	//destroy and redirect
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(3000,function(){
	console.log("Server is running");
});