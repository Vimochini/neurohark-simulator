// Vector drawings of the NeuroHark hardware, styled after the real parts.
// Each part is drawn in its own local coordinates and placed with a translate().
// Drawings are approximations of the real components (no photos are used).

import { pointAlong } from '../ui.jsx';

// Shared gradients. Render once per illustration <svg>.
export function Defs() {
  return (
    <defs>
      <linearGradient id="gPcbBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f72bd" />
        <stop offset="1" stopColor="#123f73" />
      </linearGradient>
      <linearGradient id="gPcbGreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f9a4b" />
        <stop offset="1" stopColor="#1d5a2b" />
      </linearGradient>
      <linearGradient id="gBlack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3d4248" />
        <stop offset="0.5" stopColor="#1b1e22" />
        <stop offset="1" stopColor="#0c0d0f" />
      </linearGradient>
      <linearGradient id="gSilver" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c9d0d8" />
        <stop offset="0.35" stopColor="#ffffff" />
        <stop offset="0.7" stopColor="#aab3bc" />
        <stop offset="1" stopColor="#e4e8ec" />
      </linearGradient>
      <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f8f9fb" />
        <stop offset="1" stopColor="#cfd5dc" />
      </linearGradient>
      <linearGradient id="gBeige" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e7c8" />
        <stop offset="1" stopColor="#c9b68a" />
      </linearGradient>
      <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2d37a" />
        <stop offset="1" stopColor="#9a7420" />
      </linearGradient>
      <linearGradient id="gAlu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e9edf1" />
        <stop offset="1" stopColor="#8e99a4" />
      </linearGradient>
      <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#bfe0f2" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="gTissue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f5dcd3" />
        <stop offset="1" stopColor="#e9c1b5" />
      </linearGradient>
      <radialGradient id="gBead" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#b8643a" />
        <stop offset="1" stopColor="#4a2312" />
      </radialGradient>
      <radialGradient id="gQD" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#b57cff" stopOpacity="0.95" />
        <stop offset="1" stopColor="#b57cff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="gHeat" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ff6b6b" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ff6b6b" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="gLed" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.4" stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const Led = ({ x, y, on, color = '#ff3b3b', r = 2.4 }) => (
  <g>
    {on && <circle cx={x} cy={y} r={r * 3} fill={color} opacity="0.35" />}
    <circle cx={x} cy={y} r={r} fill={on ? color : '#3a2020'} stroke="#000" strokeWidth="0.4" />
  </g>
);

// 12 V wall adapter (brick) with DC barrel plug and cable.
export function Adapter({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="13" height="5" fill="url(#gSilver)" />
      <rect x="0" y="11" width="13" height="5" fill="url(#gSilver)" />
      <rect x="10" y="-2" width="72" height="26" rx="5" fill="url(#gBlack)" stroke="#000" strokeWidth="0.8" />
      <rect x="18" y="4" width="54" height="18" rx="2" fill="#111" opacity="0.35" />
      <text x="45" y="13" textAnchor="middle" fontSize="9.0" fill="#e8e8e8">12 V 3 A</text>
      <path d="M82 11 C 100 11, 100 22, 112 22" stroke="#202225" strokeWidth="3" fill="none" />
      <rect x="112" y="16" width="9" height="12" rx="2" fill="url(#gBlack)" />
      <circle cx="116.5" cy="22" r="1.8" fill="#c9d0d8" />
    </g>
  );
}

// Blade fuse holder with 3 A glass fuse.
export function FuseHolder({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-5" width="44" height="14" rx="4" fill="url(#gBody)" stroke="#8b939c" strokeWidth="0.6" />
      <rect x="0" y="-6" width="6" height="16" rx="1.5" fill="url(#gSilver)" />
      <rect x="38" y="-6" width="6" height="16" rx="1.5" fill="url(#gSilver)" />
      <rect x="9" y="-3" width="26" height="10" rx="5" fill="url(#gGlass)" stroke="#8a9aa6" strokeWidth="0.5" />
      <path d="M13 0 H31" stroke="#9aa" strokeWidth="0.8" />
      <text x="22" y="16" textAnchor="middle" fontSize="8.2" fill="#444">3 A</text>
    </g>
  );
}

// LM2596 buck converter module (blue board, inductor, trimmer, IC, terminals).
export function BuckModule({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="100" height="62" rx="3" fill="url(#gPcbBlue)" stroke="#0a2a55" strokeWidth="0.6" />
      <rect x="4" y="4" width="92" height="54" rx="2" fill="none" stroke="#5b8fd0" strokeWidth="0.4" strokeDasharray="2 2" />
      <rect x="34" y="14" width="30" height="24" rx="3" fill="url(#gBlack)" stroke="#000" strokeWidth="0.5" />
      <rect x="38" y="16" width="22" height="5" fill="url(#gGold)" />
      <text x="49" y="30" textAnchor="middle" fontSize="7.5" fill="#9aa">22µH</text>
      <rect x="72" y="14" width="18" height="16" rx="1" fill="url(#gBlack)" />
      <text x="81" y="25" textAnchor="middle" fontSize="6.5" fill="#cfd6dd">LM2596</text>
      <rect x="8" y="10" width="11" height="11" fill="#1e5bb0" stroke="#0a2a55" strokeWidth="0.5" />
      <circle cx="13.5" cy="15.5" r="2.8" fill="url(#gGold)" />
      <circle cx="90" cy="9" r="6" fill="url(#gAlu)" stroke="#444" strokeWidth="0.4" />
      <circle cx="90" cy="9" r="2" fill="#222" />
      <rect x="6" y="50" width="26" height="9" rx="1" fill="#2d8f3e" stroke="#124" strokeWidth="0.4" />
      <rect x="40" y="50" width="26" height="9" rx="1" fill="#2d8f3e" stroke="#124" strokeWidth="0.4" />
      <rect x="70" y="50" width="26" height="9" rx="1" fill="#2d8f3e" stroke="#124" strokeWidth="0.4" />
      <circle cx="11" cy="54.5" r="1.6" fill="#ddd" />
      <circle cx="28" cy="54.5" r="1.6" fill="#ddd" />
      <circle cx="45" cy="54.5" r="1.6" fill="#ddd" />
      <circle cx="62" cy="54.5" r="1.6" fill="#ddd" />
      <circle cx="75" cy="54.5" r="1.6" fill="#ddd" />
      <circle cx="92" cy="54.5" r="1.6" fill="#ddd" />
      <text x="19" y="45" textAnchor="middle" fontSize="6.8" fill="#dfe8f5">IN</text>
      <text x="53" y="45" textAnchor="middle" fontSize="6.8" fill="#dfe8f5">OUT</text>
      <Led x={92} y={30} on={on} color="#ff4b4b" />
    </g>
  );
}

// Electrolytic filter capacitor (aluminium can with polarity stripe).
export function Capacitor({ x = 0, y = 0, label = '1000 µF' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="6" width="18" height="36" rx="2" fill="url(#gBlack)" stroke="#000" strokeWidth="0.5" />
      <rect x="11" y="6" width="5" height="36" fill="#d8d8d8" opacity="0.25" />
      <rect x="0" y="6" width="18" height="2" fill="#777" />
      <ellipse cx="9" cy="6" rx="9" ry="2.4" fill="url(#gSilver)" stroke="#555" strokeWidth="0.4" />
      <text x="9" y="52" textAnchor="middle" fontSize="7.5" fill="#333">{label}</text>
      <path d="M3 11 V 17 M0 14 H6" stroke="#ddd" strokeWidth="0.6" />
    </g>
  );
}

// 10 kΩ NTC thermistor bead on leads.
export function Thermistor({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M6 14 V 46 M12 14 V 46" stroke="#c9d0d8" strokeWidth="1.1" />
      <ellipse cx="9" cy="10" rx="6.5" ry="7.5" fill="url(#gBead)" stroke="#2a1408" strokeWidth="0.4" />
      <ellipse cx="7" cy="7.5" rx="2" ry="1.4" fill="#fff" opacity="0.35" />
      <text x="9" y="62" textAnchor="middle" fontSize="7.5" fill="#333">10k NTC</text>
    </g>
  );
}

// Fixed reference resistor, 10 kΩ (brown-black-orange-gold bands).
export function ResistorRef({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-14 7 H0 M50 7 H64" stroke="#c9d0d8" strokeWidth="1.2" />
      <rect x="0" y="0" width="50" height="14" rx="6" fill="url(#gBeige)" stroke="#8c7a55" strokeWidth="0.5" />
      <rect x="9" y="0" width="3.2" height="14" fill="#6b3a1a" />
      <rect x="15" y="0" width="3.2" height="14" fill="#111" />
      <rect x="21" y="0" width="3.2" height="14" fill="#f08a24" />
      <rect x="40" y="0" width="3.2" height="14" fill="#d4a72c" />
      <text x="25" y="24" textAnchor="middle" fontSize="7.5" fill="#333">R_ref 10k</text>
    </g>
  );
}

// ADS1115 16-bit ADC breakout (blue board, IC, header).
export function ADS1115({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="84" height="62" rx="3" fill="url(#gPcbBlue)" stroke="#0a2a55" strokeWidth="0.6" />
      <rect x="28" y="14" width="26" height="24" rx="1.5" fill="url(#gBlack)" />
      <text x="41" y="26" textAnchor="middle" fontSize="6.5" fill="#d7dde5">ADS1115</text>
      <text x="41" y="32" textAnchor="middle" fontSize="6.5" fill="#8a96a6">16-bit ADC</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={8 + i * 11} y="51" width="6" height="7" fill="#e4e8ec" stroke="#333" strokeWidth="0.3" />
      ))}
      <Led x={76} y={10} on={on} color="#5cff8a" />
    </g>
  );
}

