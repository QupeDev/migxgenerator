<?php
/**
 * MIGX Generator transport package build script
 */
set_time_limit(0);
error_reporting(E_ALL);
ini_set('display_errors', 1);
$mtime = microtime(true);
define('PKG_NAME', 'migxgenerator');
define('PKG_VERSION', '1.0.0');
define('PKG_RELEASE', 'pl');
define('PKG_NAMESPACE', 'migxgenerator');
define('PKG_CATEGORY', 'MIGX Generator');
define('MODX_API_MODE', true);
require_once dirname(dirname(dirname(dirname(__DIR__)))) . '/config.core.php';
if (!defined('MODX_CONFIG_KEY')) {
    define('MODX_CONFIG_KEY', 'config');
}
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';
$modx->setLogLevel(modX::LOG_LEVEL_INFO);
$modx->setLogTarget('ECHO');
echo '<pre>';
$modx->log(modX::LOG_LEVEL_INFO, 'Building package ' . PKG_NAME . '-' . PKG_VERSION . '-' . PKG_RELEASE);
$corePath = MODX_CORE_PATH . 'components/' . PKG_NAMESPACE . '/';
$assetsPath = MODX_ASSETS_PATH . 'components/' . PKG_NAMESPACE . '/';
$builder = new modPackageBuilder($modx);
$builder->createPackage(PKG_NAME, PKG_VERSION, PKG_RELEASE);
$builder->registerNamespace(
    PKG_NAMESPACE, false, true,
    '{core_path}components/' . PKG_NAMESPACE . '/',
    '{assets_path}components/' . PKG_NAMESPACE . '/'
);
/* Category + Plugin */
$category = $modx->newObject('modCategory');
$category->set('category', PKG_CATEGORY);
$pluginCode = file_get_contents($corePath . 'elements/plugins/plugin.migxgenerator.php');
$pluginCode = preg_replace('/^<\?php\s*/', '', $pluginCode);
$plugin = $modx->newObject('modPlugin');
$plugin->set('name', 'MIGXGenerator');
$plugin->set('description', 'Visual field builder for MIGX TV configuration.');
$plugin->set('plugincode', $pluginCode);
$plugin->set('static', 0);
$plugin->set('disabled', 0);
$plugin->set('cache_type', 0);
$events = ['OnManagerPageBeforeRender', 'OnTVFormPrerender'];
$pluginEvents = [];
foreach ($events as $eventName) {
    $event = $modx->newObject('modPluginEvent');
    $event->fromArray(['event' => $eventName, 'priority' => 0, 'propertyset' => 0], '', true, true);
    $pluginEvents[$eventName] = $event;
}
$plugin->addMany($pluginEvents, 'PluginEvents');
$plugins = [$plugin];
$category->addMany($plugins, 'Plugins');
$vehicle = $builder->createVehicle($category, [
    xPDOTransport::UNIQUE_KEY => 'category',
    xPDOTransport::PRESERVE_KEYS => false,
    xPDOTransport::UPDATE_OBJECT => true,
    xPDOTransport::RELATED_OBJECTS => true,
    xPDOTransport::RELATED_OBJECT_ATTRIBUTES => [
        'Plugins' => [
            xPDOTransport::UNIQUE_KEY => 'name',
            xPDOTransport::PRESERVE_KEYS => false,
            xPDOTransport::UPDATE_OBJECT => true,
            xPDOTransport::RELATED_OBJECTS => true,
            xPDOTransport::RELATED_OBJECT_ATTRIBUTES => [
                'PluginEvents' => [
                    xPDOTransport::UNIQUE_KEY => ['pluginid', 'event'],
                    xPDOTransport::PRESERVE_KEYS => true,
                    xPDOTransport::UPDATE_OBJECT => false,
                ],
            ],
        ],
    ],
]);
$vehicle->resolve('file', [
    'source' => $assetsPath,
    'target' => "return MODX_ASSETS_PATH . 'components/';",
]);
$vehicle->resolve('file', [
    'source' => $corePath,
    'target' => "return MODX_CORE_PATH . 'components/';",
]);
$builder->putVehicle($vehicle);
$builder->setPackageAttributes([
    'license' => 'MIT License',
    'readme' => 'MIGX Generator — visual field builder for MIGX TV configuration in MODX 3.',
    'changelog' => 'v1.0.0 — Initial release.',
]);
if ($builder->package->pack()) {
    $modx->log(modX::LOG_LEVEL_INFO, 'Package built successfully!');
} else {
    $modx->log(modX::LOG_LEVEL_ERROR, 'Failed to build package.');
}
$totalTime = sprintf('%2.4f', microtime(true) - $mtime);
$modx->log(modX::LOG_LEVEL_INFO, "Execution time: {$totalTime} s");
echo '</pre>';
