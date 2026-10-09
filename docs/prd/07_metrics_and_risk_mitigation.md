# RouteLine — Success Metrics & Risk Mitigation

## 1. Key Performance Indicators (KPIs)

| Metric | Target Goal | Measurement Mechanism |
|:---|:---|:---|
| **Search-to-Booking Conversion Rate** | $\ge 12\%$ | Funnel analytics from homepage search to ERS generation |
| **API Cache Hit Ratio** | $\ge 65\%$ | Internal caching analytics on RailRadar API requests |
| **Page Speed Index** | $< 1.2\text{s}$ | Google Lighthouse & Chrome Web Vitals audits |
| **Booking Flow Completion Time** | $< 45\text{s}$ | Timestamp delta from train selection to ticket issuance |
| **Customer CSAT Score** | $\ge 4.7 / 5.0$ | Post-booking and post-journey feedback surveys |

## 2. Risk Matrix & Mitigation Strategies

| Risk Factor | Probability | Impact | Mitigation Strategy |
|:---|:---:|:---:|:---|
| **RailRadar API Rate Limiting** | High | High | Implement local in-memory TTL caching (45s), fallback mock dataset generators, and background polling. |
| **Network Latency on 3G/4G** | Moderate | Medium | Minify CSS/JS payloads, optimize SVG icons, defer non-critical scripts, and enable HTTP/2 asset compression. |
| **Browser Storage Eviction** | Low | High | Synchronize local ticket data with cloud backend database in Phase 5; provide export to JSON/PDF options. |
| **IRCTC Quota Changes** | High | High | Abstract ticketing logic behind adapter pattern to support IRCTC direct partner APIs and alternative aggregators. |
