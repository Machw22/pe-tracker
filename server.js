require("dotenv").config();  //Read environment vars from .env
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5163;
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

express()
    .use(express.static(path.join(__dirname, "public")))
    .use(express.json())
    .use(express.urlencoded({ extended: true}))
    .set("views", path.join(__dirname, "views"))
    .set("view engine", "ejs")
    .get("/", async(req, res) => {
        try {
            const client = await pool.connect();
            const buttonSql = "SELECT * FROM buttons ORDER BY id ASC;";
            const counterSql = "SELECT * FROM counter ORDER BY id ASC;";
            const buttons = await client.query(buttonSql);
            const counter = await client.query(counterSql);
            const args = {
                "buttons": buttons ? buttons.rows : null,
                "counter": counter ? counter.rows : null

            };
            res.render("pages/index", args);
        }
        catch (err) {
            console.error(err);
            res.set({
                "Content-Type": "application/json"
            });
            req.json({
                error: err
            });
        }

        
    })
    .post("/log", async(req, res) => {
        res.set({
            "Content-Type": "application/json"
        });

        try {
            const client = await pool.connect();
            const id = req.body.id;

            if(id == 1) {
                const updateSql = `UPDATE counter SET count = count + 1 WHERE Id = 1 RETURNING name, count AS counter;`;
                const update = await client.query(updateSql);
                const response = {
                   up: update ? update.rows[0] : null
                };
                res.json(response);

            }

            if(id == 2) {
                const updateSql = `UPDATE counter SET count = count + 1 WHERE Id = 2 RETURNING name, count AS counter;`;
                const update = await client.query(updateSql);
                const response = {
                   up: update ? update.rows[0] : null
                };
                res.json(response);

            }

            if(id == 3) {
                const updateSql = `UPDATE counter SET count = 0 RETURNING count AS counter;`;
                const update = await client.query(updateSql);
                const response = {
                   up: update ? update.rows[0] : null
                };
                response.up.name = "reset";
                res.json(response);

            }
            
            client.release();
        }
        catch (err) {
            console.error(err);
            res.json({
                error: err
            })
        }
        
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`)); 