import { SniItem } from '../types';

/**
 * Massive Worldwide TLS 1.3 & ECH SNI Datasets (Updated for Latest 2026 Standards)
 * Curated for Xray/V2Ray Reality, VLESS, Trojan, Fragmentation, and Anti-Censorship Bypasses.
 * Categorized by Major Global CDN, Cloud Edge, ECH Pioneers, AI Gateways & Anycast Infrastructure.
 */

// 1. ECH & NEXT-GEN ANTI-FILTER TLS 1.3 (Highest resistance to DPI / SNI blocking)
export const ECH_ANTI_FILTER_SNIS: SniItem[] = [
  { id: 'ech_cf_test', domain: 'cloudflare-ech.com', category: 'ech', description: 'Official Cloudflare ECH & TLS 1.3 Testbed', isPopular: true },
  { id: 'ech_crypto', domain: 'crypto.cloudflare.com', category: 'ech', description: 'Cloudflare Cryptography / ECH Gateway', isPopular: true },
  { id: 'ech_dev_spec', domain: 'tls-ech.dev', category: 'ech', description: 'IETF TLS 1.3 Encrypted Client Hello Test', isPopular: true },
  { id: 'ech_defo', domain: 'defo.ie', category: 'ech', description: 'Decentralised ECH Working Group (TLS 1.3)', isPopular: true },
  { id: 'ech_cf_quic', domain: 'cloudflare-quic.com', category: 'ech', description: 'Cloudflare HTTP/3 & TLS 1.3 QUIC Gateway', isPopular: true },
  { id: 'ech_try_cf', domain: 'trycloudflare.com', category: 'ech', description: 'Cloudflare Tunnel Edge (TLS 1.3)', isPopular: true },
  { id: 'ech_argo', domain: 'argo.cloudflare.com', category: 'ech', description: 'Cloudflare Smart Argo Routing Node', isPopular: true },
  { id: 'ech_mask_icloud', domain: 'mask.icloud.com', category: 'ech', description: 'Apple Private Relay ECH & TLS 1.3 Anycast', isPopular: true },
  { id: 'ech_mask_api', domain: 'mask-api.icloud.com', category: 'ech', description: 'Apple Private Relay Ingress Gateway', isPopular: true },
  { id: 'ech_mask_h2', domain: 'mask-h2.icloud.com', category: 'ech', description: 'Apple Private Relay HTTP/2 Edge Node', isPopular: true },
  { id: 'ech_dns_google', domain: 'dns.google', category: 'ech', description: 'Google Public DNS TLS 1.3 (DoT/DoH Anycast)', isPopular: true },
  { id: 'ech_dns_quad9', domain: 'dns.quad9.net', category: 'ech', description: 'Quad9 Anycast TLS 1.3 Secure Resolver', isPopular: true },
  { id: 'ech_dns_adguard', domain: 'dns.adguard-dns.com', category: 'ech', description: 'AdGuard Global Anycast TLS 1.3 Edge', isPopular: true },
  { id: 'ech_dns_controld', domain: 'freedns.controld.com', category: 'ech', description: 'Control D TLS 1.3 Fast Anycast Gateway' },
  { id: 'ech_cf_sec', domain: 'security.cloudflare-dns.com', category: 'ech', description: 'Cloudflare 1.1.1.2 Security DNS TLS 1.3', isPopular: true },
  { id: 'ech_one_dns', domain: 'one.one.one.one', category: 'ech', description: 'Cloudflare 1.1.1.1 Ultra-Fast Anycast TLS 1.3', isPopular: true },
  { id: 'ech_cf_speed', domain: 'speed.cloudflare.com', category: 'ech', description: 'Cloudflare Global Speed Measurement Node', isPopular: true },
  { id: 'ech_cf_cp', domain: 'cp.cloudflare.com', category: 'ech', description: 'Cloudflare Captive Portal Anycast Edge', isPopular: true },
  { id: 'ech_android_check', domain: 'connectivitycheck.android.com', category: 'ech', description: 'Android Connectivity Check (Unblocked TLS 1.3)', isPopular: true },
  { id: 'ech_gstatic_check', domain: 'connectivitycheck.gstatic.com', category: 'ech', description: 'Google Connectivity Probe (Clean TLS 1.3)', isPopular: true },
  { id: 'ech_msft_test', domain: 'msftconnecttest.com', category: 'ech', description: 'Microsoft NCSI Connectivity Probe TLS 1.3', isPopular: true },
  { id: 'ech_deflect', domain: 'deflect.ca', category: 'ech', description: 'Deflect Anti-Censorship Anycast Edge' }
];

