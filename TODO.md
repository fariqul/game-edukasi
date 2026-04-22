## Multiplayer Room Player List Implementation

### Status: ✅ In Progress

**Approved Plan:**
- Add player list display for host after room creation
- Max 8 players per room
- Live updates via room-sync messages
- Host-only view in #lobby-room-players frame

### Steps (0/7 completed):

#### 1. [ ] Create TODO.md ✅ **DONE**
#### 2. [ ] Update index.html - Add #lobby-room-players frame
#### 3. [ ] Update js/multiplayer.js - Add roomPlayers array & tracking
#### 4. [ ] Update js/multiplayer.js - Modify peer.on('connection') for multi-guest
#### 5. [ ] Update js/multiplayer.js - Add 'player-joined'/'room-update' messages
#### 6. [ ] Update js/multiplayer.js - Add showRoomPlayers() render function
#### 7. [ ] Test: Host creates room → Guest joins → Verify list shows both players

#### Post-Implementation:
- [ ] Add "Mulai Battle" button (host, >=2 players)
- [ ] Copy PIN button with toast
- [ ] Player avatars with Lottie hover
- [ ] Disconnect handling (remove from roomPlayers)
- [ ] attempt_completion

**Next Step:** Edit index.html to add room players UI frame.

