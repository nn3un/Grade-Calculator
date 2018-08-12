  var express=require("express"),
          app=express(),
     mongoose=require("mongoose"),
   bodyparser=require("body-parser"),
         User=require("./models/user"),
     passport=require("passport"),
localStrategy=require("passport-local"),
        flash=require("connect-flash"),
cookieParser = require("cookie-parser"),
methodOverride=require("method-override");


//The routes
var indexRoutes = require("./routes/index"),
    userRoutes  = require("./routes/user"),
    courseRoutes= require("./routes/course"),
    assignmentRoutes = require("./routes/assignment"),
    subassignmentRoutes = require("./routes/subassignment");
    
//Setting up mongoose
var url = process.env.DATABASEURL || "mongodb://localhost/gradeCalc1";
mongoose.connect(url);

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyparser.urlencoded({extended: true}));
app.use(cookieParser('secret'));
app.use(require("express-session")({
    secret: "why do we need to assign grades anyways?",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Local variables
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(express.static(__dirname + "/public"));
app.use("/", indexRoutes);
app.use("/user/:userid", userRoutes);
app.use("/user/:userid/course", courseRoutes);
app.use("/user/:userid/course/:courseid/assignment", assignmentRoutes);
app.use("/user/:userid/course/:courseid/assignment/:assignmentid/subassignment", subassignmentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Sever has started....");
}

);