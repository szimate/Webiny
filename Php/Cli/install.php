<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 *
 * Usage example:
 * php Apps/Webiny/Php/Cli/install.php http://domain.app Webiny
 */

// TODO: @webinyDocker - __DIR__ zbog docker image-a, provjeriti ovo, mozda chdir php naredba ?
$autoloader = require_once __DIR__ . '/../../../../vendor/autoload.php';
$autoloader->addPsr4('Apps\\Webiny\\', __DIR__ . '/../../../../Apps/Webiny');

class Install extends \Apps\Webiny\Php\DevTools\AbstractCli
{
    public function run($app)
    {
        $appInstance = $this->wApps($app);
        if ($appInstance) {
            $appInstance->getLifeCycleObject('Install')->run($appInstance);
        }
    }
}

$release = new Install();
$release->run($argv[1]);

