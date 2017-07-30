<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 *
 * Usage example:
 * php Apps/Webiny/Php/Cli/release.php http://domain.app
 */

// TODO: @webinyDocker - __DIR__ zbog docker image-a, provjeriti ovo, mozda chdir php naredba ?
$autoloader = require_once __DIR__ . '/../../../../vendor/autoload.php';
$autoloader->addPsr4('Apps\\Webiny\\', __DIR__ . '/../../../../Apps/Webiny');

use Apps\Webiny\Php\PackageManager\App;

class Release extends \Apps\Webiny\Php\DevTools\AbstractCli
{
    public function run()
    {
        /* @var $app App */
        foreach ($this->wApps() as $app) {
            echo "Releasing '" . $app->getName() . "'...\n";
            // Run Release script for each app
            $app->getLifeCycleObject('Release')->run($app);
            echo "----------------\n";
        }
    }
}

$release = new Release($argv[1]);
$release->run();

