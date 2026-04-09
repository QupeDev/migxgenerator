/**
 * MIGX Generator — visual field builder for MIGX TV configuration.
 * Injects a "MIGX Generator" button into the TV input options panel
 * when the TV type is "migx".
 */
var MIGXGenerator = {
    tvTypes: [
        ['text','text'],['textarea','textarea'],['richtext','richtext'],
        ['image','image'],['file','file'],['hidden','hidden'],
        ['checkbox','checkbox'],['option','option (radio)'],
        ['listbox','listbox'],['listbox-multiple','listbox-multiple'],
        ['number','number'],['email','email'],['url','url'],['date','date'],
        ['colorpicker','colorpicker'],['ace','ace'],
        ['migx','migx'],['migxdb','migxdb']
    ],
    renderers: [
        ['','—'],
        ['this.renderImage','renderImage'],
        ['this.renderDate','renderDate'],
        ['this.renderCrossTick','renderCrossTick'],
        ['this.renderClickCrossTick','renderClickCrossTick'],
        ['this.renderChunk','renderChunk'],
        ['this.renderLimited','renderLimited'],
        ['this.renderPlaceholder','renderPlaceholder'],
        ['this.renderFirst','renderFirst'],
        ['this.renderImageFromHtml','renderImageFromHtml']
    ],
    sourceFromOpts: [
        ['','—'],['migx','migx'],['config','config'],['tv','tv']
    ],
    rowId: 0,
    /* Find elements by name attribute (IDs have TV id suffix) */
    getEl: function(name) {
        return document.querySelector('[name="' + name + '"]')
    },
    getFormtabsEl: function() { return MIGXGenerator.getEl('inopt_formtabs') },
    getColumnsEl: function() { return MIGXGenerator.getEl('inopt_columns') },
    init: function() {
        MIGXGenerator.watchTypeChange()
        MIGXGenerator.checkAndInject()
    },
    watchTypeChange: function() {
        var typeField = Ext.getCmp('modx-tv-type')
        if (!typeField) return
        typeField.on('select', function() {
            setTimeout(function() { MIGXGenerator.checkAndInject() }, 800)
        })
    },
    checkAndInject: function() {
        var typeField = Ext.getCmp('modx-tv-type')
        if (!typeField) return
        if (typeField.getValue() !== 'migx') return
        MIGXGenerator.waitForFormtabs()
    },
    waitForFormtabs: function(attempts) {
        attempts = attempts || 0
        if (attempts > 30) return
        var el = MIGXGenerator.getFormtabsEl()
        if (el) {
            if (!document.getElementById('migxgen-btn')) {
                MIGXGenerator.injectButton(el)
            }
            return
        }
        setTimeout(function() { MIGXGenerator.waitForFormtabs(attempts + 1) }, 300)
    },
    injectButton: function(formtabsEl) {
        var wrap = formtabsEl.closest('.x-form-item') || formtabsEl.parentNode
        var btn = document.createElement('button')
        btn.type = 'button'
        btn.id = 'migxgen-btn'
        btn.className = 'x-btn migxgen-btn'
        btn.textContent = _('migxgenerator.btn_generator')
        btn.onclick = function(e) { e.preventDefault(); MIGXGenerator.openWindow() }
        wrap.parentNode.insertBefore(btn, wrap)
    },
    /* ---- Window ---- */
    openWindow: function() {
        if (MIGXGenerator.win && !MIGXGenerator.win.isDestroyed) {
            MIGXGenerator.win.show()
            return
        }
        MIGXGenerator.rowId = 0
        var html = MIGXGenerator.buildHTML()
        var win = new Ext.Window({
            title: _('migxgenerator.title'),
            width: 960,
            autoHeight: true,
            maxHeight: 600,
            autoScroll: true,
            modal: true,
            closable: true,
            closeAction: 'hide',
            html: html,
            listeners: {
                afterrender: function() {
                    MIGXGenerator.bindEvents()
                    MIGXGenerator.autoImport()
                }
            }
        })
        win.show()
        MIGXGenerator.win = win
    },
    autoImport: function() {
        var ftEl = MIGXGenerator.getFormtabsEl()
        if (ftEl && ftEl.value.trim().length > 2) {
            MIGXGenerator.importFromJSON()
        } else {
            MIGXGenerator.addRow()
        }
    },
    buildHTML: function() {
        return '<div style="padding:10px">'
            + '<table class="migxgen-table"><thead><tr>'
            + '<th class="migxgen-col-field">' + _('migxgenerator.field') + '</th>'
            + '<th class="migxgen-col-caption">' + _('migxgenerator.caption') + '</th>'
            + '<th class="migxgen-col-type">' + _('migxgenerator.input_tv_type') + '</th>'
            + '<th class="migxgen-col-options">' + _('migxgenerator.input_option_values') + '</th>'
            + '<th class="migxgen-col-source">' + _('migxgenerator.source_from') + '</th>'
            + '<th class="migxgen-col-default">' + _('migxgenerator.default_value') + '</th>'
            + '<th class="migxgen-col-grid">' + _('migxgenerator.show_in_grid') + '</th>'
            + '<th class="migxgen-col-sort">' + _('migxgenerator.sortable') + '</th>'
            + '<th class="migxgen-col-renderer">' + _('migxgenerator.renderer') + '</th>'
            + '<th class="migxgen-col-actions"></th>'
            + '</tr></thead><tbody id="migxgen-tbody"></tbody></table>'
            + '<div class="migxgen-toolbar">'
            + '<button type="button" class="x-btn" id="migxgen-add">' + _('migxgenerator.add_field') + '</button>'
            + '<button type="button" class="x-btn" id="migxgen-import">' + _('migxgenerator.import') + '</button>'
            + '<button type="button" class="x-btn x-btn-primary" id="migxgen-generate">' + _('migxgenerator.generate') + '</button>'
            + '<span class="migxgen-tab-caption">'
            + '<label>' + _('migxgenerator.tab_caption') + ':</label>'
            + '<input type="text" id="migxgen-tab-caption" value="MIGX" />'
            + '</span>'
            + '</div>'
            + '<div id="migxgen-result" class="migxgen-result-area migxgen-hidden"></div>'
            + '</div>'
    },
    bindEvents: function() {
        var addBtn = document.getElementById('migxgen-add')
        var importBtn = document.getElementById('migxgen-import')
        var genBtn = document.getElementById('migxgen-generate')
        if (addBtn) addBtn.onclick = function() { MIGXGenerator.addRow() }
        if (importBtn) importBtn.onclick = function() { MIGXGenerator.importFromJSON() }
        if (genBtn) genBtn.onclick = function() { MIGXGenerator.generate() }
    },
    /* ---- Row management ---- */
    buildTypeSelect: function(id, val) {
        var opts = '<option value="_tv_"' + (val === '_tv_' ? ' selected' : '') + '>— ' + _('migxgenerator.type_mode_tv') + ' —</option>'
        for (var i = 0; i < MIGXGenerator.tvTypes.length; i++) {
            var t = MIGXGenerator.tvTypes[i]
            opts += '<option value="' + t[0] + '"' + (t[0] === val ? ' selected' : '') + '>' + t[1] + '</option>'
        }
        return '<select id="mgtype-' + id + '" onchange="MIGXGenerator.onTypeChange(' + id + ')">' + opts + '</select>'
            + '<input type="text" id="mgtv-' + id + '" placeholder="TV name" class="migxgen-hidden" style="margin-top:2px" />'
    },
    buildRendererSelect: function(id, val) {
        var opts = ''
        for (var i = 0; i < MIGXGenerator.renderers.length; i++) {
            var r = MIGXGenerator.renderers[i]
            opts += '<option value="' + r[0] + '"' + (r[0] === val ? ' selected' : '') + '>' + r[1] + '</option>'
        }
        return '<select id="mgrend-' + id + '">' + opts + '</select>'
    },
    buildSourceSelect: function(id, val) {
        var opts = ''
        for (var i = 0; i < MIGXGenerator.sourceFromOpts.length; i++) {
            var s = MIGXGenerator.sourceFromOpts[i]
            opts += '<option value="' + s[0] + '"' + (s[0] === val ? ' selected' : '') + '>' + s[1] + '</option>'
        }
        return '<select id="mgsrc-' + id + '">' + opts + '</select>'
    },
    addRow: function(data) {
        data = data || {}
        var id = MIGXGenerator.rowId++
        var isTV = data._isTv || false
        var typeVal = isTV ? '_tv_' : (data.inputTVtype || 'text')
        var tr = document.createElement('tr')
        tr.id = 'mgrow-' + id
        tr.innerHTML =
            '<td><input type="text" id="mgfield-' + id + '" value="' + (data.field || '') + '"/></td>'
            + '<td><input type="text" id="mgcap-' + id + '" value="' + (data.caption || '') + '"/></td>'
            + '<td>' + MIGXGenerator.buildTypeSelect(id, typeVal) + '</td>'
            + '<td><input type="text" id="mgopts-' + id + '" value="' + (data.inputOptionValues || '').replace(/"/g, '&quot;') + '" placeholder="A==1||B==2"/></td>'
            + '<td>' + MIGXGenerator.buildSourceSelect(id, data.sourceFrom || '') + '</td>'
            + '<td><input type="text" id="mgdef-' + id + '" value="' + (data['default'] || '') + '"/></td>'
            + '<td><input type="checkbox" id="mggrid-' + id + '"' + (data.showInGrid !== false ? ' checked' : '') + '/></td>'
            + '<td><input type="checkbox" id="mgsort-' + id + '"' + (data.sortable ? ' checked' : '') + '/></td>'
            + '<td>' + MIGXGenerator.buildRendererSelect(id, data.renderer || '') + '</td>'
            + '<td><button type="button" class="migxgen-remove-btn" onclick="MIGXGenerator.removeRow(' + id + ')">&times;</button></td>'
        document.getElementById('migxgen-tbody').appendChild(tr)
        if (isTV) {
            var tvInput = document.getElementById('mgtv-' + id)
            var typeSelect = document.getElementById('mgtype-' + id)
            if (tvInput) { tvInput.value = data.inputTV || ''; tvInput.className = '' }
            if (typeSelect) typeSelect.value = '_tv_'
        }
        MIGXGenerator.onTypeChange(id)
        if (MIGXGenerator.win) MIGXGenerator.win.syncSize()
    },
    removeRow: function(id) {
        var row = document.getElementById('mgrow-' + id)
        if (row) row.remove()
    },
    onTypeChange: function(id) {
        var sel = document.getElementById('mgtype-' + id)
        var tvField = document.getElementById('mgtv-' + id)
        if (!sel || !tvField) return
        if (sel.value === '_tv_') {
            tvField.className = ''
        } else {
            tvField.className = 'migxgen-hidden'
            tvField.value = ''
        }
    },
    /* ---- Import ---- */
    importFromJSON: function() {
        var formtabsEl = MIGXGenerator.getFormtabsEl()
        var columnsEl = MIGXGenerator.getColumnsEl()
        if (!formtabsEl) return
        var formtabs, columns
        try { formtabs = JSON.parse(formtabsEl.value) } catch (e) { formtabs = [] }
        try { columns = JSON.parse(columnsEl ? columnsEl.value : '[]') } catch (e) { columns = [] }
        var colMap = {}
        if (Array.isArray(columns)) {
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].dataIndex) colMap[columns[i].dataIndex] = columns[i]
            }
        }
        document.getElementById('migxgen-tbody').innerHTML = ''
        MIGXGenerator.rowId = 0
        if (!Array.isArray(formtabs) || formtabs.length === 0) return
        var tab = formtabs[0]
        var tabCapEl = document.getElementById('migxgen-tab-caption')
        if (tabCapEl && tab.caption) tabCapEl.value = tab.caption
        var fields = tab.fields || []
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i]
            var col = colMap[f.field] || {}
            var isTV = !f.inputTVtype && !!f.inputTV
            MIGXGenerator.addRow({
                field: f.field || '',
                caption: f.caption || '',
                _isTv: isTV,
                inputTVtype: f.inputTVtype || 'text',
                inputTV: f.inputTV || '',
                inputOptionValues: f.inputOptionValues || '',
                sourceFrom: f.sourceFrom || '',
                'default': f['default'] || '',
                showInGrid: !!colMap[f.field],
                sortable: col.sortable === 'true',
                renderer: col.renderer || ''
            })
        }
    },
    /* ---- Generate ---- */
    getRows: function() {
        var tbody = document.getElementById('migxgen-tbody')
        if (!tbody) return []
        var rows = []
        var trs = tbody.getElementsByTagName('tr')
        for (var i = 0; i < trs.length; i++) {
            var tr = trs[i]
            var id = tr.id.replace('mgrow-', '')
            var typeVal = document.getElementById('mgtype-' + id).value
            rows.push({
                field: document.getElementById('mgfield-' + id).value.trim(),
                caption: document.getElementById('mgcap-' + id).value.trim(),
                isTV: typeVal === '_tv_',
                inputTVtype: typeVal !== '_tv_' ? typeVal : '',
                inputTV: document.getElementById('mgtv-' + id).value.trim(),
                inputOptionValues: document.getElementById('mgopts-' + id).value.trim(),
                sourceFrom: document.getElementById('mgsrc-' + id).value,
                'default': document.getElementById('mgdef-' + id).value.trim(),
                showInGrid: document.getElementById('mggrid-' + id).checked,
                sortable: document.getElementById('mgsort-' + id).checked,
                renderer: document.getElementById('mgrend-' + id).value
            })
        }
        return rows
    },
    generate: function() {
        var rows = MIGXGenerator.getRows()
        if (rows.length === 0) { alert(_('migxgenerator.err_no_fields')); return }
        for (var i = 0; i < rows.length; i++) {
            if (!rows[i].field) { alert(_('migxgenerator.err_empty_field')); return }
        }
        var tabCaption = (document.getElementById('migxgen-tab-caption') || {}).value || 'MIGX'
        /* Build formtabs */
        var fields = []
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i]
            var f = { field: r.field, caption: r.caption }
            if (r.isTV && r.inputTV) {
                f.inputTV = r.inputTV
            } else if (r.inputTVtype) {
                f.inputTVtype = r.inputTVtype
            }
            if (r.inputOptionValues) f.inputOptionValues = r.inputOptionValues
            if (r.sourceFrom) f.sourceFrom = r.sourceFrom
            if (r['default']) f['default'] = r['default']
            fields.push(f)
        }
        var formtabs = [{ caption: tabCaption, fields: fields }]
        /* Build columns */
        var columns = []
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i]
            if (!r.showInGrid) continue
            var col = { header: r.caption || r.field, dataIndex: r.field, sortable: r.sortable ? 'true' : 'false' }
            if (r.renderer) col.renderer = r.renderer
            var type = r.isTV ? '' : r.inputTVtype
            if (type === 'image' && !r.renderer) col.renderer = 'this.renderImage'
            columns.push(col)
        }
        var formtabsJSON = JSON.stringify(formtabs, null, 2)
        var columnsJSON = JSON.stringify(columns, null, 2)
        /* Insert into TV form */
        var ftEl = MIGXGenerator.getFormtabsEl()
        var colEl = MIGXGenerator.getColumnsEl()
        if (ftEl) ftEl.value = formtabsJSON
        if (colEl) colEl.value = columnsJSON
        /* Build chunk */
        var chunkLines = []
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i]
            var type = r.isTV ? '' : r.inputTVtype
            if (type === 'image') {
                chunkLines.push('<img src="[[+' + r.field + ']]" alt="[[+' + r.field + ']]" />')
            } else if (type === 'richtext') {
                chunkLines.push('<div>[[+' + r.field + ']]</div>')
            } else {
                chunkLines.push('[[+' + r.field + ']]')
            }
        }
        var chunk = chunkLines.join('\n')
        /* Build snippet call */
        var tvName = ''
        var nameField = document.getElementById('modx-tv-name')
        if (nameField) tvName = nameField.value || 'migx_tv'
        var snippet = '[[!getImageList?\n'
            + '  &tvname=`' + tvName + '`\n'
            + '  &tpl=`' + tvName + '_tpl`\n'
            + '  &docid=`[[*id]]`\n'
            + ']]'
        /* Show result */
        MIGXGenerator.showResult(formtabsJSON, columnsJSON, chunk, snippet)
        /* Mark TV form dirty */
        var panel = Ext.getCmp('modx-panel-tv')
        if (panel) panel.markDirty()
    },
    showResult: function(formtabs, columns, chunk, snippet) {
        var area = document.getElementById('migxgen-result')
        if (!area) return
        area.className = 'migxgen-result-area'
        area.innerHTML =
            '<label>' + _('migxgenerator.chunk_template') + '</label>'
            + '<div class="migxgen-copy-wrap">'
            + '<textarea id="migxgen-chunk" rows="6" readonly>' + MIGXGenerator.escHtml(chunk) + '</textarea>'
            + '<button type="button" class="migxgen-copy-btn" onclick="MIGXGenerator.copyText(\'migxgen-chunk\')">' + _('migxgenerator.copy') + '</button>'
            + '</div>'
            + '<label>' + _('migxgenerator.snippet_call') + '</label>'
            + '<div class="migxgen-copy-wrap">'
            + '<textarea id="migxgen-snippet" rows="5" readonly>' + MIGXGenerator.escHtml(snippet) + '</textarea>'
            + '<button type="button" class="migxgen-copy-btn" onclick="MIGXGenerator.copyText(\'migxgen-snippet\')">' + _('migxgenerator.copy') + '</button>'
            + '</div>'
        if (MIGXGenerator.win) MIGXGenerator.win.syncSize()
    },
    escHtml: function(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    },
    copyText: function(id) {
        var el = document.getElementById(id)
        if (!el) return
        el.select()
        document.execCommand('copy')
        var btn = el.parentNode.querySelector('.migxgen-copy-btn')
        if (btn) {
            var orig = btn.textContent
            btn.textContent = _('migxgenerator.copied')
            setTimeout(function() { btn.textContent = orig }, 1500)
        }
    }
}
Ext.onReady(function() { MIGXGenerator.init() })
