const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const LINK2M_API =
  "https://link2m.com/api-shorten/v2";


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {

    res.json({
        ok: true,
        service: "TLHT24H Link2M Proxy",
        status: "running"
    });

});


// ======================================================
// HEALTH
// ======================================================

app.get("/health", (req, res) => {

    res.json({
        ok: true,
        service: "TLHT24H Link2M Proxy",
        time: new Date().toISOString()
    });

});


// ======================================================
// SHORTEN
// ======================================================

app.post("/shorten", async (req, res) => {

    try {

        const token =
            String(
                process.env.LINK2M_TOKEN || ""
            ).trim();


        const destination =
            String(
                req.body?.url || ""
            ).trim();


        console.log(
            "================================="
        );

        console.log(
            "TLHT24H LINK2M REQUEST"
        );

        console.log(
            "DESTINATION:",
            destination
        );

        console.log(
            "TOKEN:",
            token ? "SET" : "MISSING"
        );

        console.log(
            "================================="
        );


        // --------------------------------------------------
        // TOKEN
        // --------------------------------------------------

        if (!token) {

            return res.status(500).json({
                ok: false,
                error: "LINK2M_TOKEN_MISSING"
            });

        }


        // --------------------------------------------------
        // URL
        // --------------------------------------------------

        if (!destination) {

            return res.status(400).json({
                ok: false,
                error: "URL_MISSING"
            });

        }


        // --------------------------------------------------
        // LINK2M REQUEST
        // --------------------------------------------------

        const apiUrl =
            LINK2M_API +
            "?api=" +
            encodeURIComponent(token) +
            "&url=" +
            encodeURIComponent(destination);


        console.log(
            "LINK2M API:",
            LINK2M_API
        );


        const response =
            await fetch(
                apiUrl,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json",

                        "User-Agent":
                            "Mozilla/5.0"
                    }
                }
            );


        const raw =
            await response.text();


        console.log(
            "LINK2M STATUS:",
            response.status
        );


        console.log(
            "LINK2M RAW:",
            raw.substring(0, 3000)
        );


        // --------------------------------------------------
        // HTTP ERROR
        // --------------------------------------------------

        if (!response.ok) {

            return res.status(502).json({

                ok: false,

                error:
                    "LINK2M_HTTP_ERROR",

                status:
                    response.status,

                response:
                    raw.substring(0, 2000)

            });

        }


        // --------------------------------------------------
        // JSON
        // --------------------------------------------------

        let data;


        try {

            data =
                JSON.parse(raw);

        } catch (e) {

            return res.status(502).json({

                ok: false,

                error:
                    "LINK2M_RESPONSE_NOT_JSON",

                response:
                    raw.substring(0, 2000)

            });

        }


        console.log(
            "LINK2M JSON:",
            JSON.stringify(data)
        );


        // --------------------------------------------------
        // TÌM LINK
        // --------------------------------------------------

        let shortUrl = null;


        if (
            typeof data === "string"
        ) {

            shortUrl =
                data;

        }


        if (
            !shortUrl &&
            data.shortenedUrl
        ) {

            shortUrl =
                data.shortenedUrl;

        }


        if (
            !shortUrl &&
            data.short_url
        ) {

            shortUrl =
                data.short_url;

        }


        if (
            !shortUrl &&
            data.shortUrl
        ) {

            shortUrl =
                data.shortUrl;

        }


        if (
            !shortUrl &&
            data.url
        ) {

            shortUrl =
                data.url;

        }


        if (
            !shortUrl &&
            data.link
        ) {

            shortUrl =
                data.link;

        }


        if (
            !shortUrl &&
            data.result
        ) {

            if (
                typeof data.result === "string"
            ) {

                shortUrl =
                    data.result;

            }


            if (
                typeof data.result === "object"
            ) {

                shortUrl =
                    data.result.shortenedUrl ||
                    data.result.short_url ||
                    data.result.shortUrl ||
                    data.result.url ||
                    data.result.link ||
                    null;

            }

        }


        // --------------------------------------------------
        // KHÔNG CÓ LINK
        // --------------------------------------------------

        if (!shortUrl) {

            console.error(
                "KHONG TIM THAY SHORT URL"
            );


            return res.status(502).json({

                ok: false,

                error:
                    "SHORT_URL_NOT_FOUND",

                response:
                    data

            });

        }


        shortUrl =
            String(
                shortUrl
            ).trim();


        // --------------------------------------------------
        // CHECK URL
        // --------------------------------------------------

        if (
            !/^https?:\/\//i.test(
                shortUrl
            )
        ) {

            console.error(
                "SHORT URL KHONG HOP LE:",
                shortUrl
            );


            return res.status(502).json({

                ok: false,

                error:
                    "INVALID_SHORT_URL",

                url:
                    shortUrl

            });

        }


        console.log(
            "SHORT URL:",
            shortUrl
        );


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        return res.json({

            ok: true,

            short_url:
                shortUrl,

            url:
                shortUrl

        });


    } catch (error) {

        console.error(
            "SERVER ERROR:",
            error
        );


        return res.status(500).json({

            ok: false,

            error:
                "PROXY_ERROR",

            message:
                error.message

        });

    }

});


// ======================================================
// 404
// ======================================================

app.use((req, res) => {

    res.status(404).json({

        ok: false,

        error:
            "NOT_FOUND",

        path:
            req.path

    });

});


// ======================================================
// SERVER
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "TLHT24H LINK2M PROXY"
        );

        console.log(
            "PORT:",
            PORT
        );

        console.log(
            "================================="
        );

    }
);
