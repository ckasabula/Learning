// TODO: move script references here (now in HTML file) - require.js?
// TODO: switch from _ templates to handlebars/mustash templates
// TODO: move templates to separate files
// TODO: refactor into separate files
// TODO: try/use http://marionettejs.com/

var LastWord = {
    Models: {},
    Views: {},
    
    apiKeyView: {},
    apiKeyModel: {},
    textView: {},
    lastWordModel: {},

    initialize: function () {
        this.apiKeyModel = new LastWord.Models.ApiKey();
        this.apiKeyView = new LastWord.Views.ApiKey({ model: this.apiKeyModel });
        this.lastWordModel = new LastWord.Models.LastWord();
        this.textView = new LastWord.Views.Text({ model: this.lastWordModel });
        this.apiKeyView.render();
        this.textView.render();
    }
};

LastWord.Models.ApiKey = Backbone.Model.extend({
    defaults: {
        apiKey: ''
    },
    initialize: function(options) {
        this.set('apiKey', $.cookie('apiKey') || '');
    },
    save: function (attributes, options) {
        $.cookie('apiKey', this.get('apiKey'), { expires: 365 });
    }
});

LastWord.Models.LastWord = Backbone.Model.extend({
    defaults: {
        lastWord: ''
    }
});

LastWord.Views.ApiKey = Backbone.View.extend({
    el: '#apikey_view',
    template: _.template(
        '<p>Enter <a target="_blank" href="http://words.bighugelabs.com/">Big Huge Thesaurus</a> API key here:</p>' +
        '<textarea id="apikey", autofocus><%= apiKey %></textarea>'),
    events: {
        "blur #apikey": "onBlur"
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onBlur: function() {
        this.model.set('apiKey', $("#apikey").val());
        this.model.save();
    },
});

LastWord.Views.Text = Backbone.View.extend({
    el: '#text_view',
    template: _.template(
        '<p>Enter text here:</p>' +
        '<textarea id="text1" autofocus></textarea>' +
        '<br style="clear:left">' +
        '<input type="button" id="clear" value="Clear">' +
        '<br style="clear:left">' +
        '<p>Last word:</p>' +
        '<textarea id="last" readonly></textarea>'),
    events: {
        "click #clear": "onClear",
        "keypress #text1": "onKeypress"
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onClear: function() {
        $("#text1").val("");
    },
    getLastWord: function(text) {
        var match = text.match(/\S\w*$/);
        return match;
    },
    onKeypress: function(evt) {
        var key = String.fromCharCode(evt.charCode);
        var whiteSpace = key.match(/\s/);
        if (whiteSpace) {
            var val = $(evt.target).val();
            var last = this.getLastWord(val.substr(0, this.selectionEnd));
            if (last) {
                this.model.set('lastWord', last);
            }
        }
    }
});

$(document).ready(function () {
    LastWord.initialize();
});