// 2. AI & NEXT-GEN TECH PLATFORMS (Fastest Growing Clean TLS 1.3 SNIs)
export const AI_NEXTGEN_SNIS: SniItem[] = [
  { id: 'ai_gemini', domain: 'gemini.google.com', category: 'ai', description: 'Google Gemini AI Global Edge (TLS 1.3)', isPopular: true },
  { id: 'ai_google_dev', domain: 'ai.google.dev', category: 'ai', description: 'Google AI Developer Gateway (TLS 1.3)', isPopular: true },
  { id: 'ai_aistudio', domain: 'aistudio.google.com', category: 'ai', description: 'Google AI Studio Core Portal (TLS 1.3)', isPopular: true },
  { id: 'ai_copilot', domain: 'copilot.microsoft.com', category: 'ai', description: 'Microsoft Copilot Global Anycast (TLS 1.3)', isPopular: true },
  { id: 'ai_designer', domain: 'designer.microsoft.com', category: 'ai', description: 'Microsoft Designer Cloud AI Edge', isPopular: true },
  { id: 'ai_claude', domain: 'claude.ai', category: 'ai', description: 'Anthropic Claude AI (Cloudflare TLS 1.3)', isPopular: true },
  { id: 'ai_anthropic', domain: 'anthropic.com', category: 'ai', description: 'Anthropic Official Portal (TLS 1.3)' },
  { id: 'ai_chatgpt', domain: 'chatgpt.com', category: 'ai', description: 'OpenAI ChatGPT Cloudflare Edge (TLS 1.3)', isPopular: true },
  { id: 'ai_oai_static', domain: 'cdn.oaistatic.com', category: 'ai', description: 'OpenAI Static Asset Anycast CDN', isPopular: true },
  { id: 'ai_huggingface', domain: 'huggingface.co', category: 'ai', description: 'Hugging Face AI Model Hub (Cloudflare TLS 1.3)', isPopular: true },
  { id: 'ai_replicate', domain: 'replicate.com', category: 'ai', description: 'Replicate AI Cloud Compute Gateway', isPopular: true },
  { id: 'ai_perplexity', domain: 'perplexity.ai', category: 'ai', description: 'Perplexity AI Search Anycast (TLS 1.3)', isPopular: true },
  { id: 'ai_deepseek', domain: 'deepseek.com', category: 'ai', description: 'DeepSeek LLM Global Anycast (TLS 1.3)', isPopular: true },
  { id: 'ai_mistral', domain: 'mistral.ai', category: 'ai', description: 'Mistral AI Cloudflare Edge Node', isPopular: true },
  { id: 'ai_groq', domain: 'groq.com', category: 'ai', description: 'Groq LPU Fast Inference Edge (TLS 1.3)', isPopular: true }
];

// 3. YAHOO! Worldwide Network (Highest Stability & Cleanest TLS 1.3 in Iran)
export const YAHOO_SNIS: SniItem[] = [
  { id: 'y_com', domain: 'www.yahoo.com', category: 'yahoo', description: 'Yahoo Global Portal (TLS 1.3 Anycast)', isPopular: true },
  { id: 'y_search', domain: 'search.yahoo.com', category: 'yahoo', description: 'Yahoo Search Engine Gateway (TLS 1.3)', isPopular: true },
  { id: 'y_finance', domain: 'finance.yahoo.com', category: 'yahoo', description: 'Yahoo Finance Realtime Feed', isPopular: true },
  { id: 'y_mail', domain: 'mail.yahoo.com', category: 'yahoo', description: 'Yahoo Mail Edge Server', isPopular: true },
  { id: 'y_news', domain: 'news.yahoo.com', category: 'yahoo', description: 'Yahoo News Global CDN', isPopular: true },
  { id: 'y_sports', domain: 'sports.yahoo.com', category: 'yahoo', description: 'Yahoo Sports Live Stream Edge' },
  { id: 'y_s_yimg', domain: 's.yimg.com', category: 'yahoo', description: 'Yahoo Static Asset CDN (Akamai/Edgecast)', isPopular: true },
  { id: 'y_s1_yimg', domain: 's1.yimg.com', category: 'yahoo', description: 'Yahoo High-Speed Asset Server 1', isPopular: true },
  { id: 'y_s2_yimg', domain: 's2.yimg.com', category: 'yahoo', description: 'Yahoo High-Speed Asset Server 2', isPopular: true },
  { id: 'y_s3_yimg', domain: 's3.yimg.com', category: 'yahoo', description: 'Yahoo High-Speed Asset Server 3' },
  { id: 'y_yimg', domain: 'yimg.com', category: 'yahoo', description: 'Yahoo Media Delivery Network (TLS 1.3)' },
  { id: 'y_zenfs', domain: 'media.zenfs.com', category: 'yahoo', description: 'Yahoo Media ZenFS Asset Edge', isPopular: true },
  { id: 'y_flurry', domain: 'flurry.com', category: 'yahoo', description: 'Yahoo Flurry Analytics Anycast' },
  { id: 'y_dev', domain: 'developer.yahoo.com', category: 'yahoo', description: 'Yahoo Developer Gateway' },
  { id: 'y_login', domain: 'login.yahoo.com', category: 'yahoo', description: 'Yahoo Auth & Token Edge (TLS 1.3)', isPopular: true },
  { id: 'y_geo', domain: 'geo.yahoo.com', category: 'yahoo', description: 'Yahoo Anycast Geo Routing Cluster', isPopular: true },
  { id: 'y_help', domain: 'help.yahoo.com', category: 'yahoo', description: 'Yahoo Support Edge Portal' },
  { id: 'y_my', domain: 'my.yahoo.com', category: 'yahoo', description: 'Yahoo Personalized Dashboard Edge' },
  { id: 'y_ae', domain: 'ae.yahoo.com', category: 'yahoo', description: 'Yahoo Middle East / UAE Hub (Low Latency)', isPopular: true },
  { id: 'y_tr', domain: 'tr.yahoo.com', category: 'yahoo', description: 'Yahoo Turkey Fast Edge Cluster', isPopular: true },
  { id: 'y_de', domain: 'de.yahoo.com', category: 'yahoo', description: 'Yahoo Germany Frankfurt Hub', isPopular: true },
  { id: 'y_uk', domain: 'uk.yahoo.com', category: 'yahoo', description: 'Yahoo UK London European Hub', isPopular: true },
  { id: 'y_fr', domain: 'fr.yahoo.com', category: 'yahoo', description: 'Yahoo France Paris Gateway' },
  { id: 'y_nl', domain: 'nl.yahoo.com', category: 'yahoo', description: 'Yahoo Netherlands Amsterdam Hub', isPopular: true },
  { id: 'y_sg', domain: 'sg.yahoo.com', category: 'yahoo', description: 'Yahoo Singapore Fast Asian Node', isPopular: true },
  { id: 'y_jp', domain: 'jp.yahoo.com', category: 'yahoo', description: 'Yahoo Japan Asian Mega Cluster', isPopular: true },
  { id: 'y_hk', domain: 'hk.yahoo.com', category: 'yahoo', description: 'Yahoo Hong Kong Gateway' },
  { id: 'y_tw', domain: 'tw.yahoo.com', category: 'yahoo', description: 'Yahoo Taiwan Edge Node' },
  { id: 'y_in', domain: 'in.yahoo.com', category: 'yahoo', description: 'Yahoo India Regional Server' },
  { id: 'y_ch', domain: 'ch.yahoo.com', category: 'yahoo', description: 'Yahoo Switzerland Zurich Gateway' },
  { id: 'y_se', domain: 'se.yahoo.com', category: 'yahoo', description: 'Yahoo Sweden Stockholm Edge' },
  { id: 'y_at', domain: 'at.yahoo.com', category: 'yahoo', description: 'Yahoo Austria Vienna Hub' },
  { id: 'y_it', domain: 'it.yahoo.com', category: 'yahoo', description: 'Yahoo Italy Milan Edge' },
  { id: 'y_es', domain: 'es.yahoo.com', category: 'yahoo', description: 'Yahoo Spain Madrid Gateway' },
  { id: 'y_ca', domain: 'ca.yahoo.com', category: 'yahoo', description: 'Yahoo Canada Edge Node' },
  { id: 'y_au', domain: 'au.yahoo.com', category: 'yahoo', description: 'Yahoo Australia Sydney Hub' },
  { id: 'y_br', domain: 'br.yahoo.com', category: 'yahoo', description: 'Yahoo Brazil São Paulo Gateway' }
];

