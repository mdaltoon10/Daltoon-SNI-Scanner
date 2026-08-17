import { SniItem } from '../types';

/**
 * Massive Worldwide TLS 1.3 & ECH SNI Datasets
 * Categorized by Major Global CDN, Cloud Providers, Internet Exchanges & Edge Networks.
 */

// 1. YAHOO! Worldwide Network (Clean TLS 1.3 / ECH Anycast)
export const YAHOO_SNIS: SniItem[] = [
  { id: 'y_com', domain: 'www.yahoo.com', category: 'yahoo', description: 'Yahoo Global Portal (TLS 1.3)', isPopular: true },
  { id: 'y_search', domain: 'search.yahoo.com', category: 'yahoo', description: 'Yahoo Search Engine Gateway', isPopular: true },
  { id: 'y_finance', domain: 'finance.yahoo.com', category: 'yahoo', description: 'Yahoo Finance Realtime Feed', isPopular: true },
  { id: 'y_mail', domain: 'mail.yahoo.com', category: 'yahoo', description: 'Yahoo Mail Edge Server', isPopular: true },
  { id: 'y_news', domain: 'news.yahoo.com', category: 'yahoo', description: 'Yahoo News Global CDN', isPopular: true },
  { id: 'y_sports', domain: 'sports.yahoo.com', category: 'yahoo', description: 'Yahoo Sports Live Stream Edge' },
  { id: 'y_s_yimg', domain: 's.yimg.com', category: 'yahoo', description: 'Yahoo Static Asset CDN (Akamai/Edgecast)', isPopular: true },
  { id: 'y_s1_yimg', domain: 's1.yimg.com', category: 'yahoo', description: 'Yahoo High-Speed Asset Server', isPopular: true },
  { id: 'y_yimg', domain: 'yimg.com', category: 'yahoo', description: 'Yahoo Media Delivery Network' },
  { id: 'y_dev', domain: 'developer.yahoo.com', category: 'yahoo', description: 'Yahoo Developer Gateway' },
  { id: 'y_login', domain: 'login.yahoo.com', category: 'yahoo', description: 'Yahoo Auth & Token Edge', isPopular: true },
  { id: 'y_geo', domain: 'geo.yahoo.com', category: 'yahoo', description: 'Yahoo Anycast Geo Routing', isPopular: true },
  { id: 'y_ca', domain: 'ca.yahoo.com', category: 'yahoo', description: 'Yahoo Canada Edge Node' },
  { id: 'y_uk', domain: 'uk.yahoo.com', category: 'yahoo', description: 'Yahoo UK European Hub', isPopular: true },
  { id: 'y_de', domain: 'de.yahoo.com', category: 'yahoo', description: 'Yahoo Germany Gateway' },
  { id: 'y_fr', domain: 'fr.yahoo.com', category: 'yahoo', description: 'Yahoo France Edge' },
  { id: 'y_jp', domain: 'jp.yahoo.com', category: 'yahoo', description: 'Yahoo Japan Asian Cluster', isPopular: true },
  { id: 'y_hk', domain: 'hk.yahoo.com', category: 'yahoo', description: 'Yahoo Hong Kong Gateway' },
  { id: 'y_sg', domain: 'sg.yahoo.com', category: 'yahoo', description: 'Yahoo Singapore Fast Node', isPopular: true },
  { id: 'y_in', domain: 'in.yahoo.com', category: 'yahoo', description: 'Yahoo India Regional Server' },
  { id: 'y_tw', domain: 'tw.yahoo.com', category: 'yahoo', description: 'Yahoo Taiwan Edge Node' },
  { id: 'y_au', domain: 'au.yahoo.com', category: 'yahoo', description: 'Yahoo Australia Hub' },
  { id: 'y_br', domain: 'br.yahoo.com', category: 'yahoo', description: 'Yahoo Brazil Gateway' },
  { id: 'y_es', domain: 'es.yahoo.com', category: 'yahoo', description: 'Yahoo Spain Gateway' },
  { id: 'y_it', domain: 'it.yahoo.com', category: 'yahoo', description: 'Yahoo Italy Edge Node' },
  { id: 'y_nl', domain: 'nl.yahoo.com', category: 'yahoo', description: 'Yahoo Netherlands Hub' },
  { id: 'y_se', domain: 'se.yahoo.com', category: 'yahoo', description: 'Yahoo Sweden Edge Node' },
  { id: 'y_ch', domain: 'ch.yahoo.com', category: 'yahoo', description: 'Yahoo Switzerland Gateway' },
  { id: 'y_tr', domain: 'tr.yahoo.com', category: 'yahoo', description: 'Yahoo Turkey Edge Cluster' },
  { id: 'y_ae', domain: 'ae.yahoo.com', category: 'yahoo', description: 'Yahoo Middle East / UAE Hub', isPopular: true }
];

