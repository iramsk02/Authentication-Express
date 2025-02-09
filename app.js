const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "iram123"

dotenv.config();
const PORT = process.env.PORT || 3001;


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myauthentication')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));


app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { title: "Home Page" });
});
app.get('/about', (req, res) => {
    res.render('index', { title: "about" });
});
app.get('/contact', (req, res) => {
    res.render('index', { title: "contact" });
});

app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    // console.log(username, password);

    const user = new User({ username, password });
    await user.save();
    // console.log(user.username,user.password,user.Usertoken);
    console.log(user);
    res.send('user successfully signed in');
    return;

});

app.post('/signin', async (req, res) => {
    let Username = req.body.username;
    let Password = req.body.password;

    const foundUser = await User.findOne({ username: Username });

    if (!foundUser) {
        return res.status(403).send({ message: "Invalid username and password" });
    }

    const token = jwt.sign({ username: Username }, JWT_SECRET, { expiresIn: "1h" });
    console.log(token);

    res.send({ message: "User successfully signed in", token });
});


function auth(req, res, next) {
    const token = req.headers.authorization;
    const usernameFromHeader = req.headers['x-username'];
    console.log(token)
    console.log(usernameFromHeader)
    // console.log(req.headers)

    if (!token ) {
        return res.status(401).send({ message: "Unauthorized: No token provided" });
    }


    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Invalid token" });
        }

        if (decoded.username !== usernameFromHeader) {
            return res.status(403).send({ message: "Invalid user. Token does not match username." });
        }

        req.user = decoded; 
        next(); 
    });
}

app.get('/me', auth, (req, res) => {
    const username = req.user.username;
    console.log("Authenticated user:", username);
    res.render('me', { title: "User", user: req.user, layout: false });
});



app.listen(PORT, () => console.log(`Server running on ${PORT}`));
