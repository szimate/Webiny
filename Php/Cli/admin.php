<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 *
 * Usage example:
 * php Apps/Webiny/Php/Cli/admin.php http://domain.app email password
 */


use Apps\Webiny\Php\Entities\User;
use Webiny\Component\StdLib\Exception\AbstractException;

// TODO: @webinyDocker - __DIR__ zbog docker image-a, provjeriti ovo, mozda chdir php naredba ?
$autoloader = require_once __DIR__ . '/../../../../vendor/autoload.php';
$autoloader->addPsr4('Apps\\Webiny\\', __DIR__ . '/../../../../Apps/Webiny');

class Admin extends \Apps\Webiny\Php\DevTools\AbstractCli
{
    public function run($email, $password)
    {
        // Create admin user
        try {
            $user = new User();
            $user->email = $email;
            $user->password = $password;
            $user->roles = ['administrator', 'webiny-acl-api-token-manager', 'webiny-logger-manager', 'webiny-acl-user-manager'];
            $user->firstName = '';
            $user->lastName = '';
            $user->save();
            die(json_encode(['status' => 'created']));
        } catch (AbstractException $e) {
            die(json_encode(['status' => 'exists']));
        }
    }
}

$release = new Admin($argv[1]);
$release->run($argv[2], $argv[3]);