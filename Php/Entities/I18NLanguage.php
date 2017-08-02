<?php

namespace Apps\Webiny\Php\Entities;

use Apps\Webiny\Php\DevTools\Entity\AbstractEntity;
use Apps\Webiny\Php\DevTools\WebinyTrait;
use Webiny\Component\Entity\Attribute\Validation\ValidationException;

/**
 * Class I18NLanguage
 *
 * @package Apps\Selecto\Php\Entities
 *
 * @property bool   $enabled
 * @property string $locale
 */
class I18NLanguage extends AbstractEntity
{
    use WebinyTrait;

    protected static $entityCollection = 'I18NLanguages';

    public function __construct()
    {
        parent::__construct();

        $this->attr('enabled')->boolean();
        $this->attr('locale')->char()->setValidators(function ($value) {
            if (!self::isValidLocale($value)) {
                throw new ValidationException('You must select a valid locale.');
            }
        })->setToArrayDefault();

        $this->attr('label')->dynamic(function () {
            return I18NLanguageLocale::getLabel($this->locale);
        });

        /**
         * @api.name        List locales
         * @api.description Lists all available locales.
         */
        $this->api('GET', 'locales', function () {
            return I18NLanguageLocale::getLocales();
        });

        /**
         * @api.name        List available locales
         * @api.description Lists locales that were not already added.
         */
        $this->api('GET', 'locales/available', function () {
            $exclude = $this->wDatabase()->find('I18NLanguages', ['deletedOn' => null], [], 0, 0, ['projection' => ['_id' => 0, 'locale' => 1]]);
            $exclude = array_map(function($item) {
                return $item['locale'];
            }, $exclude);
            return I18NLanguageLocale::getLocales($exclude);
        });
    }

    // TODO: @i18n - move locales to settings
    public static function isValidLocale($locale)
    {
        return defined('Apps\Webiny\Php\Entities\I18NLanguageLocale::' . $locale);
    }
}