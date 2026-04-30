---
document_id: DEMO-MOCKUP-SCREENS-HARV-HACK
title: Harvverse Demo - ASCII Screen Mockups (Real Data)
version: 1.0
fecha: 29 abril 2026
based_on:
    - 02_DEMO_NARRATIVE.md
    - 03_BLINDED_DATA.md
    - HVPLAN-ZAF-L02-2026.md
---

# Harvverse Demo - Screen-by-Screen Mockups

> Every dollar amount, yield number, oracle value and farmer name in this file is the BLINDED real data. Do not change without Jorge sign-off.

---

## Legend

```
[OK]   - validation passed / state on
[X]    - blocked / disabled
[...]  - streaming / loading
[---]  - placeholder / coming soon
( )    - radio off          (*)   - radio on
[ ]    - checkbox off       [v]   - checkbox on
>>     - primary CTA        >     - secondary CTA
```

---

## SCREEN 0 - Landing / Wallet Not Connected

State: First arrival. No wallet.

```
+==============================================================================+
| HARVVERSE                                              [ Connect Wallet ]    |
+==============================================================================+
|                                                                              |
|   Co-invest in real coffee farms.                                            |
|   60/40 profit share, verified by IoT, secured on-chain.                     |
|                                                                              |
|   >> Connect MetaMask to browse lots                                         |
|                                                                              |
|   First partnership shown: Zafiro Parainema, Comayagua Honduras              |
|   Validated by Jorge Alberto Lanza - Cup of Excellence 2013 Champion         |
|                                                                              |
+==============================================================================+
```

State change: Maria clicks Connect Wallet -> MetaMask popup -> account 0xAB...3F4 connects.

---

## SCREEN 1 - Catalog (Phase 1, ~30 sec)

State: Wallet connected. Catalog loaded. ZAF-L02 active, others coming soon.

```
+==============================================================================+
| HARVVERSE     Catalog   My Partnerships   Admin       0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|  Available Coffee Lots - Honduras                                            |
|                                                                              |
|  +-------------------------+  +-------------------------+                    |
|  |  [LOT IMAGE: Zafiro]    |  |  [LOT IMAGE: greyed]    |                    |
|  |                         |  |                         |                    |
|  |  ZAF-L02  [ AVAILABLE ] |  |  CMY-L05  [ SOON ]      |                    |
|  |  Zafiro Parainema       |  |  Marcala Catuai         |                    |
|  |  Comayagua, Honduras    |  |  La Paz, Honduras       |                    |
|  |  1,300 msnm | 1.0 mz    |  |  1,500 msnm | 1.5 mz    |                    |
|  |  Profile: C-Premium     |  |  Profile: B             |                    |
|  |                         |  |                         |                    |
|  |  Ticket: $3,425 USDC    |  |  Ticket: $5,140 USDC    |                    |
|  |  ROI 3y proj: 48%       |  |  ROI 3y proj: ---       |                    |
|  |                         |  |                         |                    |
|  |  Validated by:          |  |                         |                    |
|  |  Jorge A. Lanza (CoE'13)|  |                         |                    |
|  |                         |  |                         |                    |
|  |  >> View details        |  |  > Notify me            |                    |
|  +-------------------------+  +-------------------------+                    |
|                                                                              |
|  +-------------------------+                                                 |
|  |  [LOT IMAGE: greyed]    |                                                 |
|  |  COP-L11  [ SOON ]      |                                                 |
|  |  Copan Pacas            |                                                 |
|  |  ...                    |                                                 |
|  +-------------------------+                                                 |
|                                                                              |
+==============================================================================+
```

State change: Maria clicks "View details" on ZAF-L02.

---

## SCREEN 2 - Lot Detail Page (Phase 1 -> 2 transition)

State: ZAF-L02 detail. Configure button performs 4 silent validations (<2s).