// 2. CLOUDFLARE Global Anycast & Edge (TLS 1.3 / ECH / HTTP3)
export const CLOUDFLARE_SNIS: SniItem[] = [
  { id: 'cf_speed', domain: 'speed.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Speedtest Benchmark', isPopular: true },
  { id: 'cf_cdnjs', domain: 'cdnjs.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Public CDN Libraries', isPopular: true },
  { id: 'cf_dash', domain: 'dash.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Console Gateway' },
  { id: 'cf_dev', domain: 'developers.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Docs CDN' },
  { id: 'cf_workers', domain: 'workers.dev', category: 'cloudflare', description: 'Cloudflare Serverless Domain', isPopular: true },
  { id: 'cf_pages', domain: 'pages.dev', category: 'cloudflare', description: 'Cloudflare Pages CDN', isPopular: true },
  { id: 'cf_stream', domain: 'cloudflarestream.com', category: 'cloudflare', description: 'Cloudflare Video Delivery' },
  { id: 'cf_radar', domain: 'radar.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Radar Analytics' },
  { id: 'cf_blog', domain: 'blog.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Official Blog' },
  { id: 'cf_one', domain: 'one.one.one.one', category: 'cloudflare', description: 'Cloudflare Ultra-fast DNS TLS 1.3', isPopular: true },
  { id: 'cf_warp', domain: 'warp.plus', category: 'cloudflare', description: 'Cloudflare Warp Edge CDN', isPopular: true },
  { id: 'cf_api', domain: 'api.cloudflare.com', category: 'cloudflare', description: 'Cloudflare API Gateway' },
  { id: 'cf_client', domain: 'cloudflareclient.com', category: 'cloudflare', description: 'Cloudflare Zero Trust Client' },
  { id: 'cf_insights', domain: 'static.cloudflareinsights.com', category: 'cloudflare', description: 'Cloudflare Insights Static' },
  { id: 'cf_ipfs', domain: 'cloudflare-ipfs.com', category: 'cloudflare', description: 'Cloudflare IPFS Gateway' },
  { id: 'cf_challenges', domain: 'challenges.cloudflare.com', category: 'cloudflare', description: 'Cloudflare Turnstile Edge' },
  { id: 'cf_dns', domain: 'cloudflare-dns.com', category: 'cloudflare', description: 'Cloudflare DoH / DoT Anycast', isPopular: true },
  { id: 'cf_cache', domain: 'cf-cache.com', category: 'cloudflare', description: 'Cloudflare Global Edge Cache' },
  { id: 'cf_net', domain: 'cf.cdn.cloudflare.net', category: 'cloudflare', description: 'Cloudflare Tier-1 Network Core' },
  { id: 'cf_tv', domain: 'cloudflare.tv', category: 'cloudflare', description: 'Cloudflare Live Broadcast Network' }
];

