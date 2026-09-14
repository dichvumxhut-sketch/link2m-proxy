const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const LINK2M_TOKEN = process.env.LINK2M_TOKEN;

app.use(express.json());

// Trang kiểm tra
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "TLHT24H Link2M Proxy"
  });
});

// API tạo link Link2M
app.get("/api/shorten", async (req, res) => {
  try {
    if (!LINK2M_TOKEN) {
      return res.status(500).json({
        status: "error",
        message: "LINK2M_TOKEN chưa được cấu hình"
      });
    }

    const longUrl = req.query.url;

    if (!longUrl) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu tham số url"
      });
    }

    const apiUrl =
      "https://link2m.net/api-shorten/v2" +
      "?api=" +
      encodeURIComponent(LINK2M_TOKEN) +
      "&url=" +
      encodeURIComponent(longUrl);

    console.log("Calling Link2M...");

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    console.log("Link2M HTTP:", response.status);
    console.log("Link2M response:", text.substring(0, 1000));

    try {
      const result = JSON.parse(text);

      return res
        .status(response.status)
        .json(result);

    } catch (error) {

      return res
        .status(response.status)
        .json({
          status: "error",
          message: "Link2M không trả JSON",
          http: response.status,
          response: text.substring(0, 500)
        });
    }

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
