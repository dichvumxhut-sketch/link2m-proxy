app.post("/shorten", async (req, res) => {
  try {
    const token = String(process.env.LINK2M_TOKEN || "").trim();
    const url = String(req.body?.url || "").trim();

    console.log("========== LINK2M REQUEST ==========");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "FOUND" : "MISSING");

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

    const apiUrl =
      "https://link2m.com/api-shorten/v2" +
      "?api=" +
      encodeURIComponent(token) +
      "&url=" +
      encodeURIComponent(url);

    console.log("LINK2M API URL:", apiUrl.replace(token, "***"));

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36"
      }
    });

    const raw = await response.text();

    console.log("LINK2M STATUS:", response.status);
    console.log("LINK2M CONTENT-TYPE:", response.headers.get("content-type"));
    console.log("LINK2M RESPONSE:");
    console.log(raw.substring(0, 5000));
    console.log("====================================");

    let data = null;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("LINK2M RESPONSE IS NOT JSON");
    }

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_HTTP_ERROR",
        status: response.status,
        content_type: response.headers.get("content-type"),
        response: raw.substring(0, 5000)
      });
    }

    if (!data) {
      return res.status(502).json({
        ok: false,
        error: "LINK2M_NOT_JSON",
        response: raw.substring(0, 5000)
      });
    }

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

    console.log("SHORT URL FOUND:", shortUrl || "NO");

    if (!shortUrl) {
      return res.status(502).json({
        ok: false,
        error: "SHORT_URL_NOT_FOUND",
        response: data
      });
    }

    return res.json({
      ok: true,
      short_url: shortUrl,
      url: shortUrl
    });

  } catch (error) {
    console.error("PROXY ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "PROXY_ERROR",
      message: error.message
    });
  }
});