// 3. AKAMAI Distributed CDN & Enterprise Nodes (TLS 1.3)
export const AKAMAI_SNIS: SniItem[] = [
  { id: 'ak_spotify', domain: 'audio-ak-spotify-com.akamaized.net', category: 'akamai', description: 'Akamai Spotify High-Bitrate CDN', isPopular: true },
  { id: 'ak_yahoo_bridge', domain: 's.yimg.com.edgekey.net', category: 'akamai', description: 'Akamai EdgeKey Yahoo Bridge', isPopular: true },
  { id: 'ak_base', domain: 'akamaized.net', category: 'akamai', description: 'Akamai Distributed Edge Anycast', isPopular: true },
  { id: 'ak_hd', domain: 'akamaihd.net', category: 'akamai', description: 'Akamai HD Streaming & Video Cluster', isPopular: true },
  { id: 'ak_suite', domain: 'edgesuite.net', category: 'akamai', description: 'Akamai EdgeSuite Gateway' },
  { id: 'ak_key', domain: 'edgekey.net', category: 'akamai', description: 'Akamai Global EdgeKey Portal' },
  { id: 'ak_apple', domain: 'apple.com.edgekey.net', category: 'akamai', description: 'Akamai Apple Asset Delivery Node', isPopular: true },
  { id: 'ak_steam', domain: 'media.steampowered.com.akamaized.net', category: 'akamai', description: 'Steam Akamai Game Content CDN', isPopular: true },
  { id: 'ak_ps', domain: 'playstation.com.edgekey.net', category: 'akamai', description: 'PlayStation Network Akamai Node' },
  { id: 'ak_hulu', domain: 'hulu.com.edgekey.net', category: 'akamai', description: 'Hulu Akamai Streaming CDN' },
  { id: 'ak_adobe', domain: 'adobe.com.edgekey.net', category: 'akamai', description: 'Adobe Cloud EdgeKey Network' },
  { id: 'ak_bmw', domain: 'bmw.com.edgekey.net', category: 'akamai', description: 'BMW Global Akamai CDN' },
  { id: 'ak_target', domain: 'target.com.edgekey.net', category: 'akamai', description: 'Target Akamai Anycast Edge' },
  { id: 'ak_walmart', domain: 'walmart.com.edgekey.net', category: 'akamai', description: 'Walmart E-Commerce Akamai Edge' },
  { id: 'ak_sony', domain: 'sony.com.edgekey.net', category: 'akamai', description: 'Sony Global Content EdgeKey' },
  { id: 'ak_dell', domain: 'dell.com.edgekey.net', category: 'akamai', description: 'Dell Akamai Asset Delivery Node' },
  { id: 'ak_com', domain: 'www.akamai.com', category: 'akamai', description: 'Akamai Official Global Portal' }
];

// 4. FASTLY Edge Cloud & GitHub CDN (TLS 1.3)
export const FASTLY_SNIS: SniItem[] = [
  { id: 'fa_gh_assets', domain: 'github.githubassets.com', category: 'fastly', description: 'GitHub Fastly Asset Node', isPopular: true },
  { id: 'fa_gh_raw', domain: 'raw.githubusercontent.com', category: 'fastly', description: 'GitHub Raw Storage Fastly', isPopular: true },
  { id: 'fa_gh_avatars', domain: 'avatars.githubusercontent.com', category: 'fastly', description: 'GitHub Avatar CDN Fastly', isPopular: true },
  { id: 'fa_gh_api', domain: 'api.github.com', category: 'fastly', description: 'GitHub REST API Gateway Fastly', isPopular: true },
  { id: 'fa_reddit', domain: 'reddit.map.fastly.net', category: 'fastly', description: 'Fastly Reddit Global Anycast Map', isPopular: true },
  { id: 'fa_spotify', domain: 'spotify.map.fastly.net', category: 'fastly', description: 'Fastly Spotify Audio Stream Map', isPopular: true },
  { id: 'fa_nytimes', domain: 'nytimes.map.fastly.net', category: 'fastly', description: 'Fastly NYTimes Edge Node' },
  { id: 'fa_pinterest', domain: 'pinterest.map.fastly.net', category: 'fastly', description: 'Fastly Pinterest Image CDN' },
  { id: 'fa_vimeo', domain: 'vimeo.map.fastly.net', category: 'fastly', description: 'Fastly Vimeo Video Delivery' },
  { id: 'fa_guardian', domain: 'guardian.map.fastly.net', category: 'fastly', description: 'Fastly Guardian Global Map' },
  { id: 'fa_yelp', domain: 'yelp.map.fastly.net', category: 'fastly', description: 'Fastly Yelp Edge Network' },
  { id: 'fa_shutter', domain: 'shutterstock.map.fastly.net', category: 'fastly', description: 'Fastly Shutterstock Media CDN' },
  { id: 'fa_buzzfeed', domain: 'buzzfeed.map.fastly.net', category: 'fastly', description: 'Fastly BuzzFeed Edge Cluster' },
  { id: 'fa_dualstack', domain: 'dualstack.fastly.net', category: 'fastly', description: 'Fastly Dualstack IPv4/IPv6 Edge', isPopular: true },
  { id: 'fa_global_prod', domain: 'global.prod.fastly.net', category: 'fastly', description: 'Fastly Global Production Cluster' }
];