// 4. CLOUDFLARE Global Anycast & CDN Edge (TLS 1.3 / ECH / HTTP3)
export const CLOUDFLARE_SNIS: SniItem[] = [
  { id: 'cf_speed', domain: 'speed.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Speedtest Benchmark', isPopular: true },
  { id: 'cf_cdnjs', domain: 'cdnjs.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Public CDN Libraries', isPopular: true },
  { id: 'cf_dash', domain: 'dash.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Console Gateway' },
  { id: 'cf_dev', domain: 'developers.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Docs CDN (TLS 1.3)' },
  { id: 'cf_workers', domain: 'workers.dev', category: 'cloudflare', description: 'Cloudflare Serverless Workers Domain', isPopular: true },
  { id: 'cf_pages', domain: 'pages.dev', category: 'cloudflare', description: 'Cloudflare Pages CDN Anycast', isPopular: true },
  { id: 'cf_stream', domain: 'cloudflarestream.com', category: 'cloudflare', description: 'Cloudflare Video Delivery Network' },
  { id: 'cf_radar', domain: 'radar.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Radar Analytics (TLS 1.3)' },
  { id: 'cf_blog', domain: 'blog.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Official Blog' },
  { id: 'cf_one', domain: 'one.one.one.one', category: 'cloudflare', description: 'Cloudflare Ultra-fast DNS TLS 1.3', isPopular: true },
  { id: 'cf_warp', domain: 'warp.plus', category: 'cloudflare', description: 'Cloudflare Warp Edge CDN', isPopular: true },
  { id: 'cf_api', domain: 'api.cloudflare.com', category: 'cloudflare', description: 'Cloudflare API Gateway' },
  { id: 'cf_client', domain: 'cloudflareclient.com', category: 'cloudflare', description: 'Cloudflare Zero Trust Client (TLS 1.3)' },
  { id: 'cf_insights', domain: 'static.cloudflareinsights.com', category: 'cloudflare', description: 'Cloudflare Insights Static Asset Edge' },
  { id: 'cf_ipfs', domain: 'cloudflare-ipfs.com', category: 'cloudflare', description: 'Cloudflare IPFS Web3 Gateway' },
  { id: 'cf_challenges', domain: 'challenges.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Turnstile Edge Anycast' },
  { id: 'cf_dns', domain: 'cloudflare-dns.com', category: 'cloudflare', description: 'Cloudflare DoH / DoT Anycast', isPopular: true },
  { id: 'cf_cache', domain: 'cf-cache.com', category: 'cloudflare', description: 'Cloudflare Global Edge Cache' },
  { id: 'cf_net', domain: 'cf.cdn.cloudflare.net', category: 'cloudflare', description: 'Cloudflare Tier-1 Network Core' },
  { id: 'cf_jsdelivr', domain: 'cdn.jsdelivr.net', category: 'cloudflare', description: 'jsDelivr Global Open-Source CDN', isPopular: true },
  { id: 'cf_unpkg', domain: 'unpkg.com', category: 'cloudflare', description: 'Unpkg Fast NPM CDN Anycast', isPopular: true },
  { id: 'cf_discord_gg', domain: 'discord.gg', category: 'cloudflare', description: 'Discord Invite Fast Anycast Edge', isPopular: true },
  { id: 'cf_shopify_cdn', domain: 'cdn.shopify.com', category: 'cloudflare', description: 'Shopify Global E-Commerce CDN', isPopular: true },
  { id: 'cf_gitlab', domain: 'gitlab.com', category: 'cloudflare', description: 'GitLab Global Anycast Edge (TLS 1.3)', isPopular: true },
  { id: 'cf_substack', domain: 'substack.com', category: 'cloudflare', description: 'Substack Cloudflare Anycast Portal' },
  { id: 'cf_canva', domain: 'canva.com', category: 'cloudflare', description: 'Canva Design Realtime Edge', isPopular: true }
];