// ESP32 DevKit V1: dark board, RF shield, two pin headers, micro-USB, buttons.
export function ESP32({ x = 0, y = 0, on = false, label = 'ESP32' }) {
  const pins = Array.from({ length: 15 }, (_, i) => i);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="22" width="10" height="20" rx="2" fill="url(#gSilver)" stroke="#666" strokeWidth="0.4" />
      <rect x="0" y="0" width="150" height="72" rx="4" fill="url(#gPcbGreen)" stroke="#0d2a14" strokeWidth="0.7" />
      <rect x="0" y="0" width="150" height="5" rx="1" fill="#101010" />
      <rect x="0" y="67" width="150" height="5" rx="1" fill="#101010" />
      {pins.map((i) => (
        <g key={i}>
          <circle cx={8 + i * 9.6} cy="2.5" r="1.4" fill="#d8c27a" />
          <circle cx={8 + i * 9.6} cy="69.5" r="1.4" fill="#d8c27a" />
        </g>
      ))}
      <rect x="50" y="8" width="52" height="34" rx="1" fill="url(#gSilver)" stroke="#7c8792" strokeWidth="0.5" />
      <path d="M52 8 V 4 M60 8 V 4 M68 8 V 4 M76 8 V 4 M84 8 V 4 M92 8 V 4 M100 8 V 4" stroke="#888" strokeWidth="0.4" />
      <text x="76" y="28.5" textAnchor="middle" fontSize="9.8" fill="#2a2f35" fontWeight="bold">{label}</text>
      <rect x="10" y="30" width="26" height="12" rx="1" fill="#101810" opacity="0.5" />
      <circle cx="118" cy="16" r="3.2" fill="#c9ced4" stroke="#333" strokeWidth="0.4" />
      <circle cx="118" cy="50" r="3.2" fill="#c9ced4" stroke="#333" strokeWidth="0.4" />
      <Led x={8} y={58} on={on} color="#4dd0ff" r={1.6} />
    </g>
  );
}

