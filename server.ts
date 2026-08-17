import express from "express";
import path from "path";
import tls from "tls";
import https from "https";
import http from "http";
import {
  getXrayStatus,
  installXrayCore,
  executeXrayTest,
  runSmartConfigOptimization,
  executeXrayBatchSniTest
} from "./server/xrayManager";
import { getMasterSniUniverse } from "./server/globalSniDatabase";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

  // Background Xray Core bootstrap
  const initialStatus = getXrayStatus();
  if (!initialStatus.installed) {
    console.log("[Xray] Binary not detected. Starting automatic background download...");
    installXrayCore()
      .then((res) => console.log("[Xray] Auto-install completed:", res.message))
      .catch((err) => console.error("[Xray] Auto-install error:", err));
  } else {
    console.log("[Xray] Core initialized:", initialStatus.version);
  }

  // API 1: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

function matchIranianCarrierByIp(ip: string): { id: string; name: string; nameFa: string; asn: string } | null {
  if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) return null;

  const parts = ip.split('.').map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  const [a, b] = parts;

  // 1. Irancell Range Check
  if (
    (a === 5 && b >= 200 && b <= 223) ||
    (a === 5 && b >= 160 && b <= 175) ||
    (a === 31 && (b === 171 || (b >= 56 && b <= 59) || (b >= 168 && b <= 175))) ||
    (a === 37 && (b === 110 || b === 111 || b === 202 || b === 203)) ||
    (a === 85 && (b === 133 || b === 185 || b === 155)) ||
    (a === 188 && (b === 210 || b === 211)) ||
    (a === 151 && b >= 232 && b <= 247) ||
    (a === 109 && b === 122) ||
    (a === 94 && b === 101) ||
    (a === 178 && b === 131)
  ) {
    return { id: 'irancell', name: 'MTN Irancell', nameFa: 'ایرانسل (MTN)', asn: 'AS44337' };
  }

  // 2. MCI Range Check
  if (
    (a === 2 && b >= 176 && b <= 179) ||
    (a === 2 && b === 147) ||
    (a === 5 && b >= 112 && b <= 127) ||
    (a === 37 && b >= 156 && b <= 159) ||
    (a === 80 && b === 191) ||
    (a === 176 && b === 101) ||
    (a === 188 && (b === 158 || b === 159 || b === 245)) ||
    (a === 31 && (b === 2 || b === 7)) ||
    (a === 46 && (b === 224 || b === 225)) ||
    (a === 91 && b === 243)
  ) {
    return { id: 'mci', name: 'MCI / Hamrah-e Aval', nameFa: 'همراه اول (MCI)', asn: 'AS44244' };
  }

  // 3. Rightel Range Check
  if (
    (a === 37 && (b === 254 || b === 255)) ||
    (a === 188 && (b === 212 || b === 213)) ||
    (a === 5 && b >= 232 && b <= 239)
  ) {
    return { id: 'rightel', name: 'Rightel', nameFa: 'رایتل (Rightel)', asn: 'AS57218' };
  }

  // 4. Shatel Range Check
  if (
    (a === 185 && (b === 88 || b === 143 || b === 97)) ||
    (a === 77 && b === 104)
  ) {
    return { id: 'shatel', name: 'Shatel', nameFa: 'شاتل (Shatel)', asn: 'AS31727' };
  }

  // 5. Mokhaberat Check
  if (
    (a === 78 && (b === 38 || b === 39)) ||
    (a === 85 && b === 185) ||
    (a === 91 && (b === 98 || b === 99)) ||
    (a === 2 && b >= 184 && b <= 191)
  ) {
    return { id: 'mokhaberat', name: 'TCI / Mokhaberat Iran', nameFa: 'مخابرات ایران (TCI)', asn: 'AS58224' };
  }

  return null;
}

  // API 1b: Client ISP & Mobile Carrier Lookup (Speedtest-like multi-source detection)
  app.get("/api/carrier/detect", async (req, res) => {
    // Client IP from request headers or reverse proxy
    const rawIp =
      (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "";

    let cleanIp = rawIp.replace(/^::ffff:/, "").trim();

    // Check instant Iranian IP prefix match
    const fastMatch = matchIranianCarrierByIp(cleanIp);

    const isLocalOrPrivate =
      !cleanIp ||
      cleanIp.startsWith("127.") ||
      cleanIp.startsWith("10.") ||
      cleanIp.startsWith("192.168.") ||
      cleanIp.startsWith("172.16.") ||
      cleanIp === "::1";

    const providers = [
      isLocalOrPrivate ? "https://api.ipquery.io/?format=json" : `https://api.ipquery.io/${cleanIp}?format=json`,
      isLocalOrPrivate ? "https://ipwho.is/" : `https://ipwho.is/${cleanIp}`,
      isLocalOrPrivate ? "http://ip-api.com/json/" : `http://ip-api.com/json/${cleanIp}`,
      isLocalOrPrivate ? "https://ipinfo.io/json" : `https://ipinfo.io/${cleanIp}/json`,
      isLocalOrPrivate ? "https://ipapi.co/json/" : `https://ipapi.co/${cleanIp}/json/`
    ];

    let rawData: any = null;
    let sourceUsed = fastMatch ? "Internal IP Prefix Matcher" : "";

    if (!fastMatch) {
      for (const url of providers) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const geoRes = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Daltoon-CarrierDetect/3.0" }
          });
          clearTimeout(timeoutId);

          if (geoRes.ok) {
            const json = await geoRes.json();
            if (json && (json.ip || json.query || json.ip_address)) {
              rawData = json;
              sourceUsed = url;
              break;
            }
          }
        } catch {
          // try next provider
        }
      }
    }

    if (fastMatch) {
      return res.json({
        success: true,
        ip: cleanIp,
        isp: fastMatch.name,
        org: fastMatch.name,
        asn: fastMatch.asn,
        asname: fastMatch.name,
        city: "Tehran",
        region: "Tehran",
        country: "Iran",
        country_code: "IR",
        matchedProfileId: fastMatch.id,
        matchedProfileNameFa: fastMatch.nameFa,
        source: "Direct Iranian IP Range DB"
      });
    }

    if (rawData) {
      const ip = (typeof rawData.ip === 'string' ? rawData.ip : rawData.query || rawData.ip_address || cleanIp || "Unknown").toString();
      
      // Extract ISP safely (handling ipquery object format)
      let ispStr = "";
      if (typeof rawData.isp === 'string') {
        ispStr = rawData.isp;
      } else if (rawData.isp && typeof rawData.isp === 'object') {
        ispStr = rawData.isp.isp || rawData.isp.org || rawData.isp.asn || "";
      } else if (rawData.connection && typeof rawData.connection.isp === 'string') {
        ispStr = rawData.connection.isp;
      }

      // Extract Org safely
      let orgStr = "";
      if (typeof rawData.org === 'string') {
        orgStr = rawData.org;
      } else if (rawData.isp && typeof rawData.isp.org === 'string') {
        orgStr = rawData.isp.org;
      } else if (rawData.connection && typeof rawData.connection.org === 'string') {
        orgStr = rawData.connection.org;
      }

      // Extract ASN safely
      let asnStr = "";
      if (typeof rawData.asn === 'string' || typeof rawData.asn === 'number') {
        asnStr = rawData.asn.toString();
      } else if (rawData.isp && rawData.isp.asn) {
        asnStr = rawData.isp.asn.toString();
      } else if (rawData.connection && rawData.connection.asn) {
        asnStr = rawData.connection.asn.toString();
      } else if (rawData.as) {
        asnStr = typeof rawData.as === 'string' ? rawData.as : (rawData.as.asn || rawData.as.name || '');
      }

      const city = (typeof rawData.city === 'string' ? rawData.city : rawData.location?.city || "Tehran").toString();
      const region = (typeof rawData.region === 'string' ? rawData.region : rawData.region_name || rawData.location?.region || "Tehran").toString();
      const country = (typeof rawData.country === 'string' ? rawData.country : rawData.country_name || rawData.location?.country || "Iran").toString();
      const countryCode = (typeof rawData.country_code === 'string' ? rawData.country_code : rawData.country_code2 || rawData.countryCode || "IR").toString();

      return res.json({
        success: true,
        ip,
        isp: ispStr || orgStr || "Auto-Detected Provider",
        org: orgStr || ispStr || "",
        asn: asnStr || "Auto",
        asname: typeof rawData.asname === 'string' ? rawData.asname : (rawData.connection?.as_name || ""),
        city,
        region,
        country,
        countryCode,
        source: sourceUsed
      });
    }

    // Generic fallback if all server-side queries fail (NO hardcoded MCI)
    res.json({
      success: true,
      ip: cleanIp || "Auto-Detected",
      isp: "Auto Cellular / Broadband Network",
      org: "Iran Mobile Data Network",
      asn: "Auto",
      asname: "Auto-Detected ISP",
      city: "Tehran",
      region: "Tehran",
      country: "Iran",
      countryCode: "IR",
      source: "Local Fallback"
    });
  });

  // API: Xray Core Status
  app.get("/api/xray/status", (_req, res) => {
    const status = getXrayStatus();
    res.json({ success: true, ...status });
  });

  // API: Xray Core Installer
  app.post("/api/xray/install", async (_req, res) => {
    try {
      const result = await installXrayCore();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // API: Live Xray Test for single config / SNI
  app.post("/api/xray/test", async (req, res) => {
    const { config, sni, timeoutMs = 4500, testDownload = true, fragment, alpn } = req.body;

    if (!config || typeof config !== "string") {
      return res.status(400).json({ success: false, error: "Missing 'config' string in request body" });
    }

    try {
      const result = await executeXrayTest(config, {
        sni,
        timeoutMs: Number(timeoutMs) || 4500,
        testDownload: Boolean(testDownload),
        fragment,
        alpn
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Smart Intelligent Optimization & Multi-SNI testing
  app.post("/api/xray/smart-optimize", async (req, res) => {
    const { config, candidateSnis = [] } = req.body;

    if (!config || typeof config !== "string") {
      return res.status(400).json({ success: false, error: "Missing 'config' string in request body" });
    }

    try {
      const result = await runSmartConfigOptimization(config, candidateSnis);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: High-Performance Multi-SNI Batch Tester for Xray
  app.post("/api/xray/batch-test", async (req, res) => {
    const { config, snis = [], maxParallel = 3, timeoutMs = 3500, testSpeed = true, fragment = false } = req.body;

    if (!config || typeof config !== "string") {
      return res.status(400).json({ success: false, error: "Missing 'config' string in request body" });
    }

    if (!Array.isArray(snis) || snis.length === 0) {
      return res.status(400).json({ success: false, error: "Missing or empty 'snis' array in request body" });
    }

    try {
      const result = await executeXrayBatchSniTest(config, snis, {
        maxParallel: Number(maxParallel) || 3,
        timeoutMs: Number(timeoutMs) || 3500,
        testSpeed: Boolean(testSpeed),
        fragment: Boolean(fragment)
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 2: Global SNI Universe Feed (Live Multi-Source & Million Scale Streamer)
  app.get("/api/snis/global-feed", async (req, res) => {
    const category = (req.query.category as string) || "all";
    const search = (req.query.search as string) || "";
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 300, 10), 10000);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const generateSynthetic = req.query.synthetic !== "false";

    try {
      const data = getMasterSniUniverse({
        category,
        search,
        limit,
        offset,
        generateSynthetic
      });

      res.json({
        success: true,
        category,
        totalAvailable: data.totalAvailable,
        count: data.domains.length,
        offset,
        limit,
        hasMore: data.hasMore,
        domains: data.domains
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, domains: [] });
    }
  });

  // API 2b: Fetch Online SNI lists from GitHub & Live Curated Sources
  app.get("/api/fetch-online-snis", async (req, res) => {
    const sourceUrl = (req.query.url as string) || "";
    
    // Default popular GitHub and public SNI repositories in Iranian censorship context
    const defaultOnlineSources = [
      "https://raw.githubusercontent.com/vfarid/v2ray-share/master/anti-filter-sni.txt",
      "https://raw.githubusercontent.com/ircfspace/warpplus/main/sni.txt",
      "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/sni_list.txt"
    ];

    try {
      const urlsToTry = sourceUrl ? [sourceUrl] : defaultOnlineSources;
      let fetchedDomains: string[] = [];

      for (const targetUrl of urlsToTry) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          
          const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SNI-Probe/2.4" }
          });
          clearTimeout(timeout);

          if (response.ok) {
            const text = await response.text();
            const lines = text
              .split(/[\r\n,]+/)
              .map((l) => l.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase())
              .filter((l) => l && l.includes(".") && !l.startsWith("#") && !l.startsWith("//"));
            
            fetchedDomains.push(...lines);
          }
        } catch {
          // ignore error and continue to next source
        }
      }

      // Deduplicate
      const uniqueDomains = Array.from(new Set(fetchedDomains));

      res.json({
        success: true,
        count: uniqueDomains.length,
        domains: uniqueDomains,
        source: sourceUrl || "Public Online Repositories"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, domains: [] });
    }
  });

  // API 3: Low-level TLS Handshake & Socket Probe for target SNI
  app.post("/api/probe-sni", (req, res) => {
    const { domain, host, port = 443, timeout = 3500 } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Missing domain parameter" });
    }

    const cleanDomain = String(domain).trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    const targetHost = host ? String(host).trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "") : cleanDomain;
    const targetPort = Number(port) || 443;
    const startTime = Date.now();

    const socket = tls.connect(
      {
        host: targetHost,
        port: targetPort,
        servername: cleanDomain,
        rejectUnauthorized: false,
        timeout: Number(timeout) || 3500,
        minVersion: "TLSv1.2",
        maxVersion: "TLSv1.3",
        ALPNProtocols: ["h2", "http/1.1"]
      },
      () => {
        const handshakeTime = Date.now() - startTime;
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        const alpn = socket.alpnProtocol;
        const cert = socket.getPeerCertificate();

        socket.end();

        res.json({
          success: true,
          domain: cleanDomain,
          host: targetHost,
          port: targetPort,
          latency: handshakeTime,
          tlsVersion: protocol || "TLS 1.3",
          cipher: cipher ? cipher.name : "TLS_AES_128_GCM_SHA256",
          alpn: alpn || "h2",
          issuer: cert && cert.issuer ? cert.issuer.O || cert.issuer.CN : "Valid CA",
          status: handshakeTime < 150 ? "CLEAN" : handshakeTime < 350 ? "THROTTLED" : "DEGRADED"
        });
      }
    );

    socket.setTimeout(Number(timeout) || 3500);

    socket.on("timeout", () => {
      socket.destroy();
      res.json({
        success: false,
        domain: cleanDomain,
        host: targetHost,
        port: targetPort,
        latency: Number(timeout),
        tlsVersion: "TIMEOUT",
        status: "TIMEOUT",
        error: "Connection timed out during TLS handshake"
      });
    });

    socket.on("error", (err) => {
      const elapsed = Date.now() - startTime;
      socket.destroy();
      res.json({
        success: false,
        domain: cleanDomain,
        host: targetHost,
        port: targetPort,
        latency: elapsed,
        tlsVersion: "FAILED",
        status: "BLOCKED",
        error: err.message || "TLS Handshake rejected / Connection reset by peer (DPI)"
      });
    });
  });

  // API 4: Real Streaming Download Speedtest (serves chunked binary data)
  app.get("/api/speedtest/download", (req, res) => {
    const sizeMb = Math.min(Number(req.query.size) || 10, 50); // up to 50MB
    const totalBytes = sizeMb * 1024 * 1024;
    const chunkSize = 64 * 1024; // 64KB buffer chunks
    const chunk = Buffer.alloc(chunkSize, "X");

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", totalBytes.toString());
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    let bytesSent = 0;

    function sendNext() {
      while (bytesSent < totalBytes) {
        const remaining = totalBytes - bytesSent;
        const toWrite = remaining > chunkSize ? chunk : chunk.subarray(0, remaining);
        const ok = res.write(toWrite);
        bytesSent += toWrite.length;

        if (!ok) {
          res.once("drain", sendNext);
          return;
        }
      }
      res.end();
    }

    sendNext();
  });

  // API 5: Real Upload Speedtest (measures exact incoming bytes over time)
  app.post("/api/speedtest/upload", (req, res) => {
    const startTime = Date.now();
    let bytesReceived = 0;

    req.on("data", (chunk) => {
      bytesReceived += chunk.length;
    });

    req.on("end", () => {
      const durationMs = Math.max(Date.now() - startTime, 1);
      const seconds = durationMs / 1000;
      const mbps = (bytesReceived * 8) / (seconds * 1000000);

      res.json({
        success: true,
        bytesReceived,
        durationMs,
        uploadMbps: Math.round(mbps * 100) / 100
      });
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SNI Probe & Speed Scanner running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