// 5. GOOGLE Global Cache & Cloud Edge (TLS 1.3 / QUIC)
export const GOOGLE_SNIS: SniItem[] = [
  { id: 'gg_fonts_static', domain: 'fonts.gstatic.com', category: 'google', description: 'Google Fonts High-Speed CDN', isPopular: true },
  { id: 'gg_fonts_api', domain: 'fonts.googleapis.com', category: 'google', description: 'Google API Fonts Gateway', isPopular: true },
  { id: 'gg_images', domain: 'images.google.com', category: 'google', description: 'Google Images CDN Edge', isPopular: true },
  { id: 'gg_ajax', domain: 'ajax.googleapis.com', category: 'google', description: 'Google Hosted Libraries CDN', isPopular: true },
  { id: 'gg_lh3', domain: 'lh3.googleusercontent.com', category: 'google', description: 'Google User Content Node LH3', isPopular: true },
  { id: 'gg_lh4', domain: 'lh4.googleusercontent.com', category: 'google', description: 'Google User Content Node LH4' },
  { id: 'gg_lh5', domain: 'lh5.googleusercontent.com', category: 'google', description: 'Google User Content Node LH5' },
  { id: 'gg_cloud', domain: 'cloud.google.com', category: 'google', description: 'Google Cloud Platform Portal' },
  { id: 'gg_storage', domain: 'storage.googleapis.com', category: 'google', description: 'Google Cloud Storage Edge Node', isPopular: true },
  { id: 'gg_maps_api', domain: 'maps.googleapis.com', category: 'google', description: 'Google Maps API Endpoint' },
  { id: 'gg_translate', domain: 'translate.googleapis.com', category: 'google', description: 'Google Translate Realtime Edge' },
  { id: 'gg_play', domain: 'play.google.com', category: 'google', description: 'Google Play Store Global Gateway' },
  { id: 'gg_dl', domain: 'dl.google.com', category: 'google', description: 'Google Download & Chrome Update Edge' },
  { id: 'gg_firebase', domain: 'firestore.googleapis.com', category: 'google', description: 'Google Firestore Realtime Endpoint', isPopular: true },
  { id: 'gg_mtalk', domain: 'mtalk.google.com', category: 'google', description: 'Google Push Notification Socket (MTALK)', isPopular: true },
  { id: 'gg_alt_mtalk', domain: 'alt1-mtalk.google.com', category: 'google', description: 'Google Push Notification Alternate' }
];

// 6. MICROSOFT & Azure Front Door (TLS 1.3)
export const MICROSOFT_SNIS: SniItem[] = [
  { id: 'ms_skype', domain: 'skype.com', category: 'microsoft', description: 'Skype Official Gateway (TLS 1.3)', isPopular: true },
  { id: 'ms_web_skype', domain: 'web.skype.com', category: 'microsoft', description: 'Skype Web App Gateway', isPopular: true },
  { id: 'ms_teams', domain: 'teams.microsoft.com', category: 'microsoft', description: 'Microsoft Teams Realtime Endpoint', isPopular: true },
  { id: 'ms_login_live', domain: 'login.live.com', category: 'microsoft', description: 'Microsoft Live Auth Service', isPopular: true },
  { id: 'ms_login_ms', domain: 'login.microsoftonline.com', category: 'microsoft', description: 'Microsoft 365 Enterprise Auth', isPopular: true },
  { id: 'ms_static_c', domain: 'c.s-microsoft.com', category: 'microsoft', description: 'Microsoft Static Asset CDN', isPopular: true },
  { id: 'ms_azure_edge', domain: 'azureedge.net', category: 'microsoft', description: 'Azure Global CDN Front Door', isPopular: true },
  { id: 'ms_azure_com', domain: 'azure.com', category: 'microsoft', description: 'Microsoft Azure Cloud Portal' },
  { id: 'ms_databricks', domain: 'azuredatabricks.net', category: 'microsoft', description: 'Azure Cloud Databricks Node' },
  { id: 'ms_outlook_live', domain: 'outlook.live.com', category: 'microsoft', description: 'Microsoft Outlook Live Portal', isPopular: true },
  { id: 'ms_outlook_off', domain: 'outlook.office.com', category: 'microsoft', description: 'Microsoft Office 365 Exchange Gateway' },
  { id: 'ms_bing', domain: 'www.bing.com', category: 'microsoft', description: 'Microsoft Bing Search Edge', isPopular: true },
  { id: 'ms_onedrive', domain: 'onedrive.live.com', category: 'microsoft', description: 'Microsoft OneDrive Cloud Storage' },
  { id: 'ms_sharepoint', domain: 'sharepoint.com', category: 'microsoft', description: 'Microsoft SharePoint Enterprise Cloud' },
  { id: 'ms_xbox', domain: 'xbox.com', category: 'microsoft', description: 'Microsoft Xbox Live Global Edge' },
  { id: 'ms_assets_store', domain: 'assets.onestore.ms', category: 'microsoft', description: 'Microsoft Store High-Speed Asset Delivery' }
];

