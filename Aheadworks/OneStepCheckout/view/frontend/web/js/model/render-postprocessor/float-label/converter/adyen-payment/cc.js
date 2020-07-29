/**
* Copyright 2018 aheadWorks. All rights reserved.
* See LICENSE.txt for license details.
*/

define(
    [
        'Magento_Ui/js/lib/view/utils/async',
        'Aheadworks_OneStepCheckout/js/model/render-postprocessor/float-label/converter/cc',
        'awOscFloatLabel'
    ],
    function ($, Converter, floatLabel) {
        'use strict';

        return _.extend({}, Converter, {

            /**
             * @inheritdoc
             */
            convertPaymentMethodInputs: function (methodItem) {
                var form = methodItem.find('form'),
                    methodCode = this._getPaymentMethodCode(methodItem),
                    expDateContainer = '#' + methodCode + '_cc_type_exp_div',
                    exclSelectors = [expDateContainer, '.choice', '.no-label'];

                if (form.length > 0) {
                    floatLabel({excludeFieldSelector: exclSelectors.join(', ')}, form);
                    $.async(
                        expDateContainer,
                        $.proxy(this._processExpirationDateInput, this)
                    );
                }
            }
        });
    }
);
