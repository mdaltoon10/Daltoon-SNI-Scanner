import { ParsedProxyConfig } from '../types';

/**
 * Parses multiple proxy formats (VLESS, VMess, Trojan, Shadowsocks, Clash YAML, Singbox JSON)
 */
export function parseProxyConfig(rawInput: string): ParsedProxyConfig | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  try {
    // 1. Check for VLESS
    if (trimmed.startsWith('vless://')) {
      const parsedUrl = new URL(trimmed);
      const uuid = parsedUrl.username;
      const server = parsedUrl.hostname;
      const port = parsedUrl.port || '443';
      const params = new URLSearchParams(parsedUrl.search);
      const sni = params.get('sni') || params.get('serverName') || '';
      const host = params.get('host') || sni || '';
      const path = params.get('path') || '/';
      const type = params.get('type') || 'tcp';
      const headerType = params.get('headerType') || 'none';
      const rawSecurity = params.get('security');
      const security = rawSecurity !== null ? rawSecurity : '';
      const name = decodeURIComponent(parsedUrl.hash.replace('#', '')) || 'VLESS-Config';

      return {
        raw: trimmed,
        protocol: 'vless',
        server,
        port,
        sni: sni || host || server,
        host: host || sni || server,
        uuidOrPassword: uuid,
        path,
        type,
        headerType,
        security,
        name
      };
    }

    // 2. Check for Trojan
    if (trimmed.startsWith('trojan://')) {
      const parsedUrl = new URL(trimmed);
      const password = parsedUrl.username;
      const server = parsedUrl.hostname;
      const port = parsedUrl.port || '443';
      const params = new URLSearchParams(parsedUrl.search);
      const sni = params.get('sni') || params.get('peer') || '';
      const host = params.get('host') || sni || '';
      const path = params.get('path') || '/';
      const type = params.get('type') || 'tcp';
      const headerType = params.get('headerType') || 'none';
      const rawSecurity = params.get('security');
      const security = rawSecurity !== null ? rawSecurity : (sni ? 'tls' : '');
      const name = decodeURIComponent(parsedUrl.hash.replace('#', '')) || 'Trojan-Config';

      return {
        raw: trimmed,
        protocol: 'trojan',
        server,
        port,
        sni: sni || host || server,
        host: host || sni || server,
        uuidOrPassword: password,
        path,
        type,
        headerType,
        security,
        name
      };
    }

    // 3. Check for VMess
    if (trimmed.startsWith('vmess://')) {
      const base64Part = trimmed.slice(8);
      let decodedStr = '';
      try {
        decodedStr = atob(base64Part);
      } catch {
        decodedStr = atob(base64Part.replace(/-/g, '+').replace(/_/g, '/'));
      }
      const json = JSON.parse(decodedStr);
      return {
        raw: trimmed,
        protocol: 'vmess',
        server: json.add || '',
        port: json.port || '443',
        sni: json.sni || json.host || json.add || '',
        host: json.host || json.sni || '',
        uuidOrPassword: json.id,
        path: json.path || '/',
        type: json.net || 'tcp',
        headerType: json.type || 'none',
        security: json.tls || '',
        name: json.ps || 'VMess-Config'
      };
    }

    // 4. Check for Shadowsocks
    if (trimmed.startsWith('ss://')) {
      return {
        raw: trimmed,
        protocol: 'ss',
        server: 'shadowsocks.node',
        port: 443,
        sni: 'dynamic',
        host: '',
        headerType: 'none',
        security: '',
        name: 'Shadowsocks'
      };
    }

    // 5. Check if plain JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      return {
        raw: trimmed,
        protocol: 'singbox',
        server: parsed.server || parsed.add || '127.0.0.1',
        port: parsed.server_port || parsed.port || 443,
        sni: (parsed.tls && parsed.tls.server_name) || parsed.sni || '',
        host: parsed.host || '',
        uuidOrPassword: parsed.uuid || parsed.password,
        headerType: 'none',
        security: parsed.tls?.enabled ? 'tls' : '',
        name: parsed.tag || 'Singbox-Config'
      };
    }

    // Default generic fallback
    return {
      raw: trimmed,
      protocol: 'unknown',
      server: 'custom.server.com',
      port: 443,
      sni: 'www.yahoo.com',
      host: 'www.yahoo.com',
      headerType: 'none',
      security: '',
      name: 'Custom-Proxy'
    };
  } catch (err) {
    console.warn('Failed to parse proxy config:', err);
    return null;
  }
}

/**
 * Replaces or injects a target domain (as Bug Host or SNI) into an existing config string
 * without forcefully enabling TLS if the user config does not use TLS!
 */