// H-bridge motor/TEC driver module with finned heat sink and screw terminals.
export function HBridge({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="112" height="70" rx="3" fill="url(#gPcbGreen)" stroke="#0d2a14" strokeWidth="0.6" />
      <rect x="18" y="12" width="66" height="36" rx="2" fill="url(#gBlack)" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={22 + i * 5.6} y1="13" x2={22 + i * 5.6} y2="47" stroke="#3a3f45" strokeWidth="1.4" />
      ))}
      <text x="51" y="7" textAnchor="middle" fontSize="7.5" fill="#e6f5ea">H-BRIDGE</text>
      <rect x="6" y="56" width="22" height="11" rx="1" fill="#2d6fd0" stroke="#0a2a55" strokeWidth="0.4" />
      <rect x="32" y="56" width="22" height="11" rx="1" fill="#2d6fd0" stroke="#0a2a55" strokeWidth="0.4" />
      <rect x="84" y="56" width="22" height="11" rx="1" fill="#2d6fd0" stroke="#0a2a55" strokeWidth="0.4" />
      <text x="17" y="64" textAnchor="middle" fontSize="6.5" fill="#fff">TEC+</text>
      <text x="43" y="64" textAnchor="middle" fontSize="6.5" fill="#fff">TEC−</text>
      <text x="95" y="64" textAnchor="middle" fontSize="6.5" fill="#fff">12 V</text>
      <Led x={100} y={12} on={on} color="#ffcf4d" />
    </g>
  );
}

