var express      = require("express"),
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
bodyParser       = require("body-parser"),
mongoose         = require("mongoose"),
app              = express();

// sets port for Heroku or Local Host
var PORT = process.env.PORT || 3000;
// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// ==================== Mongoose/model config  =============================
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema);

// ================= RESTful Routes ==========================

app.get("/", function (req, res) {
        res.redirect("/blogs");
});
// index route
app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log("ERROR");            
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    });
});
// NEW Route
app.get("/blogs/new", function (req,res) {
    res.render("new");
});

// CREATE Route
app.post("/blogs", function (req, res) {
    // The object that is sent from our form on the NEW page
    console.log(req.body.blog);
    // stops script tags with mal intent from being inserted
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // takes in the "blog" object that is submittted from the html form
    Blog.create(req.body.blog, function (err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//SHOW Route
app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog:foundBlog});
        }
    });
});

//EDIT Route
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });

});

//UPDATE (PUT) Route
app.put("/blogs/:id", function (req, res) {
    // stops script tags with mal intent from being inserted
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DESTROY Route
app.delete("/blogs/:id", function  (req,res) {
    Blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs");
        }
    });
    res.redirect("/blogs");
});

// APP Startup Log
app.listen(PORT, function () {
    console.log("Listening on PORT: " + PORT);
});