// 5. AKAMAI Distributed CDN & Enterprise Nodes (TLS 1.3)
export const AKAMAI_SNIS: SniItem[] = [
  { id: 'ak_spotify', domain: 'audio-ak-spotify-com.akamaized.net', category: 'akamai', description: 'Akamai Spotify High-Bitrate CDN', isPopular: true },
  { id: 'ak_yahoo_bridge', domain: 's.yimg.com.edgekey.net', category: 'akamai', description: 'Akamai EdgeKey Yahoo Bridge (TLS 1.3)', isPopular: true },
  { id: 'ak_base', domain: 'akamaized.net', category: 'akamai', description: 'Akamai Distributed Edge Anycast', isPopular: true },
  { id: 'ak_hd', domain: 'akamaihd.net', category: 'akamai', description: 'Akamai HD Streaming & Video Cluster', isPopular: true },
  { id: 'ak_suite', domain: 'edgesuite.net', category: 'akamai', description: 'Akamai EdgeSuite Gateway' },
  { id: 'ak_key', domain: 'edgekey.net', category: 'akamai', description: 'Akamai Global EdgeKey Portal', isPopular: true },
  { id: 'ak_edge', domain: 'akamaiedge.net', category: 'akamai', description: 'Akamai Enterprise Edge Anycast' },
  { id: 'ak_apple', domain: 'apple.com.edgekey.net', category: 'akamai', description: 'Akamai Apple Asset Delivery Node', isPopular: true },
  { id: 'ak_steam', domain: 'media.steampowered.com.akamaized.net', category: 'akamai', description: 'Steam Akamai Game Content CDN', isPopular: true },
  { id: 'ak_ps', domain: 'playstation.com.edgekey.net', category: 'akamai', description: 'PlayStation Network Akamai Node', isPopular: true },
  { id: 'ak_nintendo', domain: 'nintendo.com.edgekey.net', category: 'akamai', description: 'Nintendo Network Akamai Edge' },
  { id: 'ak_epic', domain: 'epicgames.com.edgekey.net', category: 'akamai', description: 'Epic Games Akamai Delivery Cluster', isPopular: true },
  { id: 'ak_hulu', domain: 'hulu.com.edgekey.net', category: 'akamai', description: 'Hulu Akamai Streaming CDN' },
  { id: 'ak_adobe', domain: 'adobe.com.edgekey.net', category: 'akamai', description: 'Adobe Cloud EdgeKey Network' },
  { id: 'ak_bmw', domain: 'bmw.com.edgekey.net', category: 'akamai', description: 'BMW Global Akamai CDN' },
  { id: 'ak_mercedes', domain: 'mercedes-benz.com.edgekey.net', category: 'akamai', description: 'Mercedes-Benz Akamai Gateway' },
  { id: 'ak_target', domain: 'target.com.edgekey.net', category: 'akamai', description: 'Target Akamai Anycast Edge' },
  { id: 'ak_walmart', domain: 'walmart.com.edgekey.net', category: 'akamai', description: 'Walmart E-Commerce Akamai Edge' },
  { id: 'ak_sony', domain: 'sony.com.edgekey.net', category: 'akamai', description: 'Sony Global Content EdgeKey' },
  { id: 'ak_dell', domain: 'dell.com.edgekey.net', category: 'akamai', description: 'Dell Akamai Asset Delivery Node' },
  { id: 'ak_ikea', domain: 'ikea.com.edgekey.net', category: 'akamai', description: 'IKEA Global Akamai CDN' },
  { id: 'ak_redhat', domain: 'redhat.com.edgekey.net', category: 'akamai', description: 'Red Hat Enterprise Akamai Node' },
  { id: 'ak_prod', domain: 'prod.akamaized.net', category: 'akamai', description: 'Akamai Production Cluster (TLS 1.3)' },
  { id: 'ak_com', domain: 'www.akamai.com', category: 'akamai', description: 'Akamai Official Global Portal' }
];