export function injectSniIntoConfig(config: ParsedProxyConfig, targetDomain: string): string {
  if (config.protocol === 'vless') {
    try {
      const url = new URL(config.raw);
      const params = new URLSearchParams(url.search);

      // Check if original config uses TLS/Reality
      const origSecurity = params.get('security');
      const hasTls = origSecurity === 'tls' || origSecurity === 'reality';
      const hasHttpHeader = params.get('headerType') === 'http' || params.get('type') === 'http';
      const hasWs = params.get('type') === 'ws';

      if (hasTls) {
        params.set('sni', targetDomain);
        if (hasWs || hasHttpHeader) {
          params.set('host', targetDomain);
        }
      } else {
        // Plain TCP / HTTP Header / Free Net / Bug Host mode
        // KEEP security as is (e.g. empty or none)
        params.set('host', targetDomain);
        if (params.has('sni')) {
          params.set('sni', targetDomain);
        }
      }

      url.search = params.toString();
      const baseName = config.name ? config.name.split('-[')[0] : 'VLESS';
      const updatedName = `${baseName}-[Host:${targetDomain}]`;
      url.hash = encodeURIComponent(updatedName);
      return url.toString();
    } catch {
      return config.raw;
    }
  }

  if (config.protocol === 'trojan') {
    try {
      const url = new URL(config.raw);
      const params = new URLSearchParams(url.search);
      const origSecurity = params.get('security');
      const hasTls = origSecurity === 'tls';

      if (hasTls || params.has('sni') || params.has('peer')) {
        params.set('sni', targetDomain);
        params.set('peer', targetDomain);
      }
      if (params.has('host') || params.get('type') === 'ws' || params.get('headerType') === 'http') {
        params.set('host', targetDomain);
      }
      url.search = params.toString();
      const baseName = config.name ? config.name.split('-[')[0] : 'Trojan';
      const updatedName = `${baseName}-[Host:${targetDomain}]`;
      url.hash = encodeURIComponent(updatedName);
      return url.toString();
    } catch {
      return config.raw;
    }
  }

  if (config.protocol === 'vmess') {
    try {
      const base64Part = config.raw.slice(8);
      const json = JSON.parse(atob(base64Part));
      if (json.tls === 'tls') {
        json.sni = targetDomain;
      }
      json.host = targetDomain;
      const baseName = (json.ps || 'VMess').split('-[')[0];
      json.ps = `${baseName}-[Host:${targetDomain}]`;
      return `vmess://${btoa(JSON.stringify(json))}`;
    } catch {
      return config.raw;
    }
  }

  // Fallback template for any raw string
  return `vless://${config.uuidOrPassword || '8e93d46e-96fe-4ae9-91a6-97893991db03'}@${config.server || 'matin.daltoonserver.ir'}:${config.port || 23614}?security=&encryption=none&host=${targetDomain}&headerType=http&type=tcp#Daltoon-[Host:${targetDomain}]`;
}

/**
 * Generates Clash YAML snippet for the given SNI
 */
export function generateClashYaml(sni: string, server = '104.16.12.34', port = 443, uuid = 'a3e7b290-3490-449e-b7e8-e9f0d1a4c28b'): string {
  return `
- name: "SNI-${sni}"
  type: vless
  server: "${server}"
  port: ${port}
  uuid: "${uuid}"
  cipher: auto
  tls: true
  servername: "${sni}"
  network: tcp
  udp: true
  client-fingerprint: chrome
  reality-opts:
    public-key: ""
    short-id: ""
  `.trim();
}

/**
 * Generates Singbox JSON snippet for the given SNI
 */
export function generateSingboxJson(sni: string, server = '104.16.12.34', port = 443, uuid = 'a3e7b290-3490-449e-b7e8-e9f0d1a4c28b'): string {
  const singboxConfig = {
    type: 'vless',
    tag: `vless-${sni}`,
    server: server,
    server_port: port,
    uuid: uuid,
    tls: {
      enabled: true,
      server_name: sni,
      utls: {
        enabled: true,
        fingerprint: 'chrome'
      }
    },
    packet_encoding: 'xudp'
  };
  return JSON.stringify(singboxConfig, null, 2);
}

/**
 * Generates all formats (VLESS, Clash YAML, Singbox JSON) for a given SNI
 */
export function generateMultiFormatConfigs(config: ParsedProxyConfig, sni: string) {
  const vless = injectSniIntoConfig(config, sni);
  const clash = generateClashYaml(sni, config.server, Number(config.port) || 443, config.uuidOrPassword);
  const singbox = generateSingboxJson(sni, config.server, Number(config.port) || 443, config.uuidOrPassword);

  return {
    vless,
    clash,
    singbox
  };
}
