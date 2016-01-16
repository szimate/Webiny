<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright (c) 2009-2014 Webiny LTD. (http://www.webiny.com/)
 * @license   http://www.webiny.com/platform/license
 */

namespace Apps\Core\Php\RequestHandlers;

use Apps\Core\Php\Bootstrap\BootstrapEvent;
use Apps\Core\Php\DevTools\DevToolsTrait;
use Apps\Core\Php\DevTools\Response\ApiErrorResponse;
use Apps\Core\Php\DevTools\Response\ApiResponse;

class Api
{
    use DevToolsTrait;

    private $apiResponse = '\Apps\Core\Php\DevTools\Response\ApiResponse';
    private $apiEvent;

    public function handle(BootstrapEvent $event)
    {
        if (!$event->getRequest()->getCurrentUrl(true)->getPath(true)->startsWith('/api')) {
            return false;
        }

        $this->apiEvent = new ApiEvent($event->getRequest());

        $events = [
            'Core.Api.Before',
            'Core.Api.HandleRequest',
            'Core.Api.After'
        ];

        foreach ($events as $event) {
            $response = $this->wEvents()->fire($event, $this->apiEvent, $this->apiResponse, 1);
            if ($response) {
                return $response;
            }
        }

        return new ApiErrorResponse([], 'Request was not handled properly!');
    }
}