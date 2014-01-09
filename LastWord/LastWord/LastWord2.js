// TODO: move script references here (now in HTML file) - require.js?
// TODO: switch from _ templates to handlebars/mustash templates
// TODO: move templates to separate files
// TODO: refactor into separate files
// TODO: try/use http://marionettejs.com/

// TODO: move this into the app object (w/ move to require.js)
// use Handlebars-style templating syntax in _.template
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var LastWord = {
    Models: {},
    Views: {},
    
    apiKeyView: {},
    apiKeyModel: {},
    textView: {},
    lastWordView: {},
    lastWordModel: {},
    thesaurusModel: {},
    thesaurusView: {},

    initialize: function () {
        this.apiKeyModel = new LastWord.Models.ApiKey();
        this.apiKeyView = new LastWord.Views.ApiKey({ model: this.apiKeyModel });

        this.lastWordModel = new LastWord.Models.LastWord();
        this.lastWordView = new LastWord.Views.LastWord({ model: this.lastWordModel });

        this.textView = new LastWord.Views.Text({ model: this.lastWordModel });

        this.thesaurusModel = new LastWord.Models.Thesaurus({ lastWordModel: this.lastWordModel, apiKeyModel: this.apiKeyModel });
        this.thesaurusView = new LastWord.Views.Thesaurus({ model: this.thesaurusModel });
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

LastWord.Models.Thesaurus = Backbone.Model.extend({
    defaults: {
        apiKeyModel: {},
        lastWordModel: {}
    },
    urlTemplate: _.template('http://words.bighugelabs.com/api/2/{{apiKey}}/{{lastWord}}/json'),
    initialize: function (options) {
        this.apiKeyModel = options.apiKeyModel;
        this.lastWordModel = options.lastWordModel;
        this.listenTo(this.lastWordModel, 'change', this.onLastWordChange);
    },
    onLastWordChange: function() {
        var urlAttrs = _.extend(this.apiKeyModel.attributes, this.lastWordModel.attributes);
        var url = this.urlTemplate(_.clone(urlAttrs));
        var options = { url: url, crossDomain: true, dataType: 'jsonp' };
        this.fetch(options);
    }
});

LastWord.Views.ApiKey = Backbone.View.extend({
    el: '#apikey_view',
    template: _.template(
        '<p>Enter <a target="_blank" href="http://words.bighugelabs.com/">Big Huge Thesaurus</a> API key here:</p>' +
        '<textarea id="apikey", autofocus>{{apiKey}}</textarea>'),
    events: {
        'blur #apikey': 'onBlur'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
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
        '<br style="clear:left">'),
    events: {
        'click #clear': 'onClear',
        'keypress #text1': 'onKeypress'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        this.$el.html(this.template());
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

LastWord.Views.LastWord = Backbone.View.extend({
    el: '#lastword_view',
    template: _.template(
        '<p>Last word:</p>' +
        '<textarea id="last" readonly>{{lastWord}}</textarea>'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

LastWord.Views.Thesaurus = Backbone.View.extend({
    el: '#thesaurus_view',
    template: _.template('<h2>Thesaurus</h2>'),
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});


$(document).ready(function () {
    LastWord.initialize();
});