```
+==============================================================================+
| HARVVERSE     Catalog > ZAF-L02                       0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|  Zafiro Parainema 1.0mz                                                      |
|  Lot code: HV-HN-ZAF-L02                                                     |
|                                                                              |
|  +--------------------------------+  +-----------------------------------+   |
|  |                                |  |  Quick facts                      |   |
|  |  [Lot photo: green coffee      |  |                                   |   |
|  |   plants, mountain backdrop,   |  |  Variety:    Parainema (Sarchimor)|   |
|  |   GPS pin overlay]             |  |  Altitude:   1,300 msnm (SHG)     |   |
|  |                                |  |  Area:       1.0 manzana (0.7 ha) |   |
|  |  Coordinates: 14.9465,-88.0863 |  |  Density:    ~5,000 plants/mz     |   |
|  |  Comayagua, Honduras           |  |  Shade:      30-40%               |   |
|  |                                |  |  Profile:    C-Premium            |   |
|  +--------------------------------+  |                                   |   |
|                                      |  Ticket:     $3,425 USDC (fixed)  |   |
|  Validation                          |  Type:       Phygital             |   |
|  - Cup of Excellence Honduras 2013   |  Cycle:      12 months / 6 mlstns |   |
|    Champion: Jorge A. Lanza (92.75)  |                                   |   |
|  - DR-039 + 23 peer-reviewed papers  |  Year-1 yield (plan):  6 qq       |   |
|  - Banco Atlantida fiduciary         |  Year-1 partner ROI:   $104       |   |
|                                      +-----------------------------------+   |
|                                                                              |
|                  >> Configure my investment                                  |
|                                                                              |
|  Validations running silently (debounce 3s, button stays gray until all OK): |
|     [OK] Wallet connected      [OK] Lot available                            |
|     [OK] n8n healthcheck       [OK] Plan loaded                              |
|                                                                              |
+==============================================================================+
```

State change: All 4 validations pass -> button turns green -> Maria clicks.

---

## SCREEN 3 - Phase 2.2: System Loads Plan + Oracles (~3 sec)

State: Three Chainlink toasts cascade in. Plan JSON pulled from API.

```
+==============================================================================+
| HARVVERSE     Configure: ZAF-L02                      0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|                                                                              |
|              [...] Loading agronomic plan HVPLAN-ZAF-L02-2026                |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
|                                                                              |
+==============================================================================+
   +----------------------------------------------------+
   | [ORACLE] Plan loaded from API (block #11,482,331)  |  <- toast 1
   +----------------------------------------------------+
   +----------------------------------------------------+
   | [ORACLE] Native/USD = $0.6125 (Chainlink Price Feed)|  <- toast 2
   +----------------------------------------------------+
   +----------------------------------------------------+
   | [ORACLE] Coffee spot = $3.48/lb (Chainlink Funcs)  |  <- toast 3
   +----------------------------------------------------+
```

State change: Toasts dismiss after 4s. AI Agent panel takes over.

---

## SCREEN 4 - Phase 2.3: AI Agent 4 Layers (WOW MOMENT #1, ~35-40 sec)

State: Streaming token-by-token. Maria CANNOT interrupt during the 4 layers.

### Layer 1 (5 sec)

```
+==============================================================================+
| HARVVERSE     Configure: ZAF-L02                      0xAB...3F4  [v]        |
+==============================================================================+
|                                                |  YOUR INVESTMENT (live)     |
|  +----------------------------------------+    |                             |
|  |  HARVVERSE AI AGENT                    |    |  Lot:        ZAF-L02        |
|  |  ----------------------------------    |    |  Area:       1.0 mz         |
|  |                                        |    |  Type:       Phygital       |
|  |  Hi Maria. I'm the Harvverse AI        |    |                             |
|  |  Agent. The plan you're looking at     |    |  Ticket:     $3,425 USDC    |
|  |  was designed by Jorge Alberto Lanza,  |    |  ----------                 |
|  |  Cup of Excellence Honduras 2013       |    |                             |
|  |  Champion with a record score of       |    |  Year-1 return:  $---       |
|  |  92.75 points. The protocol is backed  |    |  3-year ROI:     ---%       |
|  |  by 23+ peer-reviewed publications.[_] |    |                             |
|  |                                        |    |  [Pie chart placeholder]    |
|  |  Let me walk you through it.           |    |                             |
|  +----------------------------------------+    |  [3-year bars placeholder]  |
|                                                |                             |
|  [..streaming..]                               |                             |
+==============================================================================+
```

### Layer 2 (10-12 sec) - Pie chart animates

