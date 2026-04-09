# MIGX Generator for MODX 3

Visual field builder for MIGX TV configuration. Generates Form Tabs JSON, Grid Columns JSON, chunk template and snippet call — directly in the MODX manager.

## Features

- **Visual builder** — add fields in a table instead of writing JSON manually
- **18 TV types** — text, textarea, richtext, image, file, hidden, checkbox, option, listbox, listbox-multiple, number, email, url, date, colorpicker, ace, migx, migxdb
- **Other TV reference** — use existing TV configurations via `inputTV`
- **Grid columns** — select which fields appear in the MIGX grid with renderers
- **10 renderers** — renderImage, renderDate, renderCrossTick, renderChunk, renderLimited, etc.
- **Chunk generator** — ready-to-use chunk template with placeholders
- **Snippet call** — `getImageList` call with correct TV name
- **Import** — parse existing JSON config back into the builder
- **i18n** — English and Russian interface
- No core files modified

## Installation

### Via Package Manager

1. Download the latest `.transport.zip` from [Releases](https://github.com/QupeDev/migxgenerator/releases)
2. Upload to `core/packages/` on your MODX site
3. Go to **Extras > Installer > Search locally** and install

### Manual

1. Copy `core/components/migxgenerator` to your MODX `core/components/`
2. Copy `assets/components/migxgenerator` to your MODX `assets/components/`
3. Create **Namespace** `migxgenerator`
4. Create **Plugin** `MIGXGenerator` with events:
   - `OnManagerPageBeforeRender`
   - `OnTVFormPrerender`

## Usage

1. Open any TV and set type to **migx**
2. Go to the **Input Options** tab
3. Click the **MIGX Generator** button
4. Add fields, configure types, grid columns and renderers
5. Click **Generate** — JSON is inserted into Form Tabs and Grid Columns fields
6. Copy the chunk template and snippet call from the result area

## Supported Field Properties

| Property | Description |
|----------|-------------|
| field | Field name (required) |
| caption | Display label |
| inputTVtype | TV input type |
| inputTV | Reference to existing TV by name |
| inputOptionValues | Options for listbox/checkbox/option (`Label==value\|\|Label2==value2`) |
| sourceFrom | Media source for image fields (migx/config/tv) |
| default | Default value |

## Building the Package

```bash
# Place repo in MODX root
php migxgenerator/_build/build.transport.php
```

## Requirements

- MODX Revolution 3.x
- MIGX 3.x
- PHP 7.4+

## Author

[Arahort](https://arahort.pro) (alex@arahort.pro)

## License

[MIT](LICENSE)
