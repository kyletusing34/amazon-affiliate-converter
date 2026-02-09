// netlify/functions/resolve-short-url.js

exports.handler = async (event) => {
  try {
    const url =
      event.queryStringParameters && event.queryStringParameters.url;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing url parameter" }),
      };
    }

    // Allow only known Amazon short domains
    const allowedHosts = ["a.co", "amzn.to"];
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid URL" }),
      };
    }

    if (!allowedHosts.includes(parsed.hostname)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Host not allowed" }),
      };
    }

    // Follow redirects server-side to get the final Amazon URL
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    const finalUrl = response.url;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      // Key name matches front-end expectation: data.resolvedUrl
      body: JSON.stringify({ resolvedUrl: finalUrl }),
    };
  } catch (err) {
    console.error("resolve-short-url error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to resolve URL" }),
    };
  }
};