// Peltier (TEC) module between an aluminium plate and a finned heat sink with a fan.
// heating: true when the current direction makes the chamber side hot.
export function PeltierStack({ x = 0, y = 0, heating = true, on = false }) {
  const fins = Array.from({ length: 9 }, (_, i) => i);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="86" width="104" height="10" rx="1.5" fill="url(#gAlu)" stroke="#55606b" strokeWidth="0.5" />
      <text x="52" y="106" textAnchor="middle" fontSize="7.5" fill="#333">aluminium plate → chamber</text>
      <rect x="10" y="76" width="84" height="9" rx="1" fill="#1a2430" stroke="#000" strokeWidth="0.4" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={16 + i * 15} y="78.5" width="6" height="4" fill={i % 2 ? '#8fb6d8' : '#d89a8a'} opacity="0.6" />
      ))}
      <rect x="0" y="30" width="104" height="44" rx="2" fill="url(#gAlu)" stroke="#55606b" strokeWidth="0.5" />
      {fins.map((i) => (
        <line key={i} x1="0" y1={34 + i * 4.5} x2="104" y2={34 + i * 4.5} stroke="#6f7a85" strokeWidth="0.7" />
      ))}
      <rect x="-14" y="4" width="132" height="22" rx="3" fill="url(#gBlack)" stroke="#000" strokeWidth="0.5" opacity="0.92" />
      <circle cx="52" cy="15" r="9.5" fill="#15181c" stroke="#666" strokeWidth="0.6" />
      <g>
        <g>
          <ellipse cx="52" cy="15" rx="7.5" ry="1.8" fill="#8a949e" />
          <ellipse cx="52" cy="15" rx="1.8" ry="7.5" fill="#8a949e" />
          <animateTransform attributeName="transform" type="rotate" from="0 52 15" to="360 52 15" dur={on ? '0.5s' : '6s'} repeatCount="indefinite" />
        </g>
      </g>
      <circle cx="52" cy="15" r="1.8" fill="#333" />
      <text x="6" y="10" fontSize="7.5" fill="#bfe0ff">fan</text>
      <text x="100" y="26" textAnchor="end" fontSize="8.2" fill={heating ? '#ff8a8a' : '#8ac8ff'} fontWeight="bold">
        {heating ? 'HOT →' : '← COLD'}
      </text>
      <text x="6" y="26" fontSize="8.2" fill={heating ? '#8ac8ff' : '#ff8a8a'} fontWeight="bold">
        {heating ? 'COLD' : 'HOT'}
      </text>
    </g>
  );
}

// Single-photon detector module (black housing, fibre input, BNC output, status LED).
export function SPDModule({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="128" height="74" rx="5" fill="url(#gBody)" stroke="#000" strokeWidth="0.8" />
      <rect x="0" y="0" width="128" height="9" rx="4" fill="url(#gSilver)" opacity="0.85" />
      <text x="64" y="7" textAnchor="middle" fontSize="7.5" fill="#333">SINGLE PHOTON DETECTOR</text>
      <rect x="-6" y="30" width="10" height="12" rx="1.5" fill="url(#gSilver)" stroke="#666" strokeWidth="0.4" />
      <circle cx="30" cy="38" r="8" fill="#0e1012" stroke="#777" strokeWidth="0.8" />
      <circle cx="30" cy="38" r="2.6" fill="#2ad4ff" opacity={on ? 1 : 0.35} />
      <text x="48" y="36" fontSize="7.5" fill="#bbb">fibre in</text>
      <circle cx="104" cy="50" r="8" fill="url(#gSilver)" stroke="#555" strokeWidth="0.6" />
      <circle cx="104" cy="50" r="3" fill="#222" />
      <text x="104" y="66" textAnchor="middle" fontSize="6.8" fill="#bbb">BNC out</text>
      <Led x={112} y={20} on={on} color="#ff4b4b" />
    </g>
  );
}

