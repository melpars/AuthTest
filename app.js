
// npm
// installed packages: express, mongoose, passport, bodyparser, passport local, passport local mongoose, express session

var express 				= require("express"),
	mongoose 				= require("mongoose"),
	passport 				= require("passport"),
	bodyParser 				= require("body-parser"),
	User					= require("./models/user"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose   = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/auth_app");

var app = express();
app.set("view engine", "ejs");
// format data:
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
	// three options to work with passport:
	// secret used to encode and decode sessions:
	secret: "Food is so good... but wine is better",
	resave: false,
	saveUninitialized: false
}));

// setting up passport: 
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// methods provided by passport local mongoose package
// read data from session and encode or decode:
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/////////// Routes ////////////

app.get("/", function(req, res){
	res.render("home");
});


app.get("/secret", isLoggedIn, function(req, res) {
	res.render("secret");
});

// Auth Routes:

// signup form:
app.get("/register", function(req, res) {
	res.render("register");
});

// handle user signup:
app.post("/register", function(req, res){
	// add username and hashed password:
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if (err) {
			console.log(err);
			return res.render("register");
		}
		// log the user in using local strategy with passport:
		passport.authenticate("local")(req, res, function() {
			res.redirect("/secret");
		});
	});	
});

// Login Routes:

// Login logic:
app.get("/login",function(req, res) {
	res.render("login");
});

// Runs before route callback (middleware)
app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}), function(req, res){

});

app.get("/logout", function(req, res) {
	req.logout(); // no long track user data in the session
	res.redirect("/");
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

app.listen(8080, function() {
	console.log("Auth Test App has started!");
});