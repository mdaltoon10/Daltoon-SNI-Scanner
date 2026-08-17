export interface ClientCarrierInfo {
  ip: string;
  isp: string;
  org: string;
  as: string;
  asname?: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  matchedProfileId: string;
  matchedProfileName: string;
  matchedProfileNameFa: string;
  isIran: boolean;
  cellularOrMobile: boolean;
  detectedAt: string;
  source: string;
}

// Known ASNs and Keywords for Iran & Global ISPs
export const CARRIER_SIGNATURES: {
  id: string;
  name: string;
  nameFa: string;
  asns: string[];
  keywords: string[];
  color: string;
  defaultMtu: number;
  recommendedFrag: string;
  preferredCategories: string[];
}[] = [
  {
    id: 'irancell',
    name: 'MTN Irancell',
    nameFa: 'ایرانسل (MTN)',
    asns: ['AS44244', 'AS51074', 'AS202447', 'AS208005', 'AS43754'],
    keywords: [
      'irancell',
      'mtn',
      'iran cell',
      'mtnirancell',
      'mtn irancell',
      'mtn-irancell',
      'mtn-ir',
      'irancell telecommunications',
      'mtn irancell telecommunications'
    ],
    color: '#eab308',
    defaultMtu: 1420,
    recommendedFrag: '2-5, 8-15ms (SNI Split)',
    preferredCategories: ['yahoo', 'cloudflare', 'fastly', 'amazon_fastly']
  },
  {
    id: 'mci',
    name: 'MCI / Hamrah-e Aval',
    nameFa: 'همراه اول (MCI)',
    asns: ['AS197207', 'AS208331', 'AS208004'],
    keywords: [
      'mobile telecommunication company of iran',
      'mci',
      'hamrah',
      'tikang',
      'mcci',
      'hamrahe aval',
      'hamrah-e aval',
      'ir-mci',
      'irmci',
      'mci.ir',
      'hamraheaval',
      'mobile telecommunication'
    ],
    color: '#06b6d4',
    defaultMtu: 1450,
    recommendedFrag: '1-3, 5-10ms (TLS Hello)',
    preferredCategories: ['yahoo', 'cloudflare', 'spotify', 'akamai']
  },
  {
    id: 'rightel',
    name: 'Rightel',
    nameFa: 'رایتل (Rightel)',
    asns: ['AS57218', 'AS205213'],
    keywords: ['rightel', 'tamin telecom', 'rightel communication'],
    color: '#a855f7',
    defaultMtu: 1450,
    recommendedFrag: '1-4, 5-12ms',
    preferredCategories: ['yahoo', 'microsoft', 'spotify', 'dev_github']
  },
  {
    id: 'shatel',
    name: 'Shatel ADSL / VDSL / Mobile',
    nameFa: 'شاتل (Shatel)',
    asns: ['AS31549', 'AS205647', 'AS201314'],
    keywords: ['shatel', 'arya rasaneh', 'shatel mobile', 'shatelmobile'],
    color: '#3b82f6',
    defaultMtu: 1492,
    recommendedFrag: '1-2, 3-8ms',
    preferredCategories: ['yahoo', 'cloudflare', 'microsoft', 'general']
  },
  {
    id: 'mokhaberat',
    name: 'TCI / Mokhaberat Iran',
    nameFa: 'مخابرات ایران (TCI)',
    asns: ['AS58224', 'AS12880', 'AS48159', 'AS49666', 'AS25184', 'AS207521'],
    keywords: ['mokhaberat', 'tci', 'telecommunication company of iran', 'tic', 'dci', 'khuzestan telecommunication'],
    color: '#10b981',
    defaultMtu: 1480,
    recommendedFrag: '2-4, 10-20ms',
    preferredCategories: ['yahoo', 'amazon_fastly', 'microsoft', 'akamai']
  },
  {
    id: 'zitel',
    name: 'Zitel TD-LTE',
    nameFa: 'زایتل (Zitel)',
    asns: ['AS198083'],
    keywords: ['zitel', 'farabord', 'farabord dadeh'],
    color: '#f97316',
    defaultMtu: 1450,
    recommendedFrag: '1-3, 4-10ms',
    preferredCategories: ['yahoo', 'cloudflare', 'spotify']
  },
  {
    id: 'asiatech',
    name: 'Asiatech',
    nameFa: 'آسیاتک (Asiatech)',
    asns: ['AS16322'],
    keywords: ['asiatech', 'asia tech', 'asiatech data transmission'],
    color: '#ec4899',
    defaultMtu: 1492,
    recommendedFrag: '1-3, 5-12ms',
    preferredCategories: ['yahoo', 'cloudflare', 'microsoft']
  },
  {
    id: 'hiweb',
    name: 'HiWEB / Pars Online',
    nameFa: 'های‌وب / پارس‌آنلاین (HiWEB)',
    asns: ['AS42337'],
    keywords: ['hiweb', 'parsonline', 'pars online', 'dadeh gostar'],
    color: '#0284c7',
    defaultMtu: 1492,
    recommendedFrag: '1-2, 5-10ms',
    preferredCategories: ['yahoo', 'spotify', 'amazon_fastly']
  },
  {
    id: 'mobinnet',
    name: 'Mobinnet Telecom',
    nameFa: 'مبین‌نت (Mobinnet)',
    asns: ['AS50810', 'AS206061'],
    keywords: ['mobinnet', 'mobin net', 'gostarish e ertebatat mobinnet'],
    color: '#84cc16',
    defaultMtu: 1450,
    recommendedFrag: '2-4, 8-15ms',
    preferredCategories: ['yahoo', 'cloudflare', 'fastly']
  }
];

