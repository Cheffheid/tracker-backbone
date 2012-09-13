$(function () {

    var albums = [
        { title: "AC/DC Live", artist: "AC/DC", genre: "Hard rock" },
        { title: "Worship Music", artist: "Anthrax", genre: "Metal" },
        { title: "No Control", artist: "Bad Religion", genre: "Punk rock" },
        { title: "Black Sabbath", artist: "Black Sabbath", genre: "Metal" }
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
        template: _.template($("#albumTemplate").html()),
        
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }        
    });
    
    var AlbumListView = Backbone.View.extend({
        el: $("#albums"),
        
        initialize: function() {
            this.collection = new AlbumList(albums);

            this.render();
            this.$el.find("#filter-artists").append(this.createArtistsSelect());
            this.$el.find("#filter-genres").append(this.createGenresSelect());

            this.on("change:filterArtist", this.filterByArtist, this);
            this.on("change:filterGenre", this.filterByGenre, this);
            this.collection.on("reset", this.render, this);
        },
        
        render: function() {
            this.$el.find("article").remove();
        
            _.each(this.collection.models, function(item) {
                this.renderAlbum(item);
            }, this);
        },
        
        renderAlbum: function(item) {
            var albumView = new AlbumView({
                model: item
            });
            this.$el.append(albumView.render().el);
        },
        
        getItem: function(itemName) {
            return _.uniq(this.collection.pluck(itemName));
        },
        
        createArtistsSelect: function() {
            var select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });
                
            _.each(this.getItem("artist"), function(item) {
                var option = $("<option/>", {
                    value: item,
                    text: item
                }).appendTo(select);
            });
            return select;
        },
        
        createGenresSelect: function() {
            var select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });
                
            _.each(this.getItem("genre"), function(item) {
                var option = $("<option/>", {
                    value: item,
                    text: item
                }).appendTo(select);
            });
            return select;
        },
        
        events: {
            "change #filter-artists select": "setArtistFilter",
            "change #filter-genres select": "setGenreFilter"
        },
        
        setArtistFilter: function(e) {
            this.filterArtist = e.currentTarget.value;
            this.trigger("change:filterArtist");
        },
        
        filterByArtist: function () {
            $('#filter-genres select').val("All");
            
            if (this.filterArtist === "all") {
                this.collection.reset(albums);
                albumsRouter.navigate("filter/artist/all");
            } else {
                this.collection.reset(albums, { silent: true });
                
                var filterArtist = this.filterArtist,
                    filtered = _.filter(this.collection.models, function (item) {
                    return item.get("artist") === filterArtist;
                });
                
                this.collection.reset(filtered);
                albumsRouter.navigate("filter/artist/" + filterArtist);
            }
        },
        
        setGenreFilter: function(e) {
            this.filterGenre = e.currentTarget.value;
            this.trigger("change:filterGenre");
        },
        
        filterByGenre: function () {
            $('#filter-artists select').val("All");
            
            if (this.filterGenre === "all") {
                this.collection.reset(albums);
                albumsRouter.navigate("filter/genre/all");
            } else {
                this.collection.reset(albums, { silent: true });
                
                var filterGenre = this.filterGenre,
                    filtered = _.filter(this.collection.models, function (item) {
                    return item.get("genre") === filterGenre;
                });
                
                this.collection.reset(filtered);
                albumsRouter.navigate("filter/genre/" + filterGenre);
            }
        }
    });
    
    var AlbumsRouter = Backbone.Router.extend({
        routes: {
            "filter/:param/:type": "urlFilter"
        },
     
        urlFilter: function (param, type) {
            if(param === "artist") {
                directory.filterArtist = type;
                directory.trigger("change:filterArtist");
            } else if(param === "genre") {
                directory.filterGenre = type;
                directory.trigger("change:filterGenre");
            }
        }
    });
    
    var albumsList = new AlbumListView();
    var albumsRouter = new AlbumsRouter();
    Backbone.history.start();
});