// 6. FASTLY Edge Cloud & Developer Networks (TLS 1.3)
export const FASTLY_SNIS: SniItem[] = [
  { id: 'fa_gh_assets', domain: 'github.githubassets.com', category: 'fastly', description: 'GitHub Fastly Asset Node (TLS 1.3)', isPopular: true },
  { id: 'fa_gh_raw', domain: 'raw.githubusercontent.com', category: 'fastly', description: 'GitHub Raw Storage Fastly Anycast', isPopular: true },
  { id: 'fa_gh_avatars', domain: 'avatars.githubusercontent.com', category: 'fastly', description: 'GitHub Avatar CDN Fastly', isPopular: true },
  { id: 'fa_gh_api', domain: 'api.github.com', category: 'fastly', description: 'GitHub REST API Gateway Fastly', isPopular: true },
  { id: 'fa_gh_com', domain: 'github.com', category: 'fastly', description: 'GitHub Core Portal Fastly Edge', isPopular: true },
  { id: 'fa_reddit', domain: 'reddit.map.fastly.net', category: 'fastly', description: 'Fastly Reddit Global Anycast Map', isPopular: true },
  { id: 'fa_spotify', domain: 'spotify.map.fastly.net', category: 'fastly', description: 'Fastly Spotify Audio Stream Map', isPopular: true },
  { id: 'fa_nytimes', domain: 'nytimes.map.fastly.net', category: 'fastly', description: 'Fastly NYTimes Edge Node' },
  { id: 'fa_pinterest', domain: 'pinterest.map.fastly.net', category: 'fastly', description: 'Fastly Pinterest Image CDN' },
  { id: 'fa_vimeo', domain: 'vimeo.map.fastly.net', category: 'fastly', description: 'Fastly Vimeo Video Delivery' },
  { id: 'fa_guardian', domain: 'guardian.map.fastly.net', category: 'fastly', description: 'Fastly Guardian Global Map' },
  { id: 'fa_yelp', domain: 'yelp.map.fastly.net', category: 'fastly', description: 'Fastly Yelp Edge Network' },
  { id: 'fa_dualstack', domain: 'dualstack.fastly.net', category: 'fastly', description: 'Fastly Dualstack IPv4/IPv6 Edge', isPopular: true },
  { id: 'fa_global_prod', domain: 'global.prod.fastly.net', category: 'fastly', description: 'Fastly Global Production Cluster', isPopular: true },
  { id: 'fa_mdn', domain: 'developer.mozilla.org', category: 'fastly', description: 'MDN Web Docs Fastly Edge (TLS 1.3)', isPopular: true },
  { id: 'fa_stripe', domain: 'stripe.com', category: 'fastly', description: 'Stripe Payments Fastly Gateway (TLS 1.3)', isPopular: true },
  { id: 'fa_stripe_api', domain: 'api.stripe.com', category: 'fastly', description: 'Stripe API Edge Node' },
  { id: 'fa_framer', domain: 'framer.com', category: 'fastly', description: 'Framer Modern Web Engine Fastly' },
  { id: 'fa_duckduckgo', domain: 'duckduckgo.com', category: 'fastly', description: 'DuckDuckGo Privacy Search Fastly Edge', isPopular: true },
  { id: 'fa_pypi', domain: 'pypi.org', category: 'fastly', description: 'Python Package Index Fastly CDN', isPopular: true },
  { id: 'fa_python', domain: 'python.org', category: 'fastly', description: 'Python Software Foundation Gateway' },
  { id: 'fa_rubygems', domain: 'rubygems.org', category: 'fastly', description: 'RubyGems Global Registry Fastly' }
];

// 7. GOOGLE Global Cache & Cloud Edge (TLS 1.3 / QUIC)
export const GOOGLE_SNIS: SniItem[] = [
  { id: 'gg_fonts_static', domain: 'fonts.gstatic.com', category: 'google', description: 'Google Fonts High-Speed CDN (TLS 1.3)', isPopular: true },
  { id: 'gg_fonts_api', domain: 'fonts.googleapis.com', category: 'google', description: 'Google API Fonts Gateway (TLS 1.3)', isPopular: true },
  { id: 'gg_images', domain: 'images.google.com', category: 'google', description: 'Google Images CDN Edge', isPopular: true },
  { id: 'gg_ajax', domain: 'ajax.googleapis.com', category: 'google', description: 'Google Hosted Libraries CDN', isPopular: true },
  { id: 'gg_lh3', domain: 'lh3.googleusercontent.com', category: 'google', description: 'Google User Content Node LH3', isPopular: true },
  { id: 'gg_lh4', domain: 'lh4.googleusercontent.com', category: 'google', description: 'Google User Content Node LH4' },
  { id: 'gg_lh5', domain: 'lh5.googleusercontent.com', category: 'google', description: 'Google User Content Node LH5' },
  { id: 'gg_lh6', domain: 'lh6.googleusercontent.com', category: 'google', description: 'Google User Content Node LH6' },
  { id: 'gg_cloud', domain: 'cloud.google.com', category: 'google', description: 'Google Cloud Platform Portal (TLS 1.3)' },
  { id: 'gg_storage', domain: 'storage.googleapis.com', category: 'google', description: 'Google Cloud Storage Edge Node', isPopular: true },
  { id: 'gg_maps_api', domain: 'maps.googleapis.com', category: 'google', description: 'Google Maps API Endpoint' },
  { id: 'gg_translate', domain: 'translate.googleapis.com', category: 'google', description: 'Google Translate Realtime Edge' },
  { id: 'gg_play', domain: 'play.google.com', category: 'google', description: 'Google Play Store Global Gateway' },
  { id: 'gg_dl', domain: 'dl.google.com', category: 'google', description: 'Google Download & Chrome Update Edge (TLS 1.3)', isPopular: true },
  { id: 'gg_firebase', domain: 'firestore.googleapis.com', category: 'google', description: 'Google Firestore Realtime Endpoint', isPopular: true },
  { id: 'gg_fb_inst', domain: 'firebaseinstallations.googleapis.com', category: 'google', description: 'Firebase Installations Edge', isPopular: true },
  { id: 'gg_mtalk', domain: 'mtalk.google.com', category: 'google', description: 'Google Push Notification Socket (MTALK)', isPopular: true },
  { id: 'gg_alt_mtalk', domain: 'alt1-mtalk.google.com', category: 'google', description: 'Google Push Notification Alternate 1', isPopular: true },
  { id: 'gg_alt2_mtalk', domain: 'alt2-mtalk.google.com', category: 'google', description: 'Google Push Notification Alternate 2' },
  { id: 'gg_alt3_mtalk', domain: 'alt3-mtalk.google.com', category: 'google', description: 'Google Push Notification Alternate 3' },
  { id: 'gg_clients1', domain: 'clients1.google.com', category: 'google', description: 'Google Clients Anycast Hub 1', isPopular: true },
  { id: 'gg_clients3', domain: 'clients3.google.com', category: 'google', description: 'Google Clients Connectivity Node 3', isPopular: true },
  { id: 'gg_dns', domain: 'dns.google', category: 'google', description: 'Google DNS TLS 1.3 Anycast', isPopular: true }
];

