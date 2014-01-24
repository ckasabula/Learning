// TODO: move script references here (now in HTML file) - require.js?
// TODO: move templates to separate files w/ require.js, text.js text!
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
    el: '#apikey-view',
    events: {
        'blur #apikey': 'onBlur'
    },
    initialize: function () {
        this.template = Handlebars.compile($("#apikey-view-template").html());
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
    el: '#text-view',
    events: {
        'click #clear': 'onClear',
        'keypress #text1': 'onKeypress'
    },
    initialize: function () {
        this.template = Handlebars.compile($("#text-view-template").html());
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
    el: '#lastword-view',
    initialize: function () {
        this.template = Handlebars.compile($("#lastword-view-template").html());
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

LastWord.Views.Thesaurus = Backbone.View.extend({
    el: '#thesaurus-view',
    initialize: function () {
        Handlebars.registerPartial('word', $("#word-partial").html());

        this.template = Handlebars.compile($("#thesaurus-view-template").html());
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