```
+==============================================================================+
|  +----------------------------------------+    |  YOUR INVESTMENT (live)     |
|  |  HARVVERSE AI AGENT                    |    |                             |
|  |                                        |    |  Ticket:  $3,425 USDC       |
|  |  Your ticket of $3,425 breaks down     |    |                             |
|  |  as follows:                           |    |     Breakdown               |
|  |                                        |    |   _______                   |
|  |  - $1,490 agronomic plan (43.5%)       |    |  /       \                  |
|  |  - $149 operational contingency (4.4%) |    |  | (pie  |  Plan    $1,490  |
|  |  - $164 Harvverse commission (4.8%)    |    |  |  in   |  Contig    $149  |
|  |  - $1,622 working capital, held in     |    |  |  fill)|  Comm      $164  |
|  |    fiduciary at Banco Atlantida        |    |  \_______/  Trust    $1,622 |
|  |    (47.4%)                             |    |                             |
|  |                                        |    |  Total:           $3,425    |
|  |  Harvverse never touches the money     |    |                             |
|  |  directly - that's a protocol          |    |  ($1,490 +                  |
|  |  principle.[_]                         |    |   $149 +                    |
|  +----------------------------------------+    |   $164 +                    |
|                                                |   $1,622 = $3,425 [OK])     |
+==============================================================================+
```

### Layer 3 (10 sec - HEART OF THE WOW) - Bars grow live

```
+==============================================================================+
|  +----------------------------------------+    |  3-YEAR PROJECTION          |
|  |  HARVVERSE AI AGENT                    |    |                             |
|  |                                        |    |  Y1                         |
|  |  These projections use live Chainlink  |    |  ##  $104                   |
|  |  oracle data. Coffee spot just         |    |                             |
|  |  confirmed at $3.48/lb. Your contract  |    |  Y2                         |
|  |  is protected by a $2.50/lb floor -    |    |  ############  $546         |
|  |  even in a market crash, the downside  |    |                             |
|  |  is bounded.                           |    |  Y3                         |
|  |                                        |    |  #####################      |
|  |  Year 1:  $104 partner return          |    |                  $993       |
|  |  Year 2:  $546 partner return          |    |                             |
|  |  Year 3:  $993 partner return          |    |  Total 3y:  $1,643          |
|  |  ----------------------------          |    |  ROI cum:   48%             |
|  |  Total 3 years: $1,643 on $3,425       |    |  ROI ann:   ~14%            |
|  |  = 48% cumulative, ~14% annualized.[_] |    |                             |
|  +----------------------------------------+    |  [ORACLE] Coffee = $3.48/lb |
|                                                |  [SHIELD] Floor = $2.50/lb  |
+==============================================================================+
```

### Layer 4 (5 sec)

```
+==============================================================================+
|  +----------------------------------------+    |  PHYGITAL BONUS             |
|  |  HARVVERSE AI AGENT                    |    |                             |
|  |                                        |    |  +-----------+              |
|  |  Profit share is 60/40, with no cap    |    |  |  COFFEE   |              |
|  |  on upside.                            |    |  |   BAG     |  5 lb        |
|  |                                        |    |  |  branded  |  Parainema   |
|  |  Plus, as a Phygital partner, you      |    |  |  Harvverse|  roasted     |
|  |  receive 5 pounds of roasted Parainema |    |  +-----------+  Medium      |
|  |  coffee delivered January 2027.        |    |                             |
|  |                                        |    |  Delivery:  Jan 2027        |
|  |  Ready to configure your options?      |    |  Roast:     Medium          |
|  |                                        |    |  SCA grade: 84.5 (target)   |
|  +----------------------------------------+    |                             |
|                                                |  [QR placeholder] -> chain  |
+==============================================================================+
```

State change: Maria can now interact (input unlocks, suggestions appear).

---

## SCREEN 5 - Phase 2.4 + 2.5: Configurable Options + What-If

State: Limited options visible. Conversational input live. Up to 5 iterations.

```
+==============================================================================+
| HARVVERSE     Configure: ZAF-L02                      0xAB...3F4  [v]        |
+==============================================================================+
|                                                |  CONFIG (read-only=fixed)   |
|  +----------------------------------------+    |                             |
|  |  HARVVERSE AI AGENT                    |    |  Ticket:    $3,425 [X fixed]|
|  |                                        |    |  Lot size:  1.0 mz [X fixed]|
|  |  Ready to configure your options?      |    |  Split:     60/40  [X fixed]|
|  |  Or ask me anything.                   |    |                             |
|  |                                        |    |  Partnership type:          |
|  +----------------------------------------+    |   ( ) Physical [---]        |
|                                                |   ( ) Digital  [---]        |
|  Suggestions:                                  |   (*) Phygital [active]     |
|   [ What if I choose another lot? ]            |                             |
|   [ What if the actual yield is 10 qq? ]       |  IoT tier (cosmetic):       |
|   [ Can I change the 60/40 split? ]            |   [v] Premium ON/OFF        |
|                                                |       (no impact on ticket) |
|  +----------------------------------------+    |                             |
|  |  Type your question...           [Send]|    |  ----------------------     |
|  +----------------------------------------+    |  Year-1 return:  $104       |
|                                                |  3-year ROI:     48%        |
|  Iterations remaining: 5                       |  Phygital:       5 lb       |
|                                                |                             |
|                                                |     >> Lock terms & review  |
+==============================================================================+
```

