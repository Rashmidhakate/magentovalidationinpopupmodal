/**
* Copyright 2018 aheadWorks. All rights reserved.
* See LICENSE.txt for license details.
*/

define([
    'jquery',
    'uiComponent',
    'uiRegistry',
    'Magento_Checkout/js/model/full-screen-loader',
    'Aheadworks_OneStepCheckout/js/model/place-order-allowed-flag',
    'Aheadworks_OneStepCheckout/js/view/place-order/aggregate-validator',
    'Aheadworks_OneStepCheckout/js/view/place-order/aggregate-checkout-data',
    'Magento_Ui/js/modal/modal'
], function (
    $,
    Component,
    registry,
    fullScreenLoader,
    placeOrderAllowedFlag,
    aggregateValidator,
    aggregateCheckoutData,
    modal
) {
    'use strict';
    var options = {
        type: 'popup',
        responsive: true,
        modalClass: '',
        buttons: [{
            text: $.mage.__('Ok'),
            class: '',
            click: function() {
                this.closeModal();
            }
        }]
    };
    return Component.extend({
        defaults: {
            template: 'Aheadworks_OneStepCheckout/actions-toolbar/renderer/default',
            methodCode: null
        },
        methodRendererComponent: null,
        isPlaceOrderActionAllowed: placeOrderAllowedFlag,

        /**
         * @inheritdoc
         */
        initialize: function () {
            this._super().initMethodsRenderComponent();

            return this;
        },

        /**
         * Perform before actions: overall validation, set checkout data and etc.
         *
         * @returns {Deferred}
         */
        _beforeAction: function () {
            var deferred = $.Deferred();

            if (this.isPlaceOrderActionAllowed()) {
                aggregateValidator.validate().done(function () {
                    fullScreenLoader.startLoader();
                    aggregateCheckoutData.setCheckoutData().done(function () {
                        fullScreenLoader.stopLoader();
                        deferred.resolve();
                    });
                });
            }

            return deferred;
        },

        /**
         * Init method renderer component
         *
         * @returns {Component}
         */
        initMethodsRenderComponent: function () {
            if (this.methodCode) {
                this.methodRendererComponent = registry.get('checkout.paymentMethod.methodList.' + this.methodCode);
            }

            return this;
        },

        /**
         * Get method renderer component
         *
         * @returns {Component}
         */
        _getMethodRenderComponent: function () {
            if (!this.methodRendererComponent) {
                this.initMethodsRenderComponent();
            }
            return this.methodRendererComponent;
        },

        /**
         * Place order
         *
         * @param {Object} data
         * @param {Object} event
         */
        placeOrder: function (data, event) {
            //console.log($('#search-block'));
            
            var self = this;
            var isValid = true;
            var array = [];
           $('input[type="text"].input-text,select').each(function() {
                var attr = $(this).attr('aria-required');
                if(typeof attr !== typeof undefined && attr !== false){
                    if ($.trim($(this).val()) == '') {
                        var $element = $(this);
                        var $name = $(this).attr('name');
                        var $label = $("label[for='"+$element.attr('id')+"']").find("span").text();
                        var $visibility = $("label[for='"+$element.attr('id')+"']").parents().find('div[name="shippingAddress.'+$name+'"]');
                        if($visibility.css('display') == 'none'){
                            var $itemRemove =$visibility.find("span").text();
                            array.splice($.inArray($itemRemove, array), 1);      
                            return;                      
                        }
                       if($name == 'region_id'){
                            var $visibility = $("label[for='"+$element.attr('id')+"']").parents().find('div[name="shippingAddress.'+$name+'"]');
                            var $region_id =$visibility.find("span").text();
                            array.push($region_id);
                       }
                        array.push($label);
                        isValid = false;
                    }
                }
            });
            if (isValid == false) {
                var popup = modal(options, "<div>"+array+" "+"required field</div>");
                popup.openModal();
                //alert(array+" "+'required field');
                return false;
            }
            else {
                if (event) {
                    event.preventDefault();
                }
                    this._beforeAction().done(function () {
                    self._getMethodRenderComponent().placeOrder(data, event);
                });
            }
            
        },

        /**
         * Dispose subscriptions
         */
        disposeSubscriptions: function () {
        }
    });
});
