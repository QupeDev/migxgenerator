<?php
/**
 * MIGX Generator plugin
 * Adds a visual field builder to the TV editor when TV type is "migx".
 * Generates Form Tabs JSON, Grid Columns JSON, chunk template and snippet call.
 *
 * Events: OnManagerPageBeforeRender, OnTVFormPrerender
 */
/** @var modX $modx */
$assetsUrl = $modx->getOption('assets_url', null, MODX_ASSETS_URL) . 'components/migxgenerator/';
switch ($modx->event->name) {
    case 'OnManagerPageBeforeRender':
        $modx->controller->addLexiconTopic('migxgenerator:default');
        break;
    case 'OnTVFormPrerender':
        $modx->regClientCSS($assetsUrl . 'css/mgr/migxgenerator.css');
        $modx->event->output(
            '<script src="' . $assetsUrl . 'js/mgr/migxgenerator.js"></script>'
        );
        break;
}
