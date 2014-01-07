//<script src="/scripts/jquery-cookie/jquery.cookie.js"></script>

var LastWord = {
    Models: {},
    Views: {},
    
    apiKeyView: {},
    
    initialize: function () {
        this.apiKeyView = new LastWord.Views.ApiKey();
        this.apiKeyView.render();
    }

};

LastWord.Models.ApiKey = Backbone.Model.extend({
    defaults: {
        apiKey: ''
    },
    initialize: function(options) {
        this.set('apiKey', $.cookie('apikey') || '');
    }
});

LastWord.Views.ApiKey = Backbone.View.extend({
    el: '#apikey_view',
    template: _.template(
        '<p>Enter <a target="_blank" href="http://words.bighugelabs.com/">Big Huge Thesaurus</a> API key here:</p>' +
        '<textarea id="apikey", autofocus><%= apiKey %></textarea>'),
    initialize: function(options) {
        this.model = new LastWord.Models.ApiKey;
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        //this.container.append(this.$el);
        return this;
    }
});

//LastWord.Views.AppView = Backbone.View.extend({
//    el: $('body')
//});

$(document).ready(function () {
    LastWord.initialize();
});
