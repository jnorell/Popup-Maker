(function ($) {
    "use strict";

    $.fn.popmake.last_open_trigger = null;
    $.fn.popmake.last_close_trigger = null;

    $.fn.popmake.methods.addTrigger = function (type, settings) {
        // Method calling logic
        if ($.fn.popmake.triggers[type]) {
            return $.fn.popmake.triggers[type].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        $.error('Trigger type ' + $.fn.popmake.triggers + ' does not exist.');
        return this;
    };

    $.fn.popmake.methods.checkCookies = function ( settings) {
        var i;
        // If cookie exists return true
        console.log(settings.cookie.name, typeof settings.cookie.name);

        if (typeof settings.cookie.name === 'array' || typeof settings.cookie.name === 'object') {
            for(i = 0; settings.cookie.name.length > i; i++) {
                if ($.pm_cookie(settings.cookie.name[i]) !== undefined) {
                    return true;
                }
            }
        } else if (typeof settings.cookie.name === 'string') {
            if ($.pm_cookie(settings.cookie.name) !== undefined) {
                return true;
            }
        }
        return false;
    };

    $.fn.popmake.triggers = {
        auto_open: function (settings) {
            var $popup = $(this);

            // Set a delayed open.
            setTimeout(function () {

                // If the popup is already open return.
                if ($popup.hasClass('active') || $popup.hasClass('pum-open')) {
                    return;
                }

                // If cookie exists return.
                if ($popup.popmake('checkCookies', settings)) {
                    return;
                }

                // Set the global last open trigger to the a text description of the trigger.
                $.fn.popmake.last_open_trigger = 'Auto Open - Delay: ' + settings.delay;

                // Open the popup.
                $popup.popmake('open');

            }, settings.delay);
        },
        click_open: function (settings) {
            var $popup = $(this),
                popup_settings = $popup.data('popmake'),
                trigger_selector = '.popmake-' + popup_settings.id + ', .popmake-' + popup_settings.slug;

            if (settings.extra_selectors !== '') {
                trigger_selector += ', ' + settings.extra_selectors;
            }

            $(trigger_selector)
                .addClass('pum-trigger')
                .css({cursor: "pointer"});

            $(document)
                .on('click.pumTrigger', trigger_selector, function (e) {

                    // If trigger is inside of the popup that it opens, do nothing.
                    if ($popup.has(this).length > 0) {
                        return;
                    }

                    // If cookie exists return.
                    if ($popup.popmake('checkCookies', settings)) {
                        return;
                    }

                    // If trigger has the class do-default we don't prevent default actions.
                    if (!$(e.target).hasClass('do-default')) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    // Set the global last open trigger to the clicked element.
                    $.fn.popmake.last_open_trigger = this;

                    // Open the popup.
                    $popup.popmake('open');

                });
        },
        admin_debug: function () {
            $(this).popmake('open');
        }
    };

    // Register All Triggers for a Popup
    $(document)
        .on('pumInit', '.popmake', function (e) {
            var $popup = $(this),
                settings = $popup.data('popmake'),
                triggers = settings.triggers,
                trigger = null;

            if (typeof triggers !== 'undefined' && triggers.length) {
                for (var i = 0; triggers.length > i; i++) {
                    trigger = triggers[i];
                    $popup.popmake('addTrigger', trigger.type, trigger.settings);
                }
            }
        });

}(jQuery));