export function matchIranianCarrierByIp(ip: string): { id: string; name: string; nameFa: string; asn: string } | null {
  if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) return null;

  const parts = ip.split('.').map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  const [a, b] = parts;

  // 1. Irancell Range Check (MTN Irancell 4G/5G/TD-LTE)
  if (
    (a === 5 && b >= 160 && b <= 223) ||
    (a === 31 && (b === 171 || (b >= 56 && b <= 59) || (b >= 168 && b <= 175))) ||
    (a === 37 && (b === 110 || b === 111 || b === 202 || b === 203)) ||
    (a === 85 && (b === 133 || b === 185 || b === 155)) ||
    (a === 188 && (b === 210 || b === 211)) ||
    (a === 151 && b >= 232 && b <= 247) ||
    (a === 109 && b === 122) ||
    (a === 94 && b === 101) ||
    (a === 178 && b === 131)
  ) {
    return { id: 'irancell', name: 'MTN Irancell', nameFa: 'ایرانسل (MTN)', asn: 'AS44244' };
  }

  // 2. MCI Range Check (Hamrah-e Aval)
  if (
    (a === 2 && ((b >= 144 && b <= 151) || (b >= 176 && b <= 179))) ||
    (a === 5 && b >= 112 && b <= 127) ||
    (a === 37 && b >= 156 && b <= 159) ||
    (a === 80 && b === 191) ||
    (a === 176 && b === 101) ||
    (a === 188 && (b === 158 || b === 159 || b === 245)) ||
    (a === 31 && (b === 2 || b === 3 || b === 7)) ||
    (a === 46 && (b === 224 || b === 225)) ||
    (a === 91 && b === 243)
  ) {
    return { id: 'mci', name: 'MCI / Hamrah-e Aval', nameFa: 'همراه اول (MCI)', asn: 'AS197207' };
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
    return { id: 'shatel', name: 'Shatel', nameFa: 'شاتل (Shatel)', asn: 'AS31549' };
  }

  // 5. Mokhaberat Check
  if (
    (a === 78 && (b === 38 || b === 39)) ||
    (a === 91 && (b === 98 || b === 99)) ||
    (a === 2 && b >= 184 && b <= 191)
  ) {
    return { id: 'mokhaberat', name: 'TCI / Mokhaberat Iran', nameFa: 'مخابرات ایران (TCI)', asn: 'AS58224' };
  }

  return null;
}

