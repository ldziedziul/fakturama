import ItemForm from "fakturama/forms/item";
import ExchangeRateMixin from "fakturama/mixins/exchange_rate";

var InvoicesNewController = Ember.ObjectController.extend(ExchangeRateMixin, {
    needs: ["application"],

    form: Ember.computed.alias("content"),

    settings: null,
    currencies: null,
    taxRates: null,
    languages: null,
    units: null,
    clients: null,
    invoices: null,
    accounts: null,

    isRemoveItemDisabled: function () {
        return this.get("items.length") <= 1;
    }.property("items.@each"),

    contentDidChange: function () {
        var periodNumber, lastNumber, invoices,
            properties = {},
            controller = this;
        function zeroPad(num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        }

        if (this.get("settings.numerationTypeCode") === "year") {
            periodNumber = new Date().getFullYear().toString();
        }

        if (this.get("settings.numerationTypeCode") === "month") {
            periodNumber = "FV/" + new Date().getFullYear().toString() + "/" + zeroPad((new Date().getMonth() + 1),2);
        }

        if (periodNumber) {
            lastNumber = this.get("invoices").filterBy("periodNumber", periodNumber).sortBy("periodicalNumber").get("lastObject.periodicalNumber") || 0;
            properties.number = periodNumber+"/"+zeroPad(lastNumber + 1,4);
        }

        properties.seller = this.get("settings.seller");
        properties.sellerSignature = this.get("settings.contactName");
        properties.dueDays = this.getWithDefault("settings.dueDays", 14);

        this.setProperties(properties);

        // bindings somehow don't work in minified version without Ember.run.next
        Ember.run.next(function () {
            controller.get("content").addItem();
        });
    }.observes("content"),

    actions: {
        saveRecord: function () {
            var controller = this;

            this.set("isSubmitted", true);

            this.get("content").save().then(function () {
                controller.transitionToRoute("invoice.show", controller.get("form.model"));
            });
        },

        addItem: function () {
            this.get("content").addItem();
        },

        removeItem: function (item) {
            this.get("items").removeObject(item);
        },

        chooseClient: function (client) {
            this.setProperties({ buyer: client.get("buyer"), buyerSignature: client.get("contactName") });
        },

        chooseAccount: function (account) {
            this.setProperties({
                accountBankName: account.get("bankName"),
                accountSwift: account.get("swift"),
                accountNumber: account.get("number")
            });
        }
    }
});

export default InvoicesNewController;