### State 5b: Maria clicked the "10 qq" suggestion (HIPOTETICO type)

```
+==============================================================================+
|  +----------------------------------------+    |  CONFIG (live what-if)      |
|  |  HARVVERSE AI AGENT                    |    |                             |
|  |                                        |    |  Hypothetical scenario:     |
|  |  Year 1 yield cap is 8 qq (Rule R1 -   |    |  Yield = 10 qq -> capped 8  |
|  |  gradual ramp-up). So if actual is     |    |                             |
|  |  10 qq, your contract distributes      |    |  Revenue:  8 x 83.3 x $3.50 |
|  |  on 8 qq.                              |    |          = $2,332           |
|  |                                        |    |  Cost:    -$1,490           |
|  |  Revenue = 8 x 83.3 x $3.50 = $2,332   |    |  Profit:   $842             |
|  |  Minus agro cost $1,490 = profit $842  |    |                             |
|  |  Your 40% share = $337                 |    |  Farmer 60%:    $505        |
|  |                                        |    |  Partner 40%:   $337        |
|  |  That's 3.2x the pessimistic           |    |                             |
|  |  projection.[_]                        |    |  vs Y1 plan:    $104 (3.2x) |
|  |                                        |    |                             |
|  +----------------------------------------+    |  Note: scenario only.       |
|                                                |  Contract still uses        |
|  Iterations remaining: 4                       |  pessimistic projection.    |
+==============================================================================+
```

### State 5c: Maria clicked "Change 60/40 split?" (FUERA_DE_SCOPE)

```
+==============================================================================+
|  +----------------------------------------+    |  CONFIG (unchanged)         |
|  |  HARVVERSE AI AGENT                    |    |                             |
|  |                                        |    |  Split is protocol-level    |
|  |  Split is protocol-level. Not          |    |  and cannot be modified     |
|  |  negotiable on individual contracts.   |    |  on individual contracts.   |
|  |                                        |    |                             |
|  |  Why: 60/40 is calibrated so the       |    |  Year-1 return:  $104       |
|  |  farmer keeps the majority of the      |    |  3-year ROI:     48%        |
|  |  upside on his own land. It's the      |    |                             |
|  |  core thesis of replacing debt         |    |  Want to compare other      |
|  |  with equity.                          |    |  lots? [Browse catalog]     |
|  +----------------------------------------+    |                             |
+==============================================================================+
```

State change: Maria clicks "Lock terms & review" -> full-screen modal opens.

---

## SCREEN 6 - Phase 2.6: Contract Preview Full-Screen

State: Full-screen (NOT centered modal - audience needs visibility). 8 sections.

