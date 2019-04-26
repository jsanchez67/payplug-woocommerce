/* global jQuery */

(function ($, undefined) {

	if (undefined === payplug_admin_config) {
		return;
	}

	var payplug_admin = {
		init: function () {
			payplug_admin.xhr = false;

			// setup modal
			payplug_admin.$dialog = $('#payplug-refresh-keys-modal').dialog({
				autoOpen: false,
				modal: true,
				draggable: false,
				buttons: [
					{
						class: "ui-dialog-submit",
						text: "Ok",
						click: payplug_admin.refreshKeys
					},
					{
						class: "ui-dialog-cancel",
						text: "Cancel",
						click: payplug_admin.onCancelClick
					}
				],
				show: true,
				hide: 100,
				close: payplug_admin.onDialogClose
			});

			// handle modal form submit
			payplug_admin.$dialog.find('form#payplug-refresh-keys-modal__form').on('submit', function (e) {
				e.preventDefault();
				payplug_admin.refreshKeys();
			});

			// open modal when user try to select live mode
			if ($('input[name=woocommerce_payplug_mode]').length) {
				this.$payplug_mode = $('input[name=woocommerce_payplug_mode]');
				this.$payplug_mode.on(
					'click',
					this.onClick
				)
			}
		},
		onClick: function (event) {
			if ('0' === event.currentTarget.value || payplug_admin_config.has_live_key) {
				// ignore event if user choose TEST mode or already has LIVE keys
				return;
			}

			payplug_admin.$dialog.dialog('open');
		},
		onCancelClick: function () {
			payplug_admin.$dialog.dialog('close');
		},
		onDialogClose: function () {
			if (payplug_admin.xhr) {
				payplug_admin.xhr.abort();
				payplug_admin.xhr = false;
			}

			payplug_admin._clearMessage();

			payplug_admin.$dialog.find('form#payplug-refresh-keys-modal__form').get(0).reset();

			var live = payplug_admin.$payplug_mode.filter('#woocommerce_payplug_mode-yes');
			var test = payplug_admin.$payplug_mode.filter('#woocommerce_payplug_mode-no');

			if (!payplug_admin_config.has_live_key && live.prop('checked')) {
				test.prop('checked', 'checked');
			}
		},
		refreshKeys: function () {
			payplug_admin._clearMessage();
			payplug_admin._lockDialog();
			var form = payplug_admin.$dialog.find('form#payplug-refresh-keys-modal__form').get(0);

			if (payplug_admin.xhr) {
				payplug_admin.xhr.abort();
			}

			payplug_admin.xhr = $
				.post(
					payplug_admin_config.ajax_url,
					$(form).serializeArray()
				).done(function (res) {
					form.reset();
					payplug_admin.xhr = false;
					payplug_admin._unlockDialog();

					if (false === res.success) {
						payplug_admin._displayError(res.data.message);
					} else {
						payplug_admin._displaySuccess(res.data.message);
						window.location.reload();
					}
				})
				.fail(function (res) {
					form.reset();
					payplug_admin.xhr = false;
					payplug_admin._unlockDialog();
					payplug_admin._displayError(payplug_admin_config.general_error);
				});
		},
		_displaySuccess: function (msg) {
			payplug_admin._displayMessageHelper(msg, 'success');
		},
		_displayError: function (msg) {
			payplug_admin._displayMessageHelper(msg, 'error');
		},
		_clearMessage: function () {
			payplug_admin.$dialog.find('#dialog-msg').empty();
		},
		_lockDialog: function () {
			var buttons = payplug_admin._disabledHelper(payplug_admin.$dialog.dialog('option', 'buttons'), true);
			payplug_admin.$dialog.dialog('option', 'buttons', buttons);
		},
		_unlockDialog: function () {
			var buttons = payplug_admin._disabledHelper(payplug_admin.$dialog.dialog('option', 'buttons'), false);
			payplug_admin.$dialog.dialog('option', 'buttons', buttons);
		},
		_disabledHelper(items, disabled) {
			return $.each(items, function (i, val) {
				val.disabled = disabled;
			});
		},
		_displayMessageHelper(msg, type) {
			var msgHtml = payplug_admin.$dialog.find('#dialog-msg');
			msgHtml.text(msg).addClass(type);
		}
	};

	payplug_admin.init();
})(jQuery);
