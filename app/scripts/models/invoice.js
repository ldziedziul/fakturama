Faktura.Invoice = Ember.Object.extend({
    number: "",
    dateOfIssue: undefined,
    dateOfSale: undefined,
    dueDate: undefined,

    seller: "",
    currency: "PLN",
    language: "polski",

    items: function () {
        return [];
    }.property(),

    sellerFirstLine: function () {
        return this.get("seller").split("\n")[0];
    }.property("seller"),

    sellerRest: function () {
        return this.get("seller").split("\n").slice(1);
    }.property("seller"),

    buyer: "",

    buyerFirstLine: function () {
        return this.get("buyer").split("\n")[0];
    }.property("buyer"),

    buyerRest: function () {
        return this.get("buyer").split("\n").slice(1);
    }.property("buyer"),

    isEnglish: function () {
        return this.get("language") === "polsko-angielski";
    }.property("language"),

    comment: "",
    commentLines: function () {
        return this.get("comment").split("\n");
    }.property("comment"),

    totalNetAmount: function () {
        return this.get("items").reduce(function (previousValue, item) {
            return previousValue + item.get("netAmount");
        }, 0);
    }.property("items.@each.netAmount"),

    totalTaxAmount: function () {
        return this.get("items").reduce(function (previousValue, item) {
            return previousValue + item.get("taxAmount");
        }, 0);
    }.property("items.@each.taxAmount"),

    totalGrossAmount: function () {
        return this.get("items").reduce(function (previousValue, item) {
            return previousValue + item.get("grossAmount");
        }, 0);
    }.property("items.@each.grossAmount"),

    totalGrossAmountInWords: function () {
        var dollars, cents,
            amount = String(this.get("totalGrossAmount"));

        dollars = amount.substr(0, amount.length - 2);
        cents = amount.substr(amount.length - 2, amount.length);

        if (dollars.length > 0) {
            return polishToWords(dollars) + " " + this.get("currency") + " " + cents + "/100";
        } else {
            return "";
        }
    }.property("totalGrossAmount", "currency"),

    englishTotalGrossAmountInWords: function () {
        var dollars, cents,
            amount = String(this.get("totalGrossAmount"));

        dollars = amount.substr(0, amount.length - 2);
        cents = amount.substr(amount.length - 2, amount.length);

        if (dollars.length > 0) {
            return toWords(dollars) + " " + this.get("currency") + " " + cents + "/100";
        } else {
            return "";
        }
    }.property("totalGrossAmount", "currency"),

    subTotals: function () {
        return Faktura.get("taxRates").map(function (taxRate) {
            var items, netAmount, taxAmount, grossAmount;

            items = this.get("items").filterBy("formattedTaxRate", taxRate);

            netAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("netAmount");
            }, 0);

            taxAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("taxAmount");
            }, 0);

            grossAmount = items.reduce(function (previousValue, item) {
                return previousValue + item.get("grossAmount");
            }, 0);

            return Ember.Object.create({
                formattedTaxRate: taxRate,
                netAmount: netAmount,
                taxAmount: taxAmount,
                grossAmount: grossAmount
            });
        }.bind(this)).reject(function (item) {
            return item.get("netAmount") === 0 && item.get("taxAmount") === 0 && item.get("grossAmount") === 0;
        });
    }.property("items.@each.netAmount", "items.@each.taxAmount", "items.@each.grossAmount", "items.@each.formattedTaxRate"),

    toJSON: function () {
        var result = this.getProperties("number", "dateOfIssue", "dateOfSale", "dueDate", "seller", "buyer", "currency", "language", "comment", "issuerSignature", "buyerSignature");
        result.items = this.get("items").invoke("toJSON");
        return result;
    }
});