```
+==============================================================================+
|                       CONTRACT PREVIEW - ZAF-L02                  [ Close X ]|
+==============================================================================+
|                                                                              |
|  1. EXECUTIVE SUMMARY                                                        |
|  -----------------------------------------------------------------------     |
|     Partner:           0xAB...3F4 (Maria, Miami)                             |
|     Farmer:            Jorge A. Lanza (Finca Zafiro)                         |
|     Lot:               HV-HN-ZAF-L02 - Parainema 1.0 mz - 1,300 msnm         |
|     Ticket:            $3,425 USDC on testnet                                |
|     Type:              Phygital (5 lb roasted, January 2027)                 |
|     Cycle:             Feb 2026 - Dec 2026 (12 months, 6 milestones)         |
|     Profit split:      60% farmer / 40% partner                              |
|                                                                              |
|  2. CONTRACTS TO BE DEPLOYED                                                 |
|  -----------------------------------------------------------------------     |
|     LotNFT.sol         ERC-721 with dynamic metadata - your "certificate"    |
|     MilestoneEscrow    Holds $3,425 USDC, releases per milestone             |
|     YieldDistributor   Settles 60/40 in one transaction                      |
|     (Plus FarmerScore + HarviToken already deployed.)                        |
|                                                                              |
|  3. MILESTONE SCHEDULE                                                       |
|  -----------------------------------------------------------------------     |
|     M1 Diagnostico       Feb        $110     released with M2                |
|     M2 Preparacion+Poda  Mar-Apr    $270     <- T0 release: $380             |
|     M3 Nutricion Base    Apr-May    $225     T2: +$225 = $605                |
|     M4 Mantenim+Sanidad  Jun-Aug    $175     T3: +$175 = $780                |
|     M5 Refuerzo+Pre-cos  Aug-Sep    $210     T4: +$210 = $990                |
|     M6 Cosecha+Benefic   Oct-Dec    $460     T5: +$460 = $1,450 + $40 IoT    |
|                                                                              |
|  4. CONTRACT MATH (Year 1, pessimistic)                                      |
|  -----------------------------------------------------------------------     |
|     Yield (plan):    6 qq pergamino                                          |
|     Conversion:      6 x 83.3 = 499.8 lb green                               |
|     Revenue:         499.8 x $3.50 = $1,749.30 (rounded $1,750)              |
|     Cost:            $1,490                                                  |
|     Profit:          $260                                                    |
|     Farmer (60%):    $156 USDC                                               |
|     Partner (40%):   $104 USDC                                               |
|                                                                              |
|  5. PHYGITAL DELIVERY                                                        |
|  -----------------------------------------------------------------------     |
|     5 lb Parainema specialty (medium roast)                                  |
|     SCA score target: >=82 (84.5 target on this lot)                         |
|     Ship: January 2027 (~30 days post M6)                                    |
|     Branded bag with QR -> blockchain traceability                           |
|                                                                              |
|  6. PROTECTION RULES (R1-R4)                                                 |
|  -----------------------------------------------------------------------     |
|     R1 Yield ceiling:    Y1=8qq | Y2=14qq | Y3=18qq | Y4+=22qq abs           |
|     R2 Yield floor:      Min 4 qq honored even in force majeure              |
|     R3 Price:            $3.50/lb fixed | $2.50/lb floor | no cap            |
|     R4 Upside:           60/40 on ALL profit, no separate excess formula     |
|                                                                              |
|  7. SEC DISCLAIMERS                                          [+ Expand]      |
|  -----------------------------------------------------------------------     |
|                                                                              |
|  8. GAS ESTIMATE                                                             |
|  -----------------------------------------------------------------------     |
|     Network:        Testnet (target chain TBD per HG-01)                     |
|     Gas est:        ~$0.0015 (paid in chain native gas)                      |
|     Approval:       USDC spend approval ($3,425) + deposit + mint            |
|                                                                              |
|                                            >> Confirm & Sign with MetaMask  |
|                                            >  Cancel                         |
+==============================================================================+
```

State change: Maria clicks Confirm & Sign -> MetaMask popup.

---

## SCREEN 7 - Phase 2.6 cont.: MetaMask Signature Popup

State: Real MetaMask extension popup (browser native, overlay).

```
                  +========================================+
                  | MetaMask                          [-X] |
                  +========================================+
                  |                                        |
                  |  Confirm transaction                    |
                  |                                        |
                  |  From:  0xAB...3F4 (Account 1)          |
                  |  To:    MilestoneEscrow.sol             |
                  |         0x7F...A21                       |
                  |                                        |
                  |  Function:  deposit(lotId, 3425000000)  |
                  |  Network:   Testnet                     |
                  |                                        |
                  |  Token transfer:                        |
                  |    -3,425 USDC                          |
                  |                                        |
                  |  Gas (estimated):                       |
                  |    ~$0.0015 (testnet gas)               |
                  |                                        |
                  |  Total:  3,425 USDC + gas               |
                  |                                        |
                  |  [ Reject ]              [ Confirm ]    |
                  +========================================+
```

State change: Maria confirms -> tx sent to chain -> 2 events fired:

