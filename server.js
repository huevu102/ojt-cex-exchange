const express = require('express');
const router = require('./routes/router');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());                                // for parsing application/json
app.use(express.urlencoded({ extended: true }));        // for parsing application/x-www-form-urlencoded

app.use(session({
    secret: 'Arbitrage-Dev-Training',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24*3600*1000 },
    name: 'Arbitrage-Dev-Training-' + port
}));

router(app);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