// 4-channel bidirectional level shifter module (5 V ↔ 3.3 V).
export function LevelShifter({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="92" height="60" rx="3" fill="url(#gPcbBlue)" stroke="#0a2a55" strokeWidth="0.6" />
      <rect x="10" y="18" width="14" height="10" rx="1" fill="url(#gBlack)" />
      <rect x="40" y="18" width="14" height="10" rx="1" fill="url(#gBlack)" />
      <rect x="66" y="18" width="14" height="10" rx="1" fill="url(#gBlack)" />
      <text x="46" y="10" textAnchor="middle" fontSize="7.5" fill="#dfe8f5">LV1 5V↔3V3</text>
      <text x="10" y="40" fontSize="6.5" fill="#dfe8f5">HV</text>
      <text x="70" y="40" fontSize="6.5" fill="#dfe8f5">LV</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={10 + i * 12} y="52" width="5" height="6" fill="#e4e8ec" />
      ))}
      <Led x={86} y={8} on={on} color="#5cff8a" />
    </g>
  );
}

// NEMA 17 stepper motor (square flange, four mounting holes, D-shaft).
export function NEMA17({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="86" height="86" rx="3" fill="url(#gSilver)" stroke="#6f7a85" strokeWidth="0.8" />
      {[[7, 7], [79, 7], [7, 79], [79, 79]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#4b535c" stroke="#222" strokeWidth="0.4" />
      ))}
      <circle cx="43" cy="43" r="22" fill="#d7dde3" stroke="#7e8891" strokeWidth="0.6" />
      <circle cx="43" cy="43" r="10" fill="#b8c1ca" />
      <rect x="86" y="38" width="22" height="10" fill="url(#gSilver)" stroke="#6f7a85" strokeWidth="0.4" />
      <rect x="100" y="36" width="8" height="14" fill="#c9d0d8" stroke="#6f7a85" strokeWidth="0.4" />
      <path d="M20 86 C 20 100, 28 104, 28 112" stroke="#c0392b" strokeWidth="1.4" fill="none" />
      <path d="M26 86 C 26 100, 34 104, 34 112" stroke="#2ecc71" strokeWidth="1.4" fill="none" />
      <path d="M32 86 C 32 100, 40 104, 40 112" stroke="#2c7bd1" strokeWidth="1.4" fill="none" />
      <path d="M38 86 C 38 100, 46 104, 46 112" stroke="#222" strokeWidth="1.4" fill="none" />
      <text x="43" y="-4" textAnchor="middle" fontSize="7.5" fill="#333">NEMA 17</text>
      {on && <circle cx="43" cy="43" r="30" fill="none" stroke="#4dd0ff" strokeWidth="0.6" strokeDasharray="3 3" />}
    </g>
  );
}

// A4988 stepper driver module (green board, heat sink on driver IC, header).
export function StepDriver({ x = 0, y = 0, on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="70" height="54" rx="2.5" fill="url(#gPcbGreen)" stroke="#0d2a14" strokeWidth="0.6" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={5 + i * 8} y="2" width="4" height="4" fill="#e4e8ec" />
      ))}
      <rect x="22" y="14" width="26" height="22" rx="1" fill="url(#gBlack)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="22" y1={17 + i * 4} x2="48" y2={17 + i * 4} stroke="#3a3f45" strokeWidth="0.9" />
      ))}
      <text x="35" y="49" textAnchor="middle" fontSize="6.8" fill="#e6f5ea">A4988</text>
      <Led x={62} y={46} on={on} color="#ffcf4d" r={1.6} />
    </g>
  );
}

// 0.96" OLED I²C display module (blue board, glass panel, lit text).
export function OLED({ x = 0, y = 0, lines = [], on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="92" height="68" rx="3" fill="url(#gPcbBlue)" stroke="#0a2a55" strokeWidth="0.6" />
      <rect x="8" y="7" width="76" height="40" rx="1.5" fill="#03060a" stroke="#1d2a33" strokeWidth="0.6" />
      {lines.map((l, i) => (
        <text key={i} className="keep" x="12" y={17 + i * 10} fontSize="9.8" fill={on ? '#9ff0c0' : '#2a5a40'} fontFamily="monospace">
          {l}
        </text>
      ))}
      {['GND', 'VCC', 'SCL', 'SDA'].map((n, i) => (
        <rect key={n} x={14 + i * 17} y="57" width="6" height="7" fill="#e4e8ec" />
      ))}
    </g>
  );
}

