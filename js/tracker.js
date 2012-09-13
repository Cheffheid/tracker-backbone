$(function () {

    var albums = [
        { title: "AC-DC Live", artist: "AC-DC", genre: "Hard rock" },
        { title: "Worship Music", artist: "Anthrax", genre: "Metal" },
        { title: "No Control", artist: "Bad Religion", genre: "Punk rock" },
        { title: "Black Sabbath", artist: "Black Sabbath", genre: "Metal" }
    ];
    
    var Album = Backbone.Model.extend({
        defaults: {
            photo: "/img/placeholder.jpg",
            title: "N/A",
            artist: "N/A",
            genre: "N/A"
        }
    });
    
    var AlbumList = Backbone.Collection.extend({
        model: Album
    });
    
    var AlbumView = Backbone.View.extend({
        tagName: "article",
        className: "album-container",
        template: _.template($("#albumTemplate").html()),
        
        events: {
            "click button.delete": "deleteAlbum"
        },
        
        deleteAlbum: function () {
            var removedArtist = this.model.get("artist");
            var removedGenre = this.model.get("genre");
         
            this.model.destroy();
         
            this.remove();
         
            if (_.indexOf(albumsList.getItem("artist"), removedArtist) === -1) {
                albumsList.$el.find("#filter-artists select").children("[value='" + removedArtist + "']").remove();
            }
            
            if (_.indexOf(albumsList.getItem("genre"), removedGenre) === -1) {
                albumsList.$el.find("#filter-genres select").children("[value='" + removedGenre + "']").remove();
            }
        },
        
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }        
    });
    
    var AlbumListView = Backbone.View.extend({
        el: $("#albums"),
        
        events: {
            "change #filter-artists select": "setArtistFilter",
            "change #filter-genres select": "setGenreFilter",
            "click #add": "addAlbum"
        },
        
        initialize: function() {
            this.collection = new AlbumList(albums);

            this.render();
            this.$el.find("#filter-artists").append(this.createArtistsSelect());
            this.$el.find("#filter-genres").append(this.createGenresSelect());

            this.on("change:filterArtist", this.filterByArtist, this);
            this.on("change:filterGenre", this.filterByGenre, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderAlbum, this);
            this.collection.on("remove", this.removeAlbum, this);
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
        },
        
        addAlbum: function(e) {
            e.preventDefault();
            
            var formData = {};
            $("#addAlbum").children("input").each(function (i, el) {
                if($(el).val() !== "") {
                    formData[el.id] = $(el).val();
                }
            });
            
            albums.push(formData);
            
            if(_.indexOf(this.getItem("artist"), formData.artist) === -1) {
                this.$el.find("#filter-artists").find("select").remove().end().append(this.createArtistsSelect());
            }
            if(_.indexOf(this.getItem("genre"), formData.genre) === -1) {
                this.$el.find("#filter-genres").find("select").remove().end().append(this.createGenressSelect());
            }
            
            this.collection.add(new Album(formData));
        
        },
        
        removeAlbum: function(removedModel) {
            var removed = removedModel.attributes;
            
            if (removed.photo === "/img/placeholder.jpg") {
                delete removed.photo;
            }
            
            _.each(albums, function (album) {
                if (_.isEqual(album, removed)) {
                    albums.splice(_.indexOf(albums, album), 1);
                }
            });        
        }
    });
    
    var AlbumsRouter = Backbone.Router.extend({
        routes: {
            "filter/:param/:type": "urlFilter"
        },
     
        urlFilter: function (param, type) {
            if(param === "artist") {
                albumsList.filterArtist = type;
                albumsList.trigger("change:filterArtist");
            } else if(param === "genre") {
                albumsList.filterGenre = type;
                albumsList.trigger("change:filterGenre");
            }
        }
    });
    
    var albumsList = new AlbumListView();
    var albumsRouter = new AlbumsRouter();
    Backbone.history.start();
});
