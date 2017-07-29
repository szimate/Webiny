FROM php:latest

# Install developer dependencies
RUN apt-get update -yqq && apt-get install -y git libsqlite3-dev libxml2-dev libicu-dev libfreetype6-dev libmcrypt-dev libjpeg62-turbo-dev libpng12-dev libcurl4-gnutls-dev libbz2-dev libssl-dev -yqq

# Install PHP extensions
RUN docker-php-ext-install json
RUN docker-php-ext-install mbstring
RUN docker-php-ext-install mcrypt
RUN docker-php-ext-install curl
RUN docker-php-ext-install opcache

# Install Xdebug
RUN yes | pecl install xdebug \
    && echo "zend_extension=$(find /usr/local/lib/php/extensions/ -name xdebug.so)" > /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.remote_enable=on" >> /usr/local/etc/php/conf.d/xdebug.ini \
    && echo "xdebug.remote_autostart=off" >> /usr/local/etc/php/conf.d/xdebug.ini

# MongoDB installation
RUN pecl install mongodb
RUN echo "extension=mongodb.so" >> /usr/local/etc/php/conf.d/mongodb.ini