// Laptop (lid with screen, base with keyboard deck and USB port).
export function Laptop({ x = 0, y = 0, label = 'laptop' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="200" height="132" rx="8" fill="#2a2e33" stroke="#111" strokeWidth="0.8" />
      <rect x="9" y="9" width="182" height="112" rx="3" fill="#0b0f14" />
      <rect x="14" y="14" width="172" height="102" rx="2" fill="#f6f8fb" opacity="0.07" />
      <path d="M-14 132 H214 L224 146 H-24 Z" fill="url(#gSilver)" stroke="#8a939d" strokeWidth="0.6" />
      <rect x="92" y="136" width="36" height="5" rx="2" fill="#6b747e" />
    </g>
  );
}

// Syringe pump (NE-1000 type): body with LCD, drive, horizontal syringe on a carriage.
export function SyringePump({ x = 0, y = 0, display = ['0.75 µL/min', 'RUN'], on = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="34" width="200" height="118" rx="8" fill="url(#gBody)" stroke="#8c96a0" strokeWidth="1" />
      <rect x="0" y="34" width="200" height="12" rx="6" fill="url(#gSilver)" opacity="0.7" />
      <rect x="18" y="62" width="70" height="40" rx="3" fill="#0b1510" stroke="#40505a" strokeWidth="0.8" />
      {display.map((l, i) => (
        <text key={i} className="keep" x="24" y={76 + i * 14} fontSize="12.0" fill={on ? '#9ff0c0' : '#2a4a38'} fontFamily="monospace">
          {l}
        </text>
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={108 + i * 22} cy="78" r="6" fill="#3a3f45" stroke="#111" strokeWidth="0.6" />
      ))}
      <rect x="106" y="98" width="84" height="40" rx="3" fill="#e5e9ee" stroke="#9aa4ae" strokeWidth="0.6" />
      <text x="148" y="122" textAnchor="middle" fontSize="9.0" fill="#55606b">SYRINGE PUMP</text>
      <rect x="-30" y="22" width="48" height="10" rx="2" fill="url(#gSilver)" stroke="#7b8590" strokeWidth="0.5" />
      <rect x="-36" y="24" width="12" height="6" rx="1" fill="#555" />
      {/* lead screw and carriage */}
      <rect x="18" y="26" width="64" height="5" fill="url(#gSilver)" />
      <rect x="82" y="19" width="18" height="18" rx="2" fill="url(#gBlack)" />
      {/* syringe barrel */}
      <rect x="100" y="18" width="150" height="22" rx="4" fill="url(#gGlass)" stroke="#8aa0b0" strokeWidth="0.8" />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={112 + i * 13} y1="18" x2={112 + i * 13} y2="24" stroke="#607080" strokeWidth="0.5" />
      ))}
      <rect x="250" y="21" width="8" height="16" fill="url(#gSilver)" stroke="#7b8590" strokeWidth="0.4" />
      <rect x="90" y="14" width="12" height="30" rx="2" fill="url(#gBlack)" stroke="#000" strokeWidth="0.4" />
      <path d="M258 29 C 274 29, 276 40, 292 40" stroke="#9ec9e6" strokeWidth="3" fill="none" />
      <circle cx="232" cy="29" r="0" fill="none" />
      <rect x="92" y="2" width="30" height="8" rx="2" fill="#2c3338" />
    </g>
  );
}

// Microdialysis probe: guide cannula with a membrane tip and inlet/outlet tubing.
export function Probe({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-40 14 C -20 14, -16 12, 0 12" stroke="#9ec9e6" strokeWidth="2.6" fill="none" />
      <rect x="0" y="6" width="112" height="13" rx="6" fill="url(#gSilver)" stroke="#8b949e" strokeWidth="0.6" />
      <rect x="92" y="8" width="46" height="9" rx="4.5" fill="#dfe6ec" stroke="#8b949e" strokeWidth="0.5" />
      <rect x="112" y="8" width="26" height="9" fill="#c7d2dc" opacity="0.5" />
      <rect x="112" y="6" width="34" height="13" rx="4" fill="rgba(170,200,225,0.55)" stroke="#6f8aa0" strokeWidth="0.7" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={116 + i * 4} y1="8" x2={116 + i * 4} y2="17" stroke="#6f8aa0" strokeWidth="0.4" opacity="0.7" />
      ))}
      <path d="M146 12.5 L 158 12.5" stroke="#6f8aa0" strokeWidth="1" />
      <path d="M-40 19 C -20 19, -16 19, 0 19" stroke="#9ec9e6" strokeWidth="2.6" fill="none" />
      <text x="128" y="-4" textAnchor="middle" fontSize="8.2" fill="#333">membrane 2 mm (assumed)</text>
    </g>
  );
}

