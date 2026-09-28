const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "TLHT24H Link2M Proxy"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TLHT24H Link2M Proxy",
    time: new Date().toISOString()
  });
});

app.post("/shorten", async (req, res) => {
  try {
    const token = String(
      process.env.LINK2M_TOKEN || ""
    ).trim();

    const url = String(
      req.body?.url || ""
    ).trim();

    if (!token) {
      console.error("LINK2M_TOKEN MISSING");

      return res.status(500).json({
        ok: false,
        error: "LINK2M_TOKEN_MISSING"
      });
    }

    if (!url) {
      return res.status(400).json({
        ok: false,
        error: "URL_MISSING"
      });
    }

    console.log("=================================");
    console.log("LINK2M REQUEST");
    console.log("DESTINATION:", url);
    console.log("TOKEN: SET");
    console.log("=================================");

    const apiUrl =
      "https://link2m.com/api-shorten/v2" +
      "?api=" +
      encodeURIComponent(token) +
      "&url=" +
      encodeURIComponent(url);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const raw = await response.text();

    console.log("LINK2M HTTP:", response.status);
    console.log(
      "LINK2M RESPONSE:",
      raw.substring(0, 2000)
    );

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_HTTP_ERROR",
        status: response.status,
        response: raw.substring(0, 1000)
      });
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      console.error("LINK2M RESPONSE IS NOT JSON");

      return res.status(502).json({
        ok: false,
        error: "LINK2M_NOT_JSON",
        response: raw.substring(0, 1000)
      });
    }

    console.log("LINK2M JSON:", data);

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
      data.result?.link;

    if (!shortUrl) {
      console.error(
        "KHONG TIM THAY SHORT URL"
      );

      return res.status(502).json({
        ok: false,
        error: "SHORT_URL_NOT_FOUND",
        response: data
      });
    }

    console.log(
      "SHORT URL:",
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
      error: "PROXY_ERROR",
      message: error.message
    });
  }
});

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    path: req.path
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    "================================="
  );
  console.log(
    "TLHT24H Link2M Proxy"
  );
  console.log(
    "Server running on port:",
    PORT
  );
  console.log(
    "================================="
  );
});