// 7. AMAZON AWS & CloudFront (TLS 1.3)
export const AMAZON_SNIS: SniItem[] = [
  { id: 'am_aws', domain: 'aws.amazon.com', category: 'amazon', description: 'Amazon Web Services Portal', isPopular: true },
  { id: 'am_cloudfront', domain: 'cloudfront.net', category: 'amazon', description: 'AWS CloudFront Anycast CDN Node', isPopular: true },
  { id: 'am_d1_static', domain: 'd1.awsstatic.com', category: 'amazon', description: 'Amazon CloudFront Global Edge Node', isPopular: true },
  { id: 'am_s3', domain: 's3.amazonaws.com', category: 'amazon', description: 'Amazon S3 Global Storage Anycast', isPopular: true },
  { id: 'am_media', domain: 'media-amazon.com', category: 'amazon', description: 'Amazon Media Delivery Server', isPopular: true },
  { id: 'am_ssl_images', domain: 'images-na.ssl-images-amazon.com', category: 'amazon', description: 'Amazon SSL High-Speed Image Edge' },
  { id: 'am_primevideo', domain: 'primevideo.com', category: 'amazon', description: 'Amazon Prime Video Streaming Gateway', isPopular: true },
  { id: 'am_twitch', domain: 'twitch.tv', category: 'amazon', description: 'Twitch Live Interactive Video Edge', isPopular: true },
  { id: 'am_twitch_cdn', domain: 'static-cdn.jtvnw.net', category: 'amazon', description: 'Twitch High-Bandwidth Static CDN' },
  { id: 'am_imdb', domain: 'imdb.com', category: 'amazon', description: 'IMDb Movie Database AWS Edge' }
];

// 8. APPLE Worldwide CDN & Services (TLS 1.3)
export const APPLE_SNIS: SniItem[] = [
  { id: 'ap_com', domain: 'apple.com', category: 'apple', description: 'Apple Official Global Portal', isPopular: true },
  { id: 'ap_icloud', domain: 'icloud.com', category: 'apple', description: 'Apple iCloud Service Edge', isPopular: true },
  { id: 'ap_mzstatic', domain: 'mzstatic.com', category: 'apple', description: 'Apple Media Static CDN (App Store / Music)', isPopular: true },
  { id: 'ap_is1_mz', domain: 'is1-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 1', isPopular: true },
  { id: 'ap_is2_mz', domain: 'is2-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 2' },
  { id: 'ap_is3_mz', domain: 'is3-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 3' },
  { id: 'ap_is4_mz', domain: 'is4-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 4' },
  { id: 'ap_is5_mz', domain: 'is5-ssl.mzstatic.com', category: 'apple', description: 'Apple Media Asset Cluster 5' },
  { id: 'ap_dns_net', domain: 'apple-dns.net', category: 'apple', description: 'Apple Global CDN Infrastructure', isPopular: true },
  { id: 'ap_cdn_apple', domain: 'cdn-apple.com', category: 'apple', description: 'Apple Next-Gen Content Delivery' },
  { id: 'ap_dev', domain: 'developer.apple.com', category: 'apple', description: 'Apple Developer Global Portal' },
  { id: 'ap_support', domain: 'support.apple.com', category: 'apple', description: 'Apple Customer Care Edge' },
  { id: 'ap_push', domain: 'push.apple.com', category: 'apple', description: 'Apple APNs Push Notification Hub', isPopular: true }
];

