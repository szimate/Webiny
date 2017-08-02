<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\Webiny\Php\DevTools;

use Apps\Webiny\Php\Entities\I18NLocale;
use Apps\Webiny\Php\Entities\I18NSettings;
use Apps\Webiny\Php\Entities\I18NText;
use Webiny\Component\StdLib\SingletonTrait;
use Webiny\Component\StdLib\StdObject\ArrayObject\ArrayObject;

class I18N
{
    /**
     * @var ArrayObject
     */
    private $settings;

    /**
     * @var string
     */
    private $locale;

    use SingletonTrait;

    public function getLocale()
    {
        if ($this->locale) {
            return $this->locale;
        }

        $this->locale = I18NLocale::findByKey($this->locale);

        return $this->locale;
    }

    public function isEnabled()
    {
        return true;
    }

    /**
     * Translates given placeholder to currently set language.
     *
     * @param       $placeholder
     * @param array $variables
     * @param array $options
     *
     * @return $this|mixed|\Webiny\Component\StdLib\StdObject\StringObject\StringObject
     */
    public function translate($placeholder, $variables = [], $options = [])
    {
        $namespace = static::class;
        $namespace = str_replace('\\', '.', $namespace);

        $key = $namespace . '.' . md5($placeholder);

        $locale = $this->locale;

        $text = $placeholder;
        if ($translation = I18NText::findByKey($key)) {
            /* @var I18NText $translation */
            if ($translation->hasText($locale)) {
                $text = $translation->getText($locale);
            }
        }

        // Match variables
        preg_match_all('/\{(.*?)\}/', $text, $matches);
        $matches = $matches[1] ?? [];
        foreach ($matches as $match) {
            $variableName = '{' . $match . '}';
            if (isset($variables[$match]) && strpos($variableName, $text) >= 0) {
                $text = str_replace($variableName, $variables[$match], $text);
            }
        }

        return $text;
    }

    /**
     * @return string
     */
    public function getLanguage()
    {
        return $this->locale;
    }

    /**
     * @param string $language
     *
     * @return $this
     */
    public function setLocale($language)
    {
        $this->locale = $language;

        return $this;
    }
}