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
            const buttons = await client.query(buttonSql);
            const args = {
                "buttons": buttons ? buttons.rows : null
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
            const insertSql = `INSERT INTO buttons (name)
                VALUES (concat('Child of ', $1::text))
                RETURNING id AS new_id;`;
            const selectSql = "SELECT LOCALTIME;";
            const insert = await client.query(insertSql, [id]);
            const select = await client.query(selectSql);

            const response = {
                newId: insert ? insert.rows[0] : null,
                when: select ? select.rows[0] : null
            };
            res.json(response);
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