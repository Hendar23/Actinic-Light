Just my own attempt at making a mobile friendly space trading game.

All art made in MSPaint. Photoshop is a crutch.

## Running and testing

Serve this directory with a static web server, for example `python -m http.server 8000`, and open `index.html`. The game still runs without a build step. Its existing Tailwind CDN dependency requires internet access for styling.

Run the regression suite with Node 18 or newer:

```sh
node --test tests/*.test.cjs
```

There are no test dependencies to install. The browser-controller tests load scripts in the same order as the actual HTML, using a small DOM/storage harness. They test state and generated UI, not browser layout.

## Code layout

- `data.js`: existing game content, balance, ships, equipment and galaxy.
- `game-rules.js`: DOM-independent rules and atomic player actions. Equipment and ship previews are shared with purchase validation.
- `save-store.js`: save validation, V4 migration and recoverable persistence.
- `app.js`: browser controller, encounter navigation, world generation and state transitions. Actions save before rendering their results.
- `ui.js`: interface rendering and display helpers.
- `data-validator.js`: content-reference checks shared by the editor and tests.
- `Editor.html`: content editor. Exports preserve complete objects, including zero values and additional fields; invalid playable references block writes.

Keep new rewards and purchases in the rules layer, then apply them through the controller. Rendering a screen must not generate jobs or award items/XP. A quest reward belongs in `player.storage` before offering to equip it.

## Saves

The existing `spaceTraderSaveV4` key is retained. Old V4 saves are validated and migrated in memory; new saves use schema version 5. Loading never rewrites or deletes the source save. A previous valid snapshot is kept at `spaceTraderSaveV4Backup`, exposed through **Recover Previous Save** on the start screen.

New saves retain the current dialogue, generated job offers, combat opponent, hull, advantage and combat outcome. Reloading a finished fight restores its Continue/Game Over action without awarding its rewards again. Old V4 saves have no combat scene to recover and resume at their saved location.

Cancelling reward installation leaves the item in storage. New Game writes its initial state immediately. The existing Game Over action still ends the run and clears both saves.

The content validator currently reports one warning for the historical, unused `meet_frank` quest, which references Sol Taxis. Its bartender is not placed anywhere in the playable galaxy. This dormant content is retained rather than inventing a new destination or deleting authored material. If it is placed in the world again, its invalid destination becomes a blocking error.

## Manual smoke checks

1. Start a game, speak to Uncle Bob, reload during dialogue, then continue the conversation.
2. Complete either drive-reward path, choose Equip Now and Cancel, and verify the drive remains in storage after reload.
3. Try a smaller cargo bay with a full hold; check that cargo, credits and equipment are unchanged.
4. Reload during combat, after victory, and after defeat. Check hull, advantage, rewards and the continuation action.
5. Check market, outfitter and shipyard screens at narrow and wide viewport widths.
6. Open and save an unchanged project in the editor, then reload the resulting `data.js`.
