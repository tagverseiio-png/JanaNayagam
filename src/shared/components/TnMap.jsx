import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

/* ─── 38 Tamil Nadu Districts Coordinate + Ticket Data ─────────────────── */
const districts = [
  { name: "Chennai", tamil: "சென்னை", lat: 13.0827, lng: 80.2707, tickets: 85 },
  { name: "Coimbatore", tamil: "கோயம்புத்தூர்", lat: 11.0168, lng: 76.9558, tickets: 42 },
  { name: "Madurai", tamil: "மதுரை", lat: 9.9252, lng: 78.1198, tickets: 31 },
  { name: "Salem", tamil: "சேலம்", lat: 11.6643, lng: 78.1460, tickets: 18 },
  { name: "Trichy", tamil: "திருச்சி", lat: 10.7905, lng: 78.7047, tickets: 55 },
  { name: "Vellore", tamil: "வேலூர்", lat: 12.9165, lng: 79.1325, tickets: 12 },
  { name: "Tirunelveli", tamil: "திருநெல்வேலி", lat: 8.7139, lng: 77.7567, tickets: 28 },
  { name: "Erode", tamil: "ஈரோடு", lat: 11.3410, lng: 77.7172, tickets: 9 },
  { name: "Thanjavur", tamil: "தஞ்சாவூர்", lat: 10.7870, lng: 79.1378, tickets: 22 },
  { name: "Dindigul", tamil: "திண்டுக்கல்", lat: 10.3624, lng: 77.9695, tickets: 7 },
  { name: "Kancheepuram", tamil: "காஞ்சிபுரம்", lat: 12.8342, lng: 79.7036, tickets: 33 },
  { name: "Tiruppur", tamil: "திருப்பூர்", lat: 11.1085, lng: 77.3411, tickets: 19 },
  { name: "Thoothukudi", tamil: "தூத்துக்குடி", lat: 8.7642, lng: 78.1348, tickets: 24 },
  { name: "Nagercoil", tamil: "நாகர்கோவில்", lat: 8.1833, lng: 77.4119, tickets: 15 },
  { name: "Cuddalore", tamil: "கடலூர்", lat: 11.7480, lng: 79.7714, tickets: 11 },
  { name: "Villupuram", tamil: "விழுப்புரம்", lat: 11.9398, lng: 79.4862, tickets: 8 },
  { name: "Nagapattinam", tamil: "நாகப்பட்டினம்", lat: 10.7672, lng: 79.8449, tickets: 16 },
  { name: "Dharmapuri", tamil: "தர்மபுரி", lat: 12.1278, lng: 78.1584, tickets: 6 },
  { name: "Krishnagiri", tamil: "கிருஷ்ணகிரி", lat: 12.5186, lng: 78.2137, tickets: 14 },
  { name: "Namakkal", tamil: "நாமக்கல்", lat: 11.2189, lng: 78.1673, tickets: 10 },
  { name: "Karur", tamil: "கரூர்", lat: 10.9578, lng: 78.0777, tickets: 13 },
  { name: "Pudukkottai", tamil: "புதுக்கோட்டை", lat: 10.3797, lng: 78.8208, tickets: 20 },
  { name: "Sivaganga", tamil: "சிவகங்கை", lat: 9.8433, lng: 78.4833, tickets: 17 },
  { name: "Virudhunagar", tamil: "விருதுநகர்", lat: 9.5680, lng: 77.9624, tickets: 21 },
  { name: "Ramanathapuram", tamil: "ராமநாதபுரம்", lat: 9.3639, lng: 78.8394, tickets: 9 },
  { name: "Theni", tamil: "தேனி", lat: 10.0104, lng: 77.4768, tickets: 12 },
  { name: "Nilgiris", tamil: "நீலகிரி", lat: 11.4167, lng: 76.6944, tickets: 5 },
  { name: "Perambalur", tamil: "பெரம்பலூர்", lat: 11.2333, lng: 78.8833, tickets: 8 },
  { name: "Ariyalur", tamil: "அரியலூர்", lat: 11.1394, lng: 79.0728, tickets: 7 },
  { name: "Tiruvarur", tamil: "திருவாரூர்", lat: 10.7714, lng: 79.6381, tickets: 11 },
  { name: "Tiruvannamalai", tamil: "திருவண்ணாமலை", lat: 12.2253, lng: 79.0747, tickets: 25 },
  { name: "Kallakurichi", tamil: "கள்ளக்குறிச்சி", lat: 11.7383, lng: 78.9639, tickets: 9 },
  { name: "Ranipet", tamil: "ராணிப்பேட்டை", lat: 12.9275, lng: 79.3328, tickets: 7 },
  { name: "Tenkasi", tamil: "தென்காசி", lat: 8.9593, lng: 77.3150, tickets: 13 },
  { name: "Chengalpattu", tamil: "செங்கல்பட்டு", lat: 12.6841, lng: 79.9836, tickets: 18 },
  { name: "Mayiladuthurai", tamil: "மயிலாடுதுறை", lat: 11.1018, lng: 79.6517, tickets: 10 },
  { name: "Tirupattur", tamil: "திருப்பத்தூர்", lat: 12.4939, lng: 78.5678, tickets: 6 },
  { name: "Harur", tamil: "ஹாரூர்", lat: 12.0620, lng: 78.4842, tickets: 4 }
];

