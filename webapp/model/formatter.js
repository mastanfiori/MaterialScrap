sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        numberUnit : function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },
        idAndDescription: function(sCode, sDescription){
            if(!sCode){
                return "";
            }
            if (!sDescription){
                return sCode;
            }
            return sCode + " (" + sDescription + ")";
        },

        idAndValue: function(sCode, sDescription){
            if(!sCode){
                return "";
            }
            if (!sDescription){
                return sCode;
            }
            return sCode + " " + sDescription + " ";
        },

        formatFloatValue: function (val) {
			if (!val) {
				return "0";
			} else if (val === "NaN") {
				val = "0";
				return parseFloat(val).toFixed(0);
			} else {
				return parseFloat(val).toFixed(0);
			}
		},

        removeDecimals: function(value) {
            // Remove decimals from the quantity field
            if (value || value === 0) {
                return parseInt(value, 10);
            }
            return value;
        }
    };

});