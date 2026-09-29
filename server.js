const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "TLHT24H Link2M Proxy",
    time: new Date().toISOString()
  });
});

/* =========================
   HEALTH
========================= */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "TLHT24H Link2M Proxy",
    time: new Date().toISOString()
  });
});

/* =========================
   LINK2M SHORTEN
========================= */

app.post("/shorten", async (req, res) => {
  try {
    const token = String(process.env.LINK2M_TOKEN || "").trim();
    const url = String(req.body?.url || "").trim();

    console.log("====================================");
    console.log("LINK2M REQUEST");

    console.log("DESTINATION:", url);

    console.log(
      "TOKEN:",
      token ? "FOUND" : "MISSING"
    );

    /* =========================
       CHECK TOKEN
    ========================= */

    if (!token) {
      console.error("LINK2M_TOKEN MISSING");

      return res.status(500).json({
        ok: false,
        error: "LINK2M_TOKEN_MISSING"
      });
    }

    /* =========================
       CHECK URL
    ========================= */

    if (!url) {
      console.error("URL MISSING");

      return res.status(400).json({
        ok: false,
        error: "URL_MISSING"
      });
    }

    /* =========================
       LINK2M API
    ========================= */

    const apiUrl =
      "https://link2m.com/api-shorten/v2" +
      "?api=" +
      encodeURIComponent(token) +
      "&url=" +
      encodeURIComponent(url);

    console.log(
      "LINK2M API:",
      apiUrl.replace(token, "***")
    );

    /* =========================
       CALL LINK2M
    ========================= */

    const response = await fetch(apiUrl, {
      method: "GET",

      headers: {
        "Accept":
          "application/json, text/plain, */*",

        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 " +
          "(KHTML, like Gecko) " +
          "Chrome/153.0.0.0 Safari/537.36"
      }
    });

    /* =========================
       READ RESPONSE
    ========================= */

    const raw = await response.text();

    console.log(
      "LINK2M STATUS:",
      response.status
    );

    console.log(
      "LINK2M CONTENT-TYPE:",
      response.headers.get("content-type")
    );

    console.log("LINK2M RESPONSE:");

    console.log(
      raw.substring(0, 5000)
    );

    console.log("====================================");

    /* =========================
       HTTP ERROR
    ========================= */

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_HTTP_ERROR",

        status: response.status,

        content_type:
          response.headers.get("content-type"),

        response:
          raw.substring(0, 5000)
      });
    }

    /* =========================
       PARSE JSON
    ========================= */

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      console.error(
        "LINK2M RESPONSE IS NOT JSON"
      );

      return res.status(502).json({
        ok: false,
        error: "LINK2M_NOT_JSON",

        response:
          raw.substring(0, 5000)
      });
    }

    console.log(
      "LINK2M JSON:",
      JSON.stringify(data)
    );

    /* =========================
       FIND SHORT URL
    ========================= */

    const shortUrl =
      data.shortenedUrl ||
      data.short_url ||
      data.shortUrl ||
      data.url ||
      data.link ||

      data.result?.shortenedUrl ||
      data.result?.short_url ||
      data.result?.shortUrl ||
      data.result?.url ||
      data.result?.link ||

      data.data?.shortenedUrl ||
      data.data?.short_url ||
      data.data?.shortUrl ||
      data.data?.url ||
      data.data?.link;

    console.log(
      "SHORT URL:",
      shortUrl || "NOT FOUND"
    );

    /* =========================
       NO SHORT URL
    ========================= */

    if (!shortUrl) {
      return res.status(502).json({
        ok: false,

        error:
          "SHORT_URL_NOT_FOUND",

        response: data
      });
    }

    /* =========================
       SUCCESS
    ========================= */

    console.log(
      "LINK2M SUCCESS:",
      shortUrl
    );

    return res.json({
      ok: true,

      short_url: shortUrl,

      url: shortUrl
    });

  } catch (error) {

    console.error(
      "PROXY ERROR:",
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

/* =========================
   404
========================= */

app.use((req, res) => {

  return res.status(404).json({
    ok: false,

    error:
      "NOT_FOUND",

    path:
      req.path
  });

});

/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "===================================="
    );

    console.log(
      "TLHT24H Link2M Proxy"
    );

    console.log(
      "Server running on port:",
      PORT
    );

    console.log(
      "LINK2M_TOKEN:",
      process.env.LINK2M_TOKEN
        ? "FOUND"
        : "MISSING"
    );

    console.log(
      "===================================="
    );

  }
);