export async function detectClientOperator(preferredProfileId?: string): Promise<ClientCarrierInfo> {
  const timestamp = Date.now();
  // Query direct public endpoints first from client browser, then server fallback
  const apis = [
    `https://api.ipify.org?format=json&t=${timestamp}`,
    `https://api.ipquery.io/?format=json&t=${timestamp}`,
    `https://ipwho.is/?t=${timestamp}`,
    `https://ipapi.co/json/?t=${timestamp}`,
    `/api/carrier/detect?t=${timestamp}`,
    `https://ipinfo.io/json?t=${timestamp}`
  ];

  let rawData: any = null;
  let sourceUsed = '';

  for (const url of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        // Unwrap if server API wrapper used
        const data = json.data || json;
        if (data && (data.ip || data.query || data.ip_address || data.isp)) {
          rawData = data;
          sourceUsed = url;
          break;
        }
      }
    } catch {
      // try next provider
    }
  }

  // Fallback if all lookups fail
  if (!rawData) {
    const mciDefault = CARRIER_SIGNATURES[0]; // MCI default
    return {
      ip: '127.0.0.1',
      isp: 'Auto Detected Network',
      org: 'Cellular Operator',
      as: 'AS44244',
      asname: 'MCI-AS',
      city: 'Tehran',
      region: 'Tehran',
      country: 'Iran',
      countryCode: 'IR',
      matchedProfileId: mciDefault.id,
      matchedProfileName: mciDefault.name,
      matchedProfileNameFa: mciDefault.nameFa,
      isIran: true,
      cellularOrMobile: true,
      detectedAt: new Date().toISOString(),
      source: 'Default Fallback'
    };
  }

  // Normalize fields across ipquery, ipapi, ipwhois, ipinfo, server API
  const ip = typeof rawData.ip === 'string' ? rawData.ip : (rawData.query || rawData.ip_address || 'Unknown IP').toString();

  let org = '';
  if (typeof rawData.org === 'string') {
    org = rawData.org;
  } else if (rawData.isp && typeof rawData.isp === 'object' && typeof rawData.isp.org === 'string') {
    org = rawData.isp.org;
  } else if (rawData.connection && typeof rawData.connection.org === 'string') {
    org = rawData.connection.org;
  }

  let isp = '';
  if (typeof rawData.isp === 'string') {
    isp = rawData.isp;
  } else if (rawData.isp && typeof rawData.isp === 'object' && typeof rawData.isp.isp === 'string') {
    isp = rawData.isp.isp;
  } else if (rawData.connection && typeof rawData.connection.isp === 'string') {
    isp = rawData.connection.isp;
  }

  let asn = '';
  if (typeof rawData.as === 'string') {
    asn = rawData.as;
  } else if (typeof rawData.asn === 'string' || typeof rawData.asn === 'number') {
    asn = rawData.asn.toString();
  } else if (rawData.isp && typeof rawData.isp === 'object' && rawData.isp.asn) {
    asn = rawData.isp.asn.toString();
  } else if (rawData.connection && rawData.connection.asn) {
    asn = rawData.connection.asn.toString();
  }

  let asname = '';
  if (typeof rawData.asname === 'string') {
    asname = rawData.asname;
  } else if (rawData.connection && typeof rawData.connection.as_name === 'string') {
    asname = rawData.connection.as_name;
  }

  const city = typeof rawData.city === 'string' ? rawData.city : (rawData.location?.city || '').toString();
  const region = typeof rawData.region === 'string' ? rawData.region : (rawData.region_name || rawData.location?.region || '').toString();

  const rawCC = rawData.country_code || rawData.countryCode || rawData.country_code2 || rawData.location?.country_code || (typeof rawData.country === 'string' && rawData.country.length === 2 ? rawData.country : '');
  const countryCode = (typeof rawCC === 'string' && rawCC) ? rawCC.toUpperCase() : '';

  const rawCountry = rawData.country_name || rawData.location?.country || (typeof rawData.country === 'string' && rawData.country.length > 2 ? rawData.country : '');
  const country = (typeof rawCountry === 'string' && rawCountry)
    ? rawCountry
    : (countryCode === 'ES' ? 'Spain' : countryCode === 'DE' ? 'Germany' : countryCode === 'US' ? 'United States' : countryCode === 'IR' ? 'Iran' : (countryCode || 'Outside Iran'));

  const fullSearchText = `${isp} ${org} ${asn} ${asname}`.toLowerCase();
  const isIran = countryCode === 'IR' || country.toLowerCase().includes('iran') || fullSearchText.includes('iran');

  // Intelligent weighted signature matching
  let bestMatched: typeof CARRIER_SIGNATURES[0] | null = null;
  let maxScore = 0;

  // 0. Instant IP Range check
  const ipRangeMatch = matchIranianCarrierByIp(ip);
  if (ipRangeMatch) {
    const foundSig = CARRIER_SIGNATURES.find((s) => s.id === ipRangeMatch.id);
    if (foundSig) {
      bestMatched = foundSig;
      maxScore = 200;
    }
  }

  if (!bestMatched) {
    for (const sig of CARRIER_SIGNATURES) {
    let score = 0;

    // 1. ASN Match (+100)
    const asnMatch = sig.asns.some((a) => {
      const numOnly = a.replace(/[^0-9]/g, '');
      return (
        asn.toUpperCase().includes(a.toUpperCase()) ||
        (numOnly.length >= 4 && asn.includes(numOnly))
      );
    });

    if (asnMatch) {
      score += 100;
    }

    // 2. Keyword Match (+50 for each matching keyword)
    for (const kw of sig.keywords) {
      if (fullSearchText.includes(kw.toLowerCase())) {
        score += 50;
      }
    }

      if (score > maxScore) {
        maxScore = score;
        bestMatched = sig;
      }
    }
  }

  // Fallback keyword check if score was 0
  if (!bestMatched) {
    if (fullSearchText.includes('mci') || fullSearchText.includes('hamrah') || fullSearchText.includes('mobile telecommunication')) {
      bestMatched = CARRIER_SIGNATURES.find((s) => s.id === 'mci') || null;
    } else if (fullSearchText.includes('irancell') || fullSearchText.includes('mtn')) {
      bestMatched = CARRIER_SIGNATURES.find((s) => s.id === 'irancell') || null;
    } else if (fullSearchText.includes('rightel')) {
      bestMatched = CARRIER_SIGNATURES.find((s) => s.id === 'rightel') || null;
    } else if (fullSearchText.includes('shatel')) {
      bestMatched = CARRIER_SIGNATURES.find((s) => s.id === 'shatel') || null;
    } else if (fullSearchText.includes('mokhaberat') || fullSearchText.includes('tci')) {
      bestMatched = CARRIER_SIGNATURES.find((s) => s.id === 'mokhaberat') || null;
    }
  }

  // Real detected provider name
  const detectedDisplayName = isp || org || asname || (asn ? `ASN ${asn}` : 'Auto-Detected ISP');

  if (bestMatched) {
    return {
      ip,
      isp: detectedDisplayName,
      org: org || bestMatched.name,
      as: asn || bestMatched.asns[0],
      asname: asname || bestMatched.name,
      city,
      region,
      country,
      countryCode,
      matchedProfileId: bestMatched.id,
      matchedProfileName: bestMatched.name,
      matchedProfileNameFa: bestMatched.nameFa,
      isIran,
      cellularOrMobile: ['irancell', 'mci', 'rightel', 'shatel', 'zitel'].includes(bestMatched.id),
      detectedAt: new Date().toISOString(),
      source: sourceUsed
    };
  }

  // Non-Iranian or unrecognized VPN ISP (e.g., Ono, Vodafone, Cloudflare, etc.)
  const targetSig = CARRIER_SIGNATURES.find((s) => s.id === preferredProfileId) || CARRIER_SIGNATURES[0];
  return {
    ip,
    isp: detectedDisplayName,
    org: org || detectedDisplayName,
    as: asn || 'AS-Auto',
    asname: asname || detectedDisplayName,
    city,
    region,
    country,
    countryCode,
    matchedProfileId: targetSig.id,
    matchedProfileName: `${targetSig.name} (VPN)`,
    matchedProfileNameFa: `${targetSig.nameFa} (VPN/خارج)`,
    isIran,
    cellularOrMobile: false,
    detectedAt: new Date().toISOString(),
    source: sourceUsed
  };
}
