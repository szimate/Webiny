<?php
namespace Apps\Core\Php\Entities;

use Apps\Core\Php\DevTools\Entity\EntityAbstract;
use Webiny\Component\Image\ImageTrait;
use Webiny\Component\Mongo\Index\SingleIndex;
use Webiny\Component\Storage\Directory\Directory;
use Webiny\Component\Storage\File\File as StorageFile;
use Webiny\Component\Storage\StorageTrait;

if (!defined('DS')) {
    define('DS', DIRECTORY_SEPARATOR);
}

class File extends EntityAbstract
{
    use StorageTrait, ImageTrait;

    const STORAGE = 'Files';

    protected static $entityCollection = 'Files';

    protected static function entityIndexes()
    {
        return [
            new SingleIndex('ref', 'ref')
        ];
    }

    /**
     * This method is called during instantiation to build entity structure
     * @return void
     */
    protected function entityStructure()
    {
        $this->attr('name')->char()->setRequired();
        $this->attr('title')->char();
        $this->attr('size')->integer();
        $this->attr('type')->char();
        $this->attr('ext')->char();
        $this->attr('src')->char();
        $this->attr('tags')->arr();
        $this->attr('ref')->char();
        $this->attr('order')->integer()->setDefaultValue(0);
    }

    /**
     * @inheritDoc
     */
    public function toArray($fields = '', $nestedLevel = 1)
    {
        $data = parent::toArray($fields, $nestedLevel);
        $data['src'] = $this->getUrl();

        return $data;
    }

    public function getUrl($ext = null)
    {
        if (!$ext) {
            return $this->storage(self::STORAGE)->getURL($this->src);
        }

        return $this->getExt($ext);
    }

    /**
     * @inheritDoc
     */
    public function populate($data)
    {
        $fromDb = isset($data['__webiny_db__']);
        if ($fromDb) {
            return parent::populate($data);
        }

        $content = $this->str(isset($data['src']) ? $data['src'] : '');
        $newContent = $content->startsWith('data:');
        $newName = isset($data['name']) ? $data['name'] : $this->name;
        if ($this->exists()) {
            if ($newContent) {
                // Delete current file
                if ($newName != $this->name) {
                    $this->storage(self::STORAGE)->deleteKey($this->src);
                }
            } else {
                // These keys should not change if file content is not changing
                unset($data['src']);
                unset($data['name']);
            }
        }

        return parent::populate($data);
    }

    /**
     * @inheritDoc
     */
    public function save()
    {
        $storage = $this->storage(self::STORAGE);
        $content = $this->str($this->src);
        $newContent = $content->startsWith('data:');
        if ($newContent) {
            // Make sure file names do not clash
            if (!$this->exists()) {
                $name = $this->name;
                while ($storage->keyExists($this->getKey($name))) {
                    $name = $this->generateNewName();
                    continue;
                }
                $this->name = $name;
            }

            $key = str_replace(' ', '-', $this->name);
            $storage->setContents($key, $content->explode(',')->last()->base64Decode()->val());
            $this->src = $storage->getRecentKey();
            $this->size = $storage->getSize($this->src);
            $this->ext = $this->str(basename($this->src))->explode('.')->last()->val();
        }

        return parent::save();
    }

    /**
     * @inheritDoc
     */
    public function delete()
    {
        $deleted = parent::delete();
        if ($deleted) {
            $this->storage(self::STORAGE)->deleteKey($this->src);

            /* @var $file StorageFile */
            foreach ($this->getSizes() as $file) {
                $file->delete();
            }
        }

        return $deleted;
    }

    private function generateNewName()
    {
        $ext = '';
        $name = $this->str($this->name)->explode('.')->removeLast($ext)->join('.');

        return $name . '-' . time() . '.' . $ext;
    }

    private function getKey($name)
    {
        if ($this->storage(self::STORAGE)->getDriver()->createDateFolderStructure()) {
            $name = date('Y' . DS . 'm' . DS . 'd') . DS . $name;
        }

        return $name;
    }

    private function getExt($imageExt)
    {
        $storage = $this->storage(self::STORAGE);
        // Predefined sizes
        $width = $height = $cropWidth = $cropHeight = 0;
        $extMap = ['thumb' => [200, 200, 173, 110]];

        $path = explode('/', $this->src);
        $fileName = array_pop($path);
        $path = join('/', $path);

        // Build extension key
        $lastDot = strrpos($fileName, '.');
        $name = substr($fileName, 0, $lastDot);
        $ext = substr($fileName, $lastDot);
        $extPath = $name . '-size-' . $imageExt . $ext;

        // Check if file exists
        $extFile = new StorageFile($path . '/' . $extPath, $storage);
        if ($extFile->exists()) {
            return $extFile->getUrl();
        }

        // Create new image size
        $currentFile = new StorageFile($this->src, $storage);
        $image = $this->image($currentFile);

        if (isset($extMap[$imageExt])) {
            list($width, $height, $cropWidth, $cropHeight) = $extMap[$imageExt];
        } else {
            $dimensions = explode('|', $imageExt);
            list($width, $height) = explode('x', $dimensions[0]);
            if (isset($dimensions[1])) {
                list($cropWidth, $cropHeight) = explode('x', $dimensions[1]);
            }
        }

        if ($width && $height) {
            $image->resize($width, $height);
        }

        if ($cropWidth && $cropHeight) {
            $image->crop($cropWidth, $cropHeight);
        }

        $image->save($extFile);

        return $extFile->getUrl();
    }

    /**
     * @return Directory
     * @throws \Exception
     * @throws \Webiny\Component\ServiceManager\ServiceManagerException
     * @throws \Webiny\Component\StdLib\StdObject\StringObject\StringObjectException
     */
    private function getSizes()
    {
        $path = explode('/', $this->src);
        $fileName = array_pop($path);
        $path = join('/', $path);
        $pattern = $this->str($fileName)->explode('.')->first() . '-size-*';

        return new Directory($path, $this->storage(self::STORAGE), false, $pattern);
    }
}