1. MilestoneEscrow.deposit(lotId=2, amount=3425e6)
2. LotNFT.mint(to=0xAB...3F4, lotId=2, metadataURI=ipfs://...)

---

## SCREEN 8 - Phase 3: Funding Confirmation (~30 sec)

State: Tx confirmed. Hash visible. Link to block explorer.

```
+==============================================================================+
| HARVVERSE     Partnership signed!                     0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|                                                                              |
|              +----------+                                                    |
|              | [OK]     |   Partnership locked on-chain                      |
|              +----------+                                                    |
|                                                                              |
|     Lot:           ZAF-L02 - Zafiro Parainema 1.0 mz                         |
|     Tx hash:       0x9f3a...c12d                                             |
|     Block:         #11,482,451                                               |
|     Network:       Testnet                                                   |
|                                                                              |
|     >> View on block explorer                                                |
|                                                                              |
|     Your LotNFT #001 was minted to 0xAB...3F4                                |
|     Your $3,425 USDC is now in MilestoneEscrow custody                       |
|                                                                              |
|     T0 release fires now: $380 USDC -> Banco Atlantida fiduciary             |
|     for M1 (Diagnostico) + M2 (Poda) execution.                              |
|                                                                              |
|     Next milestone:  M2 expected ~Apr 2026                                   |
|                                                                              |
|     >> See dashboard            > Browse other lots                          |
+==============================================================================+
```

---

## SCREEN 9 - Phase 4-5: Monitoring Dashboard (briefly mentioned)

State: Maria's view across the 12-month cycle. Demo compresses this to seconds.

```
+==============================================================================+
| HARVVERSE     My Partnerships > ZAF-L02               0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|  Zafiro Parainema 1.0mz - Partnership #001                                   |
|  Status: IN EXECUTION                                                        |
|                                                                              |
|  Milestone progress:                                                         |
|                                                                              |
|     M1 Diagnostico       [v] Feb 2026    $110  signed off  +SCA test         |
|     M2 Preparacion+Poda  [v] Mar-Apr     $270  signed off  +photos before/   |
|                                                            after             |
|     M3 Nutricion Base    [v] Apr-May     $225  signed off  +IoT humidity     |
|     M4 Mant+Sanidad      [v] Jun-Aug     $175  signed off  +rust monitor     |
|     M5 Refuerzo+Pre-cos  [v] Aug-Sep     $210  signed off  +cherry photos    |
|     M6 Cosecha+Benefic   [.] Oct-Dec     $460  in progress +ferment IoT      |
|                                                                              |
|  IoT live (Finca Zafiro, last 24h):                                          |
|     Temp:       18-26 C  (range OK)                                          |
|     Humidity:   68%      (range OK)                                          |
|     Soil pH:    5.7      (range OK)                                          |
|     Cond:       1.1 dS/m (range OK)                                          |
|                                                                              |
|  ** DEMO NOTE: in real life this is 10 months. Stage skips ahead. **         |
|                                                                              |
+==============================================================================+
```

State change: Admin (Jorge) flips to admin panel to register harvest.

---

## SCREEN 10 - Phase 6.1: Admin Panel - Register Harvest

State: Admin role. Yield + SCA score input. Single button.

```
+==============================================================================+
| HARVVERSE  ADMIN  ZAF-L02 settlement                  0xAD...M1N  [v]        |
+==============================================================================+
|                                                                              |
|  Register harvest result - HV-HN-ZAF-L02                                     |
|                                                                              |
|  +-----------------------------------------------------------------+         |
|  |  Yield (qq pergamino):       [  6  ]                            |         |
|  |                              ^ within Y1 cap (8 qq) [OK]        |         |
|  |                                                                 |         |
|  |  SCA score:                  [ 84.5 ]                           |         |
|  |                              ^ specialty (>=80) [OK]            |         |
|  |                                                                 |         |
|  |  Notes:                                                         |         |
|  |  +------------------------------------------------+             |         |
|  |  | Clean cup, fermentation controlled.            |             |         |
|  |  | Chocolate + citric notes. Medium body.         |             |         |
|  |  +------------------------------------------------+             |         |
|  |                                                                 |         |
|  |  Evidence (auto-attached from IoT + photos):                    |         |
|  |    [v] Soil sensor history                                      |         |
|  |    [v] Fermentation curve (12-16h, pH 4.6 final)                |         |
|  |    [v] Cup of Excellence cupping certificate                    |         |
|  |    [v] Photos of 3 selective picks                              |         |
|  |                                                                 |         |
|  +-----------------------------------------------------------------+         |
|                                                                              |
|                                            >> Execute Settlement             |
|                                                                              |
|  Computed preview:                                                           |
|     Revenue = 6 x 83.3 x $3.50 = $1,750                                      |
|     Cost    = $1,490                                                         |
|     Profit  = $260                                                           |
|     Farmer 60% = $156   |   Partner 40% = $104                               |
|                                                                              |
+==============================================================================+
```

State change: Click "Execute Settlement" -> animation takes over the whole screen.

---

## SCREEN 11 - Phase 6.2: Settlement Animation (WOW MOMENT #2, ~45-60 sec)

State: Step-by-step animation. Big numbers. Audience-visible.

### Frame A (0-10 sec): Step 1 lights up

```
+==============================================================================+
|                  SETTLEMENT - ZAF-L02 - Year 1                               |
+==============================================================================+
|                                                                              |
|     Step 1   Revenue                                                         |
|     ------                                                                   |
|        6 qq  x  83.3 lb/qq  x  $3.50/lb                                      |
|                                                                              |
|        =  499.8 lb green  x  $3.50                                           |
|                                                                              |
|        =  $1,750                                                             |
|                                                                              |
|     Step 2   Cost                  [ ... ]                                   |
|     Step 3   Profit                [ ... ]                                   |
|     Step 4   Distribution          [ ... ]                                   |
|     Step 5   On-chain transfer     [ ... ]                                   |
|                                                                              |
+==============================================================================+
```

### Frame B (10-20 sec): Steps 1-3 done, step 4 lights up

```
+==============================================================================+
|                  SETTLEMENT - ZAF-L02 - Year 1                               |
+==============================================================================+
|                                                                              |
|     Step 1   Revenue        $1,750                                           |
|     Step 2   Cost          -$1,490                                           |
|     Step 3   Profit         $  260                                           |
|                                                                              |
|     Step 4   Distribution                                                    |
|     ----------------------                                                   |
|        Farmer 60%   =  $260 x 0.60  =  $156 USDC                             |
|        Partner 40%  =  $260 x 0.40  =  $104 USDC                             |
|                                                                              |
|     Step 5   On-chain transfer     [ ... ]                                   |
|                                                                              |
+==============================================================================+
```

### Frame C (20-40 sec): Step 5 - single tx fires

```
+==============================================================================+
|                  SETTLEMENT - ZAF-L02 - Year 1                               |
+==============================================================================+
|                                                                              |
|     Step 1-3 (collapsed)   Profit = $260                                     |
|     Step 4 (collapsed)     Farmer $156 / Partner $104                        |
|                                                                              |
|     Step 5   Single transaction -> both wallets                              |
|     ----------------------------------------------                           |
|                                                                              |
|        YieldDistributor.settle(lotId=2, yieldQQ=6, pricePerLb=350)           |
|                                                                              |
|        +-------------------+                                                 |
|        |                   |  ----> Farmer 0x4C...8B7   +$156 USDC           |
|        |  ONE Tx           |                                                 |
|        |  0xc8d2...e91a    |  ----> Partner 0xAB...3F4  +$104 USDC           |
|        |                   |                                                 |
|        +-------------------+  ----> LotNFT #001 metadata updated             |
|                                                                              |
|        Block:    #11,495,118                                                 |
|        Gas:      ~$0.0019 (testnet)                                          |
|                                                                              |
|        >> View on block explorer                                             |
|                                                                              |
+==============================================================================+
```

State change: ~5 sec wait -> MetaMask of partner pops automatically.

---

## SCREEN 12 - Phase 6.3: USDC Lands in Partner Wallet (PROOF)

State: MetaMask extension shows balance change. Visual proof.

```
                  +========================================+
                  | MetaMask  -  Account 1                  |
                  +========================================+
                  |                                        |
                  |  0xAB...3F4 (Maria)                     |
                  |  Testnet                                |
                  |                                        |
                  |  Tokens                                 |
                  |  -------------------------------------- |
                  |                                        |
                  |  USDC                                   |
                  |    Before:    1,234.00 USDC             |
                  |    Now:       1,338.00 USDC   (+104.00) |
                  |                                        |
                  |  Native gas token                       |
                  |    9.9931         (-0.0024 gas)         |
                  |                                        |
                  |                                        |
                  |  NFTs                                   |
                  |  -------------------------------------- |
                  |  LotNFT #001 - Zafiro Parainema [updated]|
                  |                                        |
                  |  >> View activity                       |
                  +========================================+
```

State change: Maria clicks the LotNFT to see metadata refresh.

---

## SCREEN 13 - Phase 6.4: LotNFT Metadata Updated

State: Dynamic metadata reflects post-settlement state.

```
+==============================================================================+
|  LotNFT #001 - HV-HN-ZAF-L02                                                 |
+==============================================================================+
|                                                                              |
|  +--------------------------+   Properties                                   |
|  |                          |   ----------------------------------------    |
|  |  [Lot illustration:      |   Variety:        Parainema                    |
|  |   coffee plants on       |   Origin:         Comayagua, Honduras          |
|  |   mountain, Harvverse    |   Altitude:       1,300 msnm                   |
|  |   logo, status badge:    |   Area:           1.0 manzana                  |
|  |   COMPLETED]             |   Profile:        C-Premium                    |
|  |                          |                                                |
|  |                          |   Cycle year:     2026                         |
|  |                          |   Status:         COMPLETED                    |
|  +--------------------------+                                                |
|                                                                              |
|  Performance (Year 1)                                                        |
|  -------------------------------------------                                 |
|     Yield (final):      6 qq pergamino                                       |
|     SCA score:          84.5                                                 |
|     Revenue:            $1,750                                               |
|     Cost:               $1,490                                               |
|     Profit:             $260                                                 |
|     Partner return:     $104 USDC  (received)                                |
|     Settlement date:    2026-12-22 17:43 UTC                                 |
|     Settlement tx:      0xc8d2...e91a                                        |
|                                                                              |
|  Phygital (pending)                                                          |
|  -------------------------------------------                                 |
|     5 lb Parainema, medium roast                                             |
|     ETA: January 2027                                                        |
|                                                                              |
|  Validation                                                                  |
|  -------------------------------------------                                 |
|     Validator: Jorge A. Lanza, CoE 2013 Champion                             |
|     Backed by: DR-039 + 23 peer-reviewed publications                        |
|                                                                              |
+==============================================================================+
```

---

## SCREEN 14 - Phase 6.5: Post-Settlement Dashboard

State: Final summary. Renew button visible but disabled (roadmap, not in demo).

```
+==============================================================================+
| HARVVERSE     Partnership #001 - SETTLED              0xAB...3F4  [v]        |
+==============================================================================+
|                                                                              |
|     Cycle complete - ZAF-L02 Year 1                                          |
|                                                                              |
|     +------------------------------+                                         |
|     |  $104.00 USDC received       |                                         |
|     +------------------------------+                                         |
|                                                                              |
|     ROI year 1:           3.0%  (deliberately pessimistic)                   |
|     ROI projection 3y:    48% cumulative / ~14% annualized                   |
|                                                                              |
|     Phygital:                                                                |
|        5 lb Parainema medium roast                                           |
|        SCA 84.5                                                              |
|        Scheduled for delivery: January 2027     [Confirmed]                  |
|                                                                              |
|     Farmer share paid:    $156 USDC -> 0x4C...8B7                            |
|     HARVI points earned:  260 HARVI (1:1 with profit)                        |
|                                                                              |
|     Verifiable on-chain                                                      |
|     -------------------------------------                                    |
|        Settlement tx:    0xc8d2...e91a                                       |
|        LotNFT updated:   #001 (status: COMPLETED)                            |
|        Block explorer:        >> Open                                        |
|        Chainlink data used:   Native/USD + Coffee spot                       |
|                                                                              |
|     +-----------------------------+    +-----------------------------+       |
|     |  > Renew Contract  [X soon] |    |  >> Explore other lots      |       |
|     +-----------------------------+    +-----------------------------+       |
|                                                                              |
+==============================================================================+
```

---

## Notes for the team

1. **Numbers are blinded.** Anything in this file that's a dollar figure, yield, oracle value or hash format is canonical per `03_BLINDED_DATA.md` + `HVPLAN-ZAF-L02-2026.md`. Tx hashes (`0x9f3a...c12d`, `0xc8d2...e91a`) are placeholders to be replaced with the real ones from the rehearsal run.

2. **Wallets used in mockups:**

    - `0xAB...3F4` -> Partner (Maria) - opens MetaMask on stage
    - `0x4C...8B7` -> Farmer (Don Jorge) - receives but never opens
    - `0xAD...M1N` -> Admin/Operator - drives Phase 6.1

3. **AI Agent text is verbatim** from `02_DEMO_NARRATIVE.md` 2.3 (L1-L4) and 2.5 (the 10 qq response). Do not paraphrase on stage.

4. **Toasts and oracle values** ($3.48/lb coffee, native/USD $0.6125) come from the live Chainlink calls. If oracle fails, fall back to cached values (see `02_DEMO_NARRATIVE.md` principle #5).

5. **Chain is intentionally not named.** Per `04_ARCHITECTURE.md` chain-config requirement (REQ-HARV-NFR-010) and HG-01, the target EVM chain is decided Monday 5 May in Miami. Mockups use generic terms (`testnet`, `block explorer`, `native gas`, `Native/USD price feed`) so they survive the migration. When the chain locks, do a global find/replace to swap in the real labels.

6. **Two and only two wow screens:** Screen 4 (AI Agent 4 layers) and Screen 11 (settlement animation). Everything else is supporting context.

7. **Compressed time:** Screen 9 represents ~10 real-world months; on stage it's a ~3 second skip with Jorge's voiceover ("In real life, these milestones unfold over 10 months...").
