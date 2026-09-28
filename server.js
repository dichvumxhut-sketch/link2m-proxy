const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const LINK2M_API_URL =
  process.env.LINK2M_API_URL ||
  "https://link2m.com/api-shorten/v2";

function getShortUrl(data) {
  if (!data) return null;

  if (typeof data === "string") {
    const match = data.match(/https?:\/\/[^\s"'<>]+/i);
    return match ? match[0] : null;
  }

  return (
    data.short_url ||
    data.shortUrl ||
    data.url ||
    data.link ||
    data.result?.short_url ||
    data.result?.shortUrl ||
    data.result?.url ||
    data.result?.link ||
    null
  );
}

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

/*
 * WORKER GỌI:
 *
 * POST /shorten
 *
 * {
 *   "token": "...",
 *   "url": "https://..."
 * }
 */
app.post("/shorten", async (req, res) => {
  try {
    const token =
      String(req.body?.token || process.env.LINK2M_TOKEN || "").trim();

    const destination =
      String(req.body?.url || "").trim();

    if (!token) {
      return res.status(400).json({
        ok: false,
        error: "LINK2M_TOKEN_MISSING"
      });
    }

    if (!destination) {
      return res.status(400).json({
        ok: false,
        error: "URL_MISSING"
      });
    }

    console.log("========== LINK2M ==========");
    console.log("DESTINATION:", destination);
    console.log("TOKEN:", token ? "SET" : "EMPTY");
    console.log("API:", LINK2M_API_URL);

    const apiUrl =
      `${LINK2M_API_URL}` +
      `?api=${encodeURIComponent(token)}` +
      `&url=${encodeURIComponent(destination)}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "TLHT24H-Link2M-Proxy/1.0"
      }
    });

    const raw = await response.text();

    console.log("LINK2M HTTP:", response.status);
    console.log(
      "LINK2M RESPONSE:",
      raw.substring(0, 1000)
    );

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_HTTP_ERROR",
        status: response.status
      });
    }

    let data = null;

    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    const shortUrl = getShortUrl(data);

    if (!shortUrl) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_NO_SHORT_URL",
        response:
          typeof data === "string"
            ? data.substring(0, 1000)
            : data
      });
    }

    console.log("SHORT URL:", shortUrl);

    return res.json({
      ok: true,
      short_url: shortUrl,
      url: shortUrl
    });

  } catch (error) {
    console.error("SHORTEN ERROR:", error);

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
  console.log("=================================");
  console.log("TLHT24H Link2M Proxy");
  console.log("Server running on port", PORT);
  console.log("=================================");
});