/* ─── Citizen Ward Coordinates (Local Ward Markers in Chennai) ─────── */
const citizenWards = [
  { name: "Ward 142 (Anna Nagar)", tamil: "வார்டு 142 (அண்ணா நகர்)", lat: 13.0827, lng: 80.2707, tickets: 85, isUserWard: true },
  { name: "Ward 141 (Kilpauk)", tamil: "வார்டு 141 (கீழ்ப்பாக்கம்)", lat: 13.095, lng: 80.285, tickets: 42 },
  { name: "Ward 143 (Nungambakkam)", tamil: "வார்டு 143 (நுங்கம்பாக்கம்)", lat: 13.065, lng: 80.255, tickets: 19 },
  { name: "Ward 140 (Tondiarpet)", tamil: "வார்டு 140 (தண்டையார்பேட்டை)", lat: 13.115, lng: 80.295, tickets: 12 },
  { name: "Ward 144 (T. Nagar)", tamil: "வார்டு 144 (தி. நகர்)", lat: 13.045, lng: 80.245, tickets: 28 }
];

/* ─── Color Helper ─────────────────────────────────────────── */
const getColor = (tickets) => {
  if (tickets > 50) return '#F44336'; // Red
  if (tickets >= 20) return '#FF9800'; // Orange
  return '#4CAF50'; // Green
};

/* ─── Hotspot districts/wards for live pulsing dots ───────────── */
const PULSE_LOCATIONS = ["Chennai", "Trichy", "Coimbatore", "Ward 142 (Anna Nagar)", "Ward 143 (Nungambakkam)"];

// Safe standard custom pulse icon setup for Leaflet
const pulseIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-pulse-icon',
  html: '<div class="pulse-marker"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
}) : null;