// 9. SPOTIFY, DISCORD & MEDIA STREAMING (TLS 1.3)
export const MEDIA_SPOTIFY_SNIS: SniItem[] = [
  { id: 'sp_api', domain: 'api.spotify.com', category: 'spotify', description: 'Spotify Core API Endpoint', isPopular: true },
  { id: 'sp_client_wg', domain: 'spclient.wg.spotify.com', category: 'spotify', description: 'Spotify Realtime Audio Gateway', isPopular: true },
  { id: 'sp_com', domain: 'spotify.com', category: 'spotify', description: 'Spotify Global Web Portal', isPopular: true },
  { id: 'disc_cdn', domain: 'cdn.discordapp.com', category: 'spotify', description: 'Discord Asset Content Delivery (Cloudflare/Fastly)', isPopular: true },
  { id: 'disc_media', domain: 'media.discordapp.net', category: 'spotify', description: 'Discord Media & Voice Stream Gateway', isPopular: true },
  { id: 'disc_app', domain: 'discord.com', category: 'spotify', description: 'Discord Realtime Gateway', isPopular: true },
  { id: 'zm_us', domain: 'zoom.us', category: 'general', description: 'Zoom Realtime Meeting Edge', isPopular: true },
  { id: 'zm_gov', domain: 'zoomgov.com', category: 'general', description: 'Zoom Enterprise Dedicated Node' },
  { id: 'speedtest_net', domain: 'speedtest.net', category: 'general', description: 'Ookla Speedtest Global Hub', isPopular: true },
  { id: 'cisco_com', domain: 'cisco.com', category: 'general', description: 'Cisco AnyConnect Hub', isPopular: true },
  { id: 'opendns_tls', domain: 'opendns.com', category: 'general', description: 'Cisco OpenDNS TLS 1.3 Resolver', isPopular: true },
  { id: 'webex_com', domain: 'webex.com', category: 'general', description: 'Cisco Webex Live Meeting Gateway' }
];

// 10. TRANCO & TOP WORLDWIDE INTERNET INFRASTRUCTURE (TLS 1.3 Clean)
export const TOP_WORLD_SNIS: SniItem[] = [
  { id: 'infra_oracle', domain: 'oracle.com', category: 'general', description: 'Oracle Global Cloud Edge', isPopular: true },
  { id: 'infra_oracle_cloud', domain: 'cloud.oracle.com', category: 'general', description: 'Oracle Cloud Infrastructure (OCI)' },
  { id: 'infra_ibm', domain: 'ibm.com', category: 'general', description: 'IBM Enterprise Global Gateway' },
  { id: 'infra_ibm_cloud', domain: 'cloud.ibm.com', category: 'general', description: 'IBM Cloud Edge Anycast' },
  { id: 'infra_nvidia', domain: 'nvidia.com', category: 'general', description: 'NVIDIA Global AI & Driver CDN', isPopular: true },
  { id: 'infra_intel', domain: 'intel.com', category: 'general', description: 'Intel Global Architecture Hub' },
  { id: 'infra_qualcomm', domain: 'qualcomm.com', category: 'general', description: 'Qualcomm Snapdragon Edge Node' },
  { id: 'infra_docker', domain: 'docker.com', category: 'dev_github', description: 'Docker Container Engine Gateway', isPopular: true },
  { id: 'infra_hub_docker', domain: 'hub.docker.com', category: 'dev_github', description: 'Docker Hub Image Registry CDN', isPopular: true },
  { id: 'infra_npmjs', domain: 'registry.npmjs.org', category: 'dev_github', description: 'Node Package Manager Global Registry', isPopular: true },
  { id: 'infra_ubuntu', domain: 'ubuntu.com', category: 'general', description: 'Canonical Ubuntu Linux Gateway' },
  { id: 'infra_debian', domain: 'debian.org', category: 'general', description: 'Debian Linux Worldwide Archive' },
  { id: 'infra_arch', domain: 'archlinux.org', category: 'general', description: 'Arch Linux Fast Anycast Mirror' },
  { id: 'infra_mozilla', domain: 'mozilla.org', category: 'general', description: 'Mozilla Foundation TLS 1.3 Edge', isPopular: true },
  { id: 'infra_firefox', domain: 'firefox.com', category: 'general', description: 'Firefox Browser Sync & Telemetry' },
  { id: 'infra_wiki', domain: 'wikipedia.org', category: 'general', description: 'Wikimedia Global CDN Network', isPopular: true },
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
 */
export const COMPLETE_WORLDWIDE_SNI_LIST: SniItem[] = [
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