// 8. MICROSOFT & Azure Front Door (TLS 1.3)
export const MICROSOFT_SNIS: SniItem[] = [
  { id: 'ms_skype', domain: 'skype.com', category: 'microsoft', description: 'Skype Official Gateway (Clean TLS 1.3)', isPopular: true },
  { id: 'ms_web_skype', domain: 'web.skype.com', category: 'microsoft', description: 'Skype Web App Gateway (TLS 1.3)', isPopular: true },
  { id: 'ms_teams', domain: 'teams.microsoft.com', category: 'microsoft', description: 'Microsoft Teams Realtime Endpoint', isPopular: true },
  { id: 'ms_login_live', domain: 'login.live.com', category: 'microsoft', description: 'Microsoft Live Auth Service (TLS 1.3)', isPopular: true },
  { id: 'ms_login_ms', domain: 'login.microsoftonline.com', category: 'microsoft', description: 'Microsoft 365 Enterprise Auth', isPopular: true },
  { id: 'ms_static_c', domain: 'c.s-microsoft.com', category: 'microsoft', description: 'Microsoft Static Asset CDN', isPopular: true },
  { id: 'ms_azure_edge', domain: 'azureedge.net', category: 'microsoft', description: 'Azure Global CDN Front Door (TLS 1.3)', isPopular: true },
  { id: 'ms_azure_com', domain: 'azure.com', category: 'microsoft', description: 'Microsoft Azure Cloud Portal' },
  { id: 'ms_portal_azure', domain: 'portal.azure.com', category: 'microsoft', description: 'Azure Cloud Management Console', isPopular: true },
  { id: 'ms_outlook_live', domain: 'outlook.live.com', category: 'microsoft', description: 'Microsoft Outlook Live Portal', isPopular: true },
  { id: 'ms_outlook_off', domain: 'outlook.office.com', category: 'microsoft', description: 'Microsoft Office 365 Exchange Gateway' },
  { id: 'ms_bing', domain: 'www.bing.com', category: 'microsoft', description: 'Microsoft Bing Search Edge (TLS 1.3)', isPopular: true },
  { id: 'ms_copilot', domain: 'copilot.microsoft.com', category: 'microsoft', description: 'Microsoft Copilot Global Edge', isPopular: true },
  { id: 'ms_designer', domain: 'designer.microsoft.com', category: 'microsoft', description: 'Microsoft Designer Edge Node', isPopular: true },
  { id: 'ms_onedrive', domain: 'onedrive.live.com', category: 'microsoft', description: 'Microsoft OneDrive Cloud Storage' },
  { id: 'ms_sharepoint', domain: 'sharepoint.com', category: 'microsoft', description: 'Microsoft SharePoint Enterprise Cloud' },
  { id: 'ms_xbox', domain: 'xbox.com', category: 'microsoft', description: 'Microsoft Xbox Live Global Edge' },
  { id: 'ms_assets_store', domain: 'assets.onestore.ms', category: 'microsoft', description: 'Microsoft Store High-Speed Asset Delivery', isPopular: true },
  { id: 'ms_edge_browser', domain: 'edge.microsoft.com', category: 'microsoft', description: 'Microsoft Edge Cloud Services' },
  { id: 'ms_connect_test', domain: 'msftconnecttest.com', category: 'microsoft', description: 'Microsoft Network Connectivity Probe', isPopular: true },
  { id: 'ms_learn', domain: 'learn.microsoft.com', category: 'microsoft', description: 'Microsoft Learn Docs CDN' }
];

