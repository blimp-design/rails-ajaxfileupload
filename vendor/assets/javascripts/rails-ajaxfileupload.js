// Inspired by https://github.com/JangoSteve/remotipart/blob/master/vendor/assets/javascripts/jquery.remotipart.js
// Uses FormData instead of iframe transport
// Using this since this project only supports modern browsers which support FormData

(function($) {
  var ajaxUploader = {
    setup: function($form) {
      // Preserve $form.data('ujs:submit-button') before it gets nulled by $.ajax.handleRemote
      var buttonInfo = $form.data('ujs:submit-button'),
          csrfParam = $.rails.csrfParam(),
          csrfToken = $.rails.csrfToken(),
          csrfInputExists = !!($form.find('input[name="' + csrfParam + '"]').length);

      $form
        // Allow setup part of $.rails.handleRemote to setup remote settings before canceling default remote handler
        // This is required in order to change the remote settings using the $form details
        .one('ajax:beforeSend.ajaxUploader', function(e, xhr, settings){
          // Delete the beforeSend bindings, since we're about to re-submit via ajaxSubmit with the beforeSubmit
          // hook that was just setup and triggered via the default `$.rails.handleRemote`
          delete settings.beforeSend;

          settings.data = new FormData($form[0]);

          // Insert the name/value of the clicked submit button, if any
          if (buttonInfo)
            settings.data.append(buttonInfo.name, buttonInfo.value);

          settings.processData = false;
          settings.contentType = false;

          if (settings.dataType === undefined) { settings.dataType = 'script *'; }
          if (csrfToken && csrfParam && !csrfInputExists) {
            settings.data.append(csrfParam, csrfToken);
          }

          var settingsOldXhr = settings.xhr;
          settings.xhr = function() {
            var res = settingsOldXhr();
            if(res.upload) {
              res.upload.addEventListener('progress', function(progressEvent) {
                var progressData = {
                  loaded: progressEvent.loaded,
                  total: progressEvent.total,
                  percent: 100.0 * progressEvent.loaded/progressEvent.total
                };
                $.rails.fire($form, 'ajax:upload:progress', [progressData]);
              });
            }
            return res;
          }

          // Allow ajaxUploaderSubmit to be cancelled if needed
          if ($.rails.fire($form, 'ajax:upload:start', [xhr, settings])) {
            // Second verse, same as the first
            $.rails.ajax(settings).complete(function(data){
              $.rails.fire($form, 'ajax:upload:complete', [data]);
            });
            setTimeout(function(){ $.rails.disableFormElements($form); }, 20);
          }

          ajaxUploader.teardown($form);
          return false;
        })

        // Keep track that we just set this particular form with Remotipart bindings
        // Note: The `true` value will get over-written with the `settings.dataType` from the `ajax:beforeSend` handler
        .data('ajaxUploaderSubmitted', true);

    },
    teardown: function($form) {
      $form
        .unbind('ajax:beforeSend.ajaxUploader')
        .removeData('ajaxUploaderSubmitted');
    }
  };

  $(document).on('ajax:aborted:file', 'form', function() {
    var $form = $(this);

    ajaxUploader.setup($form);

    // Manually call jquery-ujs remote call so that it can setup form and settings as usual,
    // and trigger the `ajax:beforeSend` callback to which ajaxUploader binds functionality.
    $.rails.handleRemote($form);
    return false;
  });
})(window.jQuery);
