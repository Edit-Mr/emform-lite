/** @format */

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const db = require("./database");
require("dotenv").config();

const app = express();

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ["identify", "email"],
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/");
    }
);

app.post("/submit-form", (req, res) => {
    const {
        name,
        email,
        club,
        position,
        profile,
        gender,
        firstChoice,
        reason1,
        secondChoice,
        reason2,
        moreInfo,
        DCusername,
        DCID,
    } = req.body;
    console.log([
        name,
        email,
        club,
        position,
        profile,
        gender,
        firstChoice,
        reason1,
        secondChoice,
        reason2,
        moreInfo,
        DCusername,
        DCID,
    ]);
    if (
        !name ||
        !email ||
        !firstChoice ||
        !reason1 ||
        !secondChoice ||
        !reason2 ||
        !DCusername ||
        !DCID
    ) {
        return res.status(400).send("必填項目未填寫ˋ");
    }

    db.run(
        `
    INSERT INTO user_data (name, email, club, position, profile, gender, 
      firstChoice, reason1, secondChoice, reason2, moreInfo, DCusername, DCID) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
            name,
            email,
            club,
            position,
            profile,
            gender,
            firstChoice,
            reason1,
            secondChoice,
            reason2,
            moreInfo,
            DCusername,
            DCID,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("Failed to save data.");
            }
            res.send("送出成功!");
        }
    );
});

app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.json(null);
    }
});

app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});

const pwd = process.env.PASSWORD;
// download as csv
app.get("/download", (req, res) => {
    if (req.query.password === pwd) {
        db.all("SELECT * FROM user_data", (err, rows) => {
            if (err) {
                return res.status(500).send("Failed to fetch data.");
            }
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=data.csv"
            );
            res.write("name,email,club,position,profile,gender,firstChoice,reason1,secondChoice,reason2,moreInfo,DCusername,DCID\n");
            rows.forEach(row => {
                res.write(
                    `${row.name},${row.email},${row.club},${row.position},${row.profile},${row.gender},${row.firstChoice},${row.reason1},${row.secondChoice},${row.reason2},${row.moreInfo},${row.DCusername},${row.DCID}\n`
                );
            });
            res.end();
        });
    } else {
        res.status(401).send("Unauthorized");
    }
});
