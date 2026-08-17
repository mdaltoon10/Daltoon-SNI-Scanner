import { SniItem, NetworkProfile } from '../types';
import { COMPLETE_WORLDWIDE_SNI_LIST } from './worldwideSniDatabase';

export const NETWORK_PROFILES: NetworkProfile[] = [
  {
    id: 'mci',
    name: 'MCI / Hamrah-e Aval',
    nameFa: 'همراه اول (MCI)',
    asn: 'AS44244',
    defaultMtu: 1450,
    recommendedFrag: '1-3, 5-10ms (TLS Hello)',
    color: '#06b6d4'
  },
  {
    id: 'irancell',
    name: 'MTN Irancell',
    nameFa: 'ایرانسل (MTN)',
    asn: 'AS44337',
    defaultMtu: 1420,
    recommendedFrag: '2-5, 8-15ms (SNI Split)',
    color: '#eab308'
  },
  {
    id: 'rightel',
    name: 'Rightel',
    nameFa: 'رایتل (Rightel)',
    asn: 'AS57218',
    defaultMtu: 1450,
    recommendedFrag: '1-4, 5-12ms',
    color: '#a855f7'
  },
  {
    id: 'shatel',
    name: 'Shatel ADSL / VDSL',
    nameFa: 'شاتل (Shatel)',
    asn: 'AS31549',
    defaultMtu: 1492,
    recommendedFrag: '1-2, 3-8ms',
    color: '#3b82f6'
  },
  {
    id: 'mokhaberat',
    name: 'TCI / Mokhaberat',
    nameFa: 'مخابرات (TCI)',
    asn: 'AS58224',
    defaultMtu: 1480,
    recommendedFrag: '2-4, 10-20ms',
    color: '#10b981'
  },
  {
    id: 'zitel',
    name: 'Zitel TD-LTE',
    nameFa: 'زایتل (Zitel)',
    asn: 'AS208004',
    defaultMtu: 1450,
    recommendedFrag: '1-3, 4-10ms',
    color: '#f97316'
  },
  {
    id: 'asiatech',
    name: 'Asiatech ADSL / VDSL',
    nameFa: 'آسیاتک (Asiatech)',
    asn: 'AS43754',
    defaultMtu: 1492,
    recommendedFrag: '1-3, 5-12ms',
    color: '#ec4899'
  },
  {
    id: 'hiweb',
    name: 'HiWEB / Pars Online',
    nameFa: 'های‌وب / پارس آنلاین (HiWEB)',
    asn: 'AS42337',
    defaultMtu: 1492,
    recommendedFrag: '1-2, 5-10ms',
    color: '#0284c7'
  },
  {
    id: 'mobinnet',
    name: 'Mobinnet Telecom',
    nameFa: 'مبین‌نت (Mobinnet)',
    asn: 'AS50810',
    defaultMtu: 1450,
    recommendedFrag: '2-4, 8-15ms',
    color: '#84cc16'
  }
];

export const PRESET_SNI_LIST: SniItem[] = COMPLETE_WORLDWIDE_SNI_LIST;

