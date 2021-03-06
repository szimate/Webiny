<?php
namespace Apps\Webiny\Php\DevTools\Response;

use Webiny\Component\Http\Response\CacheControl;

/**
 * Class AbstractResponse
 */
abstract class AbstractResponse implements ResponseInterface
{
    protected $statusCode = 200;

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getCacheControlHeaders()
    {
        $cc = new CacheControl();
        $cc->setAsDontCache();
        return $cc->getCacheControl();
    }
}