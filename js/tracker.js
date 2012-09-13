$(function () {

    var albums = [
        { title: "Live", artist: "AC/DC", genre: "" },
        { title: "Worship Music", artist: "Anthrax", genre: "" },
        { title: "No Control", artist: "Bad Religion", genre: "" },
        { title: "Black Sabbath", artist: "Black Sabbath", genre: "" }
    ];
    
    var Album = Backbone.Model.extend({
        defaults: {
            photo: "/img/placeholder.jpg"
        }
    });
    
    var AlbumList = Backbone.Collection.extend({
        model: Album
    });
    
    var AlbumView = Backbone.View.extend({
        tagName: "article",
        className: "album-container",
        template: $("#albumTemplate").html(),
        
        render: function() {
            var tmpl = _.template(this.template);
            
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }
    });
    
    var AlbumListView = Backbone.View.extend({
        el: $("#albums"),
        
        initialize: function() {
            this.collection = new AlbumList(albums);
            this.render();
        },
        
        render: function() {
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderAlbum(item);
            }, this);
        },
        
        renderAlbum: function(item) {
            var albumView = new AlbumView({
                model: item
            });
            this.$el.append(albumView.render().el);
        }
    });
    
    var albumlist = new AlbumListView();
});
