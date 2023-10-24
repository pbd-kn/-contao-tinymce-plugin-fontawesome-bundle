<?php

declare(strict_types=1);

/*
 * This file is part of Fontawesome Icon Picker Bundle.
 *
 * (c) Marko Cupic 2023 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/fontawesome-icon-picker-bundle
 */

namespace Pbdkn\ContaoTinymcePluginFontawesomeBundle\EventSubscriber;


use Contao\CoreBundle\Routing\ScopeMatcher;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class KernelRequestSubscriber implements EventSubscriberInterface
{
    protected ScopeMatcher $scopeMatcher;
    protected string $fontawesomeSourcePath;

    public function __construct(ScopeMatcher $scopeMatcher, string $fontawesomeSourcePath)
    {
        $this->scopeMatcher = $scopeMatcher;
        $this->fontawesomeSourcePath = $fontawesomeSourcePath;
    }

    public static function getSubscribedEvents()
    {
        return [KernelEvents::REQUEST => 'onKernelRequest'];
    }

    public function onKernelRequest(RequestEvent $e): void
    {
        $request = $e->getRequest();

        //if ($this->scopeMatcher->isFrontendRequest($request)) {      // das hei�t es geht nur im Frontend ???
            //$GLOBALS['TL_CSS'][] = 'bundles/markocupicfontawesomeiconpicker/css/iconPicker.css|static';    // css f�r dargestellte icons
            //$GLOBALS['TL_JAVASCRIPT'][] = 'bundles/markocupicfontawesomeiconpicker/js/iconPicker.js';      // js f�r dargestellte icons
            $GLOBALS['TL_JAVASCRIPT'][] = $this->fontawesomeSourcePath;     // das zugeh�rige all.js file
        //}
    }
}