/* ─── Map Recenter Helper Component ───────────────────────────── */
function MapRecenter({ center, zoom = 8 }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   TnMap Component
   ═══════════════════════════════════════════════════════════════ */
export default function TnMap({ lang = 'en', citizenMode = false, height = '420px', zoom, center }) {
  const [selected, setSelected] = useState(null);

  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Choose correct dataset based on role mode
  const currentDataset = citizenMode ? citizenWards : districts;
  const initialCenter = center || (citizenMode ? [13.0827, 80.2707] : [10.8505, 78.6677]);
  const initialZoom = zoom !== undefined ? zoom : (citizenMode ? 10 : 7);
  const minZoom = citizenMode ? 8 : 6;
  const maxZoom = citizenMode ? 14 : 10;

  // Global calculations
  const TOTAL_TICKETS = currentDataset.reduce((s, d) => s + d.tickets, 0);
  const NEED_ATTENTION = currentDataset.filter(d => d.tickets > 20).length;

  const handleSelectItem = (item) => {
    setSelected(selected && selected.name === item.name ? null : item);
  };

  return (
    <div style={{ fontFamily: 'inherit', color: 'inherit' }}>
      
      {/* ══ 1. MAP HEADER (Only show in non-citizen portal maps to preserve mobile spacing) ══ */}
      {!citizenMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}>
          <div>
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#003366'
            }}>
              {tLabel('Tamil Nadu District Grievance Map', 'தமிழ்நாடு மாவட்ட புகார் வரைபடம்')}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {tLabel('Live ticket heatmap — click any district', 'நேரடி புகார் வரைபடம் — மாவட்டத்தை கிளிக் செய்யவும்')}
            </p>
          </div>

          {/* Legend pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { color: '#F44336', en: 'High (>50)', ta: 'அதி முக்கியம் (>50)' },
              { color: '#FF9800', en: 'Medium (20-50)', ta: 'நடுத்தரம் (20-50)' },
              { color: '#4CAF50', en: 'Low (<20)', ta: 'குறைவு (<20)' },
            ].map(({ color, en, ta }) => (
              <span key={en} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                background: color + '14',
                border: `1px solid ${color}50`,
                borderRadius: '20px',
                padding: '3px 10px',
                color,
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  display: 'inline-block'
                }} />
                {tLabel(en, ta)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══ 2. LEAFLET TILE MAP ══ */}
      <div className="tn-map-container" style={{
        background: '#eef2ff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,51,102,0.06)',
        position: 'relative'
      }}>
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          zoomControl={!citizenMode}
          scrollWheelZoom={false}
          style={{ height: height, width: '100%', borderRadius: '12px' }}
        >
          {/* Light styled free Carto tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
          />

          {/* Map panning recenter assistant */}
          {selected && <MapRecenter center={[selected.lat, selected.lng]} zoom={citizenMode ? 11 : 8} />}

          {/* Render markers */}
          {currentDataset.map((d) => {
            const isSel = selected && selected.name === d.name;
            const fillColor = getColor(d.tickets);
            const markerRadius = isSel ? 16 : Math.max(9, Math.min(22, 7 + d.tickets * 0.15));

            return (
              <CircleMarker
                key={d.name}
                center={[d.lat, d.lng]}
                radius={markerRadius}
                pathOptions={{
                  fillColor,
                  color: isSel ? '#8B1A1A' : 'white',
                  weight: isSel ? 3 : 1.5,
                  opacity: 1,
                  fillOpacity: isSel ? 0.9 : 0.7,
                }}
                eventHandlers={{
                  click: () => handleSelectItem(d)
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
                  <div style={{ minWidth: 140, padding: '6px 10px', fontFamily: 'inherit' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                      {isTa ? d.tamil : d.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      {d.tickets} {tLabel('open tickets', 'திறந்த புகார்கள்')}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: fillColor,
                      marginTop: 2,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {d.tickets > 50 
                        ? tLabel('High Priority', 'அதி முக்கியம்') 
                        : d.tickets > 20 
                          ? tLabel('Medium Priority', 'நடுத்தர முக்கியம்') 
                          : tLabel('Low Priority', 'குறைந்த முக்கியம்')}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Render 5 pulsing markers for live activity */}
          {pulseIcon && currentDataset.filter(d => PULSE_LOCATIONS.includes(d.name)).map((d) => (
            <Marker
              key={`pulse-${d.name}`}
              position={[d.lat, d.lng]}
              icon={pulseIcon}
              interactive={false}
            />
          ))}
        </MapContainer>
      </div>

      {/* ══ 3. SELECTED DETAIL PANEL ══ */}
      {selected && (
        <div style={{
          marginTop: '14px',
          background: 'white',
          border: `2px solid ${getColor(selected.tickets)}40`,
          borderLeft: `4px solid ${getColor(selected.tickets)}`,
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          position: 'relative',
          animation: 'fadeSlideDown 0.2s ease',
        }}>
          <style>{`@keyframes fadeSlideDown { from { opacity:0; transform:translateY(-8px);} to { opacity:1; transform:translateY(0);} }`}</style>

          {/* Close button */}
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              background: '#f1f5f9', border: 'none', borderRadius: '8px',
              width: '26px', height: '26px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 900, color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {/* Name & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                {isTa ? selected.tamil : selected.name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {tLabel(citizenMode ? 'Ward Grievance Summary' : 'District Grievance Summary', citizenMode ? 'வார்டு புகார் சுருக்கம்' : 'மாவட்ட புகார் சுருக்கம்')}
              </p>
            </div>
            <span style={{
              marginLeft: 'auto', marginRight: '32px',
              background: getColor(selected.tickets),
              color: 'white', borderRadius: '20px',
              padding: '4px 14px', fontSize: '13px', fontWeight: 900,
            }}>
              {selected.tickets} {tLabel('open', 'திறந்த')}
            </span>
          </div>

          {/* 3 Mini Stat Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: tLabel('Critical', 'முக்கியம்'), val: Math.round(selected.tickets * 0.1) || 1, color: '#F44336', bg: '#FFF5F5' },
              { label: tLabel('In Progress', 'நடவடிக்கை'), val: Math.round(selected.tickets * 0.4) || 2, color: '#FF9800', bg: '#FFFBF0' },
              { label: tLabel('Resolved', 'தீர்வு'), val: Math.round(selected.tickets * 1.8), color: '#4CAF50', bg: '#F0FFF4' },
            ].map(({ label: lbl, val, color, bg }) => (
              <div key={lbl} style={{
                background: bg, border: `1px solid ${color}30`,
                borderRadius: '12px', padding: '10px 12px', textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color }}>{val}</p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => toast.info(`${tLabel('Viewing all complaints for', 'புகார்கள் காண்க —')} ${isTa ? selected.tamil : selected.name}`)}
            style={{
              background: 'transparent',
              border: '2px solid #8B1A1A',
              color: '#8B1A1A',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => { e.target.style.background = '#8B1A1A'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#8B1A1A'; }}
          >
            {tLabel(citizenMode ? 'View Ward details' : 'View all complaints', citizenMode ? 'வார்டு விவரங்களை காண்க' : 'அனைத்து புகார்களையும் காண்க')} →
          </button>
        </div>
      )}

      {/* ══ 4. SUMMARY BAR (Only show in non-citizen portal) ══ */}
      {!citizenMode && (
        <div style={{
          marginTop: '14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}>
          {[
            { num: currentDataset.length, label: tLabel('Total Districts', 'மொத்த மாவட்டங்கள்') },
            { num: TOTAL_TICKETS, label: tLabel('Total Open Tickets', 'மொத்த திறந்த புகார்கள்') },
            { num: NEED_ATTENTION, label: tLabel('Need Attention', 'கவனம் தேவை') },
          ].map(({ num, label: lbl }) => (
            <div key={lbl} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#8B1A1A' }}>{num}</p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{lbl}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