// PDMS chip on a glass slide: channel with inlet/outlet ports and a bottle resonator crossing it.
export function Chip({ x = 0, y = 0, lit = false, sample = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-6" y="104" width="182" height="8" rx="1" fill="rgba(200,226,242,0.75)" stroke="#8fb0c4" strokeWidth="0.5" />
      <rect x="0" y="20" width="170" height="86" rx="6" fill="rgba(226,242,252,0.7)" stroke="#9ac0d8" strokeWidth="0.9" />
      <rect x="6" y="26" width="158" height="74" rx="4" fill="none" stroke="#c4dced" strokeWidth="0.5" strokeDasharray="2 3" />
      <path d="M10 63 H160" stroke={sample ? '#e0457b' : '#2c4a66'} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <path d="M10 63 H160" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="63" r="5" fill="#2c4a66" />
      <circle cx="162" cy="63" r="5" fill="#2c4a66" />
      <text x="85" y="14" textAnchor="middle" fontSize="9.0" fill="#33546b">PDMS 100 × 80 µm channel</text>
      <Fibre cx={85} cy={63} lit={lit} />
    </g>
  );
}

// Bottle-shaped fibre resonator with QD coating, drawn across the chip channel.
export function Fibre({ cx = 0, cy = 0, lit = false }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x="-44" y="-2.5" width="88" height="5" rx="2.5" fill="#dce8f1" stroke="#7d93a6" strokeWidth="0.5" />
      <ellipse cx="0" cy="0" rx="17" ry="8" fill="rgba(170,130,255,0.35)" stroke="#8a5cd6" strokeWidth="0.8" />
      <ellipse cx="0" cy="0" rx="17" ry="8" fill="url(#gQD)" opacity={lit ? 1 : 0.7} />
      <circle cx="0" cy="0" r="1.6" fill="#7b4fd6" />
      <text x="0" y="-12" textAnchor="middle" fontSize="7.5" fill="#6a3fb0">QD-coated bottle</text>
    </g>
  );
}

// Waste bottle (glass with cap and label).
export function WasteBottle({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M10 0 H30 V12 Q 46 18 46 40 V 90 Q 46 100 36 100 H4 Q -6 100 -6 90 V40 Q -6 18 10 12 Z" fill="rgba(210,235,225,0.55)" stroke="#7fa89a" strokeWidth="0.9" />
      <rect x="6" y="-6" width="28" height="8" rx="2" fill="url(#gBlack)" />
      <rect x="-2" y="58" width="44" height="28" fill="#e8ece9" stroke="#9aa" strokeWidth="0.4" />
      <text x="20" y="72" textAnchor="middle" fontSize="8.2" fill="#444">WASTE</text>
      <rect x="-2" y="78" width="44" height="8" fill="#c96" opacity="0.4" />
    </g>
  );
}

// Flexible tubing as a polyline, with optional moving fluid dots.
export function Tube({ pts, color = '#9fc3dd', dots = 0, t = 0, dotColor = '#e0457b' }) {
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <g>
      <path d={d} stroke="#1d3347" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      <path d={d} stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#fff" strokeWidth="1" fill="none" opacity="0.55" strokeLinecap="round" />
      {Array.from({ length: dots }, (_, k) => {
        const [x, y] = pointAlong(pts, t + k / dots);
        return <circle key={k} cx={x} cy={y} r="2.6" fill={dotColor} opacity="0.9" />;
      })}
    </g>
  );
}

// Electrical wire (polyline) with a colour code.
export function Wire({ pts, color = '#444', width = 1.6, dash }) {
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinejoin="round" strokeDasharray={dash} />;
}

// Glowing status LED helper for layouts that need a standalone indicator.
export { Led };
