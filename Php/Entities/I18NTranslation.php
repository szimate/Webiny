<?php

namespace Apps\Webiny\Php\Entities;

use Apps\Webiny\Php\DevTools\Entity\AbstractEntity;
use Apps\Webiny\Php\DevTools\Entity\EntityQuery\EntityQuery;
use Apps\Webiny\Php\DevTools\Entity\EntityQuery\Filter;
use Apps\Webiny\Php\DevTools\Exceptions\AppException;
use Apps\Webiny\Php\DevTools\WebinyTrait;
use Webiny\Component\StdLib\StdObject\ArrayObject\ArrayObject;

/**
 * Class User
 *
 * @package Apps\Selecto\Php\Entities
 *
 * @property string      $key
 * @property string      $placeholder
 * @property ArrayObject $translations
 */
class I18NTranslation extends AbstractEntity
{
    use WebinyTrait;

    protected static $entityCollection = 'I18NTranslations';

    protected static function entityQuery()
    {
        // TODO
        return [
            new Filter('edited', function (EntityQuery $query, $flag) {
                $query->removeCondition('edited');
                $flag = filter_var($flag, FILTER_VALIDATE_BOOLEAN);

                if ($flag) {
                    $query->setConditions([
                        '$and' => [
                            ['translations.en_GB' => ['$exists' => true]],
                            ['translations.en_GB' => ['$nin' => [null, ""]]],
                        ]
                    ]);
                } else {
                    $query->setConditions([
                        '$or' => [
                            ['translations.en_GB' => ['$exists' => false]],
                            ['translations.en_GB' => ['$in' => [null, ""]]],
                        ]
                    ]);
                }
            })
        ];
    }

    public function __construct()
    {
        parent::__construct();

        $this->attr('app')->char()->setValidators('required')->setToArrayDefault()->setOnce();
        $this->attr('key')->char()->setValidators('required,unique')->setToArrayDefault()->setOnce();
        $this->attr('placeholder')->char()->setValidators('required')->setToArrayDefault()->setOnce();
        $this->attr('translations')->object()->setToArrayDefault();

        /**
         * @api.name        Get translation by key
         * @api.description Gets a translation by a given key.
         * @api.path.key    string  Translation key
         */
        $this->api('GET', 'keys/{$key}', function ($key) {
            if ($translation = I18NTranslation::findByKey($key)) {
                return $this->apiFormatEntity($translation, $this->wRequest()->getFields());
            }

            throw new AppException($this->i18n('Translation not found.'));
        });

        /**
         * @api.name        Create new translation
         * @api.description Creates a new translation.
         * @api.body.key            string  Translation key
         * @api.body.placeholder    string  Default placeholder text for this translation (default text if no translation for selected language is present).
         */
        $this->api('POST', 'keys', function () {
            $data = $this->wRequest()->getRequestData();
            $translation = I18NTranslation::findByKey($data['key']);
            if (!$translation) {
                $translation = new I18NTranslation();
                $translation->key = $data['key'];
                $translation->placeholder = $data['placeholder'] ?? null;
                $translation->save();
            }

            return $this->apiFormatEntity($translation, $this->wRequest()->getFields());
        })->setBodyValidators([
            'key'         => 'required',
            'placeholder' => 'required'
        ]);

        /**
         * @api.name        Updates translation by key for given language
         * @api.description Gets a translation by a given key and updates it with received data
         *
         * @api.path.key            string  Translation key
         * @api.body.language       string  Language
         * @api.body.translation    string  Translation
         * @api.body.placeholder    string  Default placeholder text for this translation (default text if no translation for selected language is present).
         */
        $this->api('PATCH', 'keys/{$key}', function ($key) {
            $data = $this->wRequest()->getRequestData();
            $data['translation'] = $data['translation'] ?? '';

            $translation = I18NTranslation::findByKey($key);
            if ($translation) {
                /* @var I18NTranslation $translation */
                $translation->translations->key($data['language'], $data['translation']);
                $translation->save();
            } else {
                $translation = new I18NTranslation();
                $translation->key = $key;
                $translation->placeholder = $data['placeholder'] ?? null;
                $translation->translations->key($data['language'], $data['translation']);
                $translation->save();
            }

            return $translation;
        })->setBodyValidators([
            'language' => 'required',
            'placeholder' => 'required'
        ]);

        /**
         * TODO
         * @api.name        Fetch translations
         * @api.description Fetches all translations for given language
         *
         * @api.body.language   string  Language for which the translations will be returned
         */
        $this->api('GET', '/edited', function () {

            $settings = TranslationSettings::load();
            $return = [
                'cacheKey'     => $settings->key('cacheKey'),
                'translations' => []
            ];

            $language = $this->wRequest()->query('language');
            $translations = $this->mongo()->aggregate('Translations', [
                [
                    '$match' => [
                        'deletedOn' => null,
                        '$and'      => [
                            ['translations.' . $language => ['$exists' => true]],
                            ['translations.' . $language => ['$nin' => [null, ""]]]
                        ]
                    ]
                ],
                [
                    '$project' => [
                        '_id'                       => 0,
                        'key'                       => 1,
                        'translations.' . $language => 1
                    ]
                ]
            ])->toArray();

            foreach ($translations as $translation) {
                $return['translations'][Selecto::get($translation, 'key')] = Selecto::get($translation, 'translations.' . $language);
            }

            return $return;
        })->setBodyValidators(['language' => 'required']);
    }

    /**
     * Finds a translation by given key
     *
     * @param $key
     *
     * @return \Apps\Webiny\Php\DevTools\Entity\AbstractEntity|null
     */
    public static function findByKey($key)
    {
        return I18NTranslation::findOne(['key' => $key]);
    }

    public function getText($language)
    {
        return $this->translations->key($language);
    }

    public function hasText($language)
    {
        return $this->translations->key($language);
    }
}