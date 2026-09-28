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
    const token = process.env.LINK2M_TOKEN;
    const url = req.body?.url;

    if (!token) {
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

    const api = `https://link2m.com/api-shorten/v2?api=${encodeURIComponent(token)}&url=${encodeURIComponent(url)}`;

    const response = await fetch(api);
    const text = await response.text();

    console.log("LINK2M HTTP:", response.status);
    console.log("LINK2M RESPONSE:", text);

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_HTTP_ERROR",
        status: response.status,
        response: text.substring(0, 500)
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_NOT_JSON",
        response: text.substring(0, 500)
      });
    }

    const shortUrl =
      data.shortenedUrl ||
      data.short_url ||
      data.shortUrl ||
      data.url ||
      data.link;

    if (!shortUrl) {
      return res.status(502).json({
        ok: false,
        error: "SHORT_URL_NOT_FOUND",
        response: data
      });
    }

    return res.json({
      ok: true,
      short_url: shortUrl
    });

  } catch (error) {
    console.error("PROXY ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "PROXY_ERROR"
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    path: req.path
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("TLHT24H Link2M Proxy running on port", PORT);
});
