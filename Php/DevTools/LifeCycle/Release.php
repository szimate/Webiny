<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\Webiny\Php\DevTools\LifeCycle;

use Apps\Webiny\Php\DevTools\WebinyTrait;
use Apps\Webiny\Php\PackageManager\App;
use MongoDB\Driver\Exception\RuntimeException;

/**
 * Class Release
 *
 * This class serves as a base for app release logic
 */
class Release implements LifeCycleInterface
{
    use WebinyTrait;

    /**
     * Run release
     *
     * @param App $app Instance of PackageManager\App being run
     */
    public function run(App $app)
    {
        $this->installJsDependencies($app);
        $this->manageIndexes($app);
    }

    /**
     * Scan app entities and create/drop indexes as needed
     *
     * @param App $app
     */
    protected function manageIndexes(App $app)
    {
        foreach ($app->getEntities() as $e) {
            /* @var $entity \Apps\Webiny\Php\DevTools\Entity\AbstractEntity */
            $entity = new $e['class'];
            $collection = $entity->getEntityCollection();
            $indexes = $entity->getIndexes();

            $dbIndexes = $this->wDatabase()->listIndexes($entity->getEntityCollection());
            $installedIndexes = [];
            foreach ($dbIndexes as $ind) {
                $installedIndexes[] = $ind['name'];
            }

            // Check if any indexes need to be created
            if (count($indexes)) {
                /* @var $index \Webiny\Component\Mongo\Index\AbstractIndex */
                foreach ($indexes as $index) {
                    $installed = in_array($index->getName(), $installedIndexes);
                    if (!$installed) {
                        echo "Creating '" . $index->getName() . "' index in '" . $collection . "' collection...\n";
                        try {
                            $this->wDatabase()->createIndex($collection, $index);
                        } catch (RuntimeException $e) {
                            if ($e->getCode() === 85) {
                                echo "WARNING: another index with same fields already exists. Skipping creation of '" . $index->getName() . "' index.\n";
                            } else {
                                echo $e->getMessage() . "\n";
                            }
                        }
                    }
                }
            }

            // Check of any indexes need to be dropped
            foreach ($installedIndexes as $index) {
                $removed = !array_key_exists($index, $indexes);
                if ($removed && $index !== '_id_') {
                    echo "Dropping '" . $index . "' index from '" . $collection . "' collection...\n";
                    $this->wDatabase()->dropIndex($collection, $index);
                }
            }
        }
    }

    /**
     * Install production JS dependencies
     * Default: `npm install --production` is executed in the root of the app
     *
     * @param App $app
     */
    protected function installJsDependencies($app)
    {
        if (file_exists($app->getPath() . '/package.json')) {
            exec('cd ' . $app->getPath() . ' && yarn install --production');
        }
    }
}