// 9. AMAZON AWS & CloudFront (TLS 1.3)
export const AMAZON_SNIS: SniItem[] = [
  { id: 'am_aws', domain: 'aws.amazon.com', category: 'amazon', description: 'Amazon Web Services Portal (TLS 1.3)', isPopular: true },
  { id: 'am_cloudfront', domain: 'cloudfront.net', category: 'amazon', description: 'AWS CloudFront Anycast CDN Node', isPopular: true },
  { id: 'am_d1_static', domain: 'd1.awsstatic.com', category: 'amazon', description: 'Amazon CloudFront Global Edge Node', isPopular: true },
  { id: 'am_s3', domain: 's3.amazonaws.com', category: 'amazon', description: 'Amazon S3 Global Storage Anycast', isPopular: true },
  { id: 'am_media', domain: 'media-amazon.com', category: 'amazon', description: 'Amazon Media Delivery Server', isPopular: true },
  { id: 'am_ssl_images', domain: 'images-na.ssl-images-amazon.com', category: 'amazon', description: 'Amazon SSL High-Speed Image Edge' },
  { id: 'am_primevideo', domain: 'primevideo.com', category: 'amazon', description: 'Amazon Prime Video Streaming Gateway', isPopular: true },
  { id: 'am_twitch', domain: 'twitch.tv', category: 'amazon', description: 'Twitch Live Interactive Video Edge', isPopular: true },
  { id: 'am_twitch_api', domain: 'api.twitch.tv', category: 'amazon', description: 'Twitch API Global Anycast Endpoint' },
  { id: 'am_twitch_cdn', domain: 'static-cdn.jtvnw.net', category: 'amazon', description: 'Twitch High-Bandwidth Static CDN', isPopular: true },
  { id: 'am_imdb', domain: 'imdb.com', category: 'amazon', description: 'IMDb Movie Database AWS Edge' },
  { id: 'am_docker_auth', domain: 'auth.docker.io', category: 'amazon', description: 'Docker Authentication AWS Gateway', isPopular: true },
  { id: 'am_s3_useast', domain: 's3.us-east-1.amazonaws.com', category: 'amazon', description: 'AWS US-East S3 Anycast Cluster' }
];

// 10. APPLE Worldwide CDN & Services (TLS 1.3 / ECH)
export const APPLE_SNIS: SniItem[] = [
  { id: 'ap_com', domain: 'apple.com', category: 'apple', description: 'Apple Official Global Portal (TLS 1.3)', isPopular: true },
  { id: 'ap_icloud', domain: 'icloud.com', category: 'apple', description: 'Apple iCloud Service Edge (TLS 1.3)', isPopular: true },
  { id: 'ap_mzstatic', domain: 'mzstatic.com', category: 'apple', description: 'Apple Media Static CDN (App Store / Music)', isPopular: true },
  { id: 'ap_is1_mz', domain: 'is1-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 1', isPopular: true },
  { id: 'ap_is2_mz', domain: 'is2-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 2' },
  { id: 'ap_is3_mz', domain: 'is3-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 3' },
  { id: 'ap_is4_mz', domain: 'is4-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 4' },
  { id: 'ap_is5_mz', domain: 'is5-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 5' },
  { id: 'ap_dns_net', domain: 'apple-dns.net', category: 'apple', description: 'Apple Global CDN Infrastructure', isPopular: true },
  { id: 'ap_cdn_apple', domain: 'cdn-apple.com', category: 'apple', description: 'Apple Next-Gen Content Delivery (TLS 1.3)' },
  { id: 'ap_dev', domain: 'developer.apple.com', category: 'apple', description: 'Apple Developer Global Portal' },
  { id: 'ap_support', domain: 'support.apple.com', category: 'apple', description: 'Apple Customer Care Edge' },
  { id: 'ap_push', domain: 'push.apple.com', category: 'apple', description: 'Apple APNs Push Notification Hub', isPopular: true },
  { id: 'ap_mask', domain: 'mask.icloud.com', category: 'apple', description: 'Apple Private Relay ECH Node', isPopular: true },
  { id: 'ap_mask_api', domain: 'mask-api.icloud.com', category: 'apple', description: 'Apple Private Relay API Endpoint', isPopular: true }
];

// 11. SPOTIFY, DISCORD & MEDIA STREAMING (TLS 1.3)
export const MEDIA_SPOTIFY_SNIS: SniItem[] = [
  { id: 'sp_api', domain: 'api.spotify.com', category: 'spotify', description: 'Spotify Core API Endpoint (TLS 1.3)', isPopular: true },
  { id: 'sp_client_wg', domain: 'spclient.wg.spotify.com', category: 'spotify', description: 'Spotify Realtime Audio Gateway', isPopular: true },
  { id: 'sp_com', domain: 'spotify.com', category: 'spotify', description: 'Spotify Global Web Portal', isPopular: true },
  { id: 'disc_cdn', domain: 'cdn.discordapp.com', category: 'spotify', description: 'Discord Asset Content Delivery', isPopular: true },
  { id: 'disc_media', domain: 'media.discordapp.net', category: 'spotify', description: 'Discord Media & Voice Stream Gateway', isPopular: true },
  { id: 'disc_app', domain: 'discord.com', category: 'spotify', description: 'Discord Realtime Gateway (TLS 1.3)', isPopular: true },
  { id: 'zm_us', domain: 'zoom.us', category: 'spotify', description: 'Zoom Realtime Meeting Edge (TLS 1.3)', isPopular: true },
  { id: 'zm_gov', domain: 'zoomgov.com', category: 'spotify', description: 'Zoom Enterprise Dedicated Node' },
  { id: 'speedtest_net', domain: 'speedtest.net', category: 'spotify', description: 'Ookla Speedtest Global Hub', isPopular: true },
  { id: 'cisco_com', domain: 'cisco.com', category: 'spotify', description: 'Cisco AnyConnect Hub (TLS 1.3)', isPopular: true },
  { id: 'opendns_tls', domain: 'opendns.com', category: 'spotify', description: 'Cisco OpenDNS TLS 1.3 Resolver', isPopular: true },
  { id: 'webex_com', domain: 'webex.com', category: 'spotify', description: 'Cisco Webex Live Meeting Gateway' },
  { id: 'tg_web', domain: 'web.telegram.org', category: 'spotify', description: 'Telegram Web Anycast Edge (TLS 1.3)', isPopular: true }
];

// 12. TRANCO & TOP WORLDWIDE INTERNET INFRASTRUCTURE (TLS 1.3 Clean)
export const TOP_WORLD_SNIS: SniItem[] = [
  { id: 'infra_oracle', domain: 'oracle.com', category: 'general', description: 'Oracle Global Cloud Edge', isPopular: true },
  { id: 'infra_oracle_cloud', domain: 'cloud.oracle.com', category: 'general', description: 'Oracle Cloud Infrastructure (OCI)' },
  { id: 'infra_ibm', domain: 'ibm.com', category: 'general', description: 'IBM Enterprise Global Gateway' },
  { id: 'infra_ibm_cloud', domain: 'cloud.ibm.com', category: 'general', description: 'IBM Cloud Edge Anycast' },
  { id: 'infra_nvidia', domain: 'nvidia.com', category: 'general', description: 'NVIDIA Global AI & Driver CDN', isPopular: true },
  { id: 'infra_intel', domain: 'intel.com', category: 'general', description: 'Intel Global Architecture Hub' },
  { id: 'infra_qualcomm', domain: 'qualcomm.com', category: 'general', description: 'Qualcomm Snapdragon Edge Node' },
  { id: 'infra_docker', domain: 'docker.com', category: 'general', description: 'Docker Container Engine Gateway', isPopular: true },
  { id: 'infra_hub_docker', domain: 'hub.docker.com', category: 'general', description: 'Docker Hub Image Registry CDN', isPopular: true },
  { id: 'infra_npmjs', domain: 'registry.npmjs.org', category: 'general', description: 'Node Package Manager Global Registry', isPopular: true },
  { id: 'infra_ubuntu', domain: 'ubuntu.com', category: 'general', description: 'Canonical Ubuntu Linux Gateway', isPopular: true },
  { id: 'infra_debian', domain: 'debian.org', category: 'general', description: 'Debian Linux Worldwide Archive' },
  { id: 'infra_arch', domain: 'archlinux.org', category: 'general', description: 'Arch Linux Fast Anycast Mirror' },
  { id: 'infra_mozilla', domain: 'mozilla.org', category: 'general', description: 'Mozilla Foundation TLS 1.3 Edge', isPopular: true },
  { id: 'infra_firefox', domain: 'firefox.com', category: 'general', description: 'Firefox Browser Sync & Telemetry' },
  { id: 'infra_wiki', domain: 'wikipedia.org', category: 'general', description: 'Wikimedia Global CDN Network (TLS 1.3)', isPopular: true },
  { id: 'infra_khan', domain: 'khanacademy.org', category: 'general', description: 'Khan Academy Fast CDN Edge' },
  { id: 'infra_coursera', domain: 'coursera.org', category: 'general', description: 'Coursera Global Education Edge' },
  { id: 'infra_reddit', domain: 'reddit.com', category: 'general', description: 'Reddit Global Community Hub', isPopular: true },
  { id: 'infra_notion', domain: 'notion.so', category: 'general', description: 'Notion Collaborative Cloud Edge', isPopular: true },
  { id: 'infra_figma', domain: 'figma.com', category: 'general', description: 'Figma Cloud Realtime Canvas Edge', isPopular: true },
  { id: 'infra_canva', domain: 'canva.com', category: 'general', description: 'Canva Design Delivery Edge' },
  { id: 'infra_slack', domain: 'slack.com', category: 'general', description: 'Slack Realtime Messaging Socket', isPopular: true },
  { id: 'infra_atlassian', domain: 'atlassian.com', category: 'general', description: 'Atlassian Jira / Confluence Cloud' },
  { id: 'infra_digitalocean', domain: 'digitalocean.com', category: 'general', description: 'DigitalOcean Cloud Gateway', isPopular: true },
  { id: 'infra_linode', domain: 'linode.com', category: 'general', description: 'Akamai Linode Cloud Infrastructure' },
  { id: 'infra_vultr', domain: 'vultr.com', category: 'general', description: 'Vultr High-Performance Cloud Edge' },
  { id: 'infra_hetzner', domain: 'hetzner.com', category: 'general', description: 'Hetzner European Core Datacenters', isPopular: true },
  { id: 'infra_ovh', domain: 'ovhcloud.com', category: 'general', description: 'OVHcloud Worldwide Infrastructure' }
];

/**
 * Combines all worldwide domain pools into a unified master collection
 * Ordered by effectiveness for anti-censorship and TLS 1.3 compliance.
 */
export const COMPLETE_WORLDWIDE_SNI_LIST: SniItem[] = [
  ...ECH_ANTI_FILTER_SNIS,
  ...AI_NEXTGEN_SNIS,
  ...YAHOO_SNIS,
  ...CLOUDFLARE_SNIS,
  ...AKAMAI_SNIS,
  ...FASTLY_SNIS,
  ...GOOGLE_SNIS,
  ...MICROSOFT_SNIS,
  ...AMAZON_SNIS,
  ...APPLE_SNIS,
  ...MEDIA_SPOTIFY_SNIS,
  ...TOP_WORLD_SNIS
];
