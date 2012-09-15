$(function () {

// Basic Album model, has a photo, a title, an artist and genre

    var Album = Backbone.Model.extend({
        defaults: {
            photo: "/img/placeholder.jpg",
            title: "N/A",
            artist: "N/A",
            genre: "N/A"
        },

        // Ensure it has at least a title
        initialize: function () {
            if (!this.get("title")) {
                this.set({"title": this.defaults.title});
            }
        },

        // Remove it from the localStorage
        clear: function () {
            this.destroy();
        }

    });

    // Album collection
    var AlbumList = Backbone.Collection.extend({
        model: Album,

        localStorage: new Store("albums-backbone")
    });

    // Create a new global collection of Albums
    var Albums = new AlbumList();

    var AlbumView = Backbone.View.extend({
        tagName: "article",
        className: "album-container",
        template: _.template($("#albumTemplate").html()),
        editTemplate: _.template($("#albumEditTemplate").html()),

        events: {
            "click button.delete": "deleteAlbum",
            "click button.edit": "editAlbum",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        },

        initialize: function () {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        editAlbum: function () {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdits: function (e) {
            e.preventDefault();

            var formData = {};

            $(e.target).closest("form").find(":input").add(".photo").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });

            if (formData.photo === "") {
                delete formData.photo;
            }

            this.model.save(formData);

            this.render();
        },

        cancelEdit: function () {
            this.render();
        },

        deleteAlbum: function () {
            this.model.destroy();
            this.remove();
        }
    });

    var AlbumListView = Backbone.View.extend({
        el: $("#albums"),

        events: {
            "click #add": "addAlbum"
        },

        initialize: function () {
            this.render();
            Albums.on("reset", this.render, this);
            Albums.on("add", this.renderAlbum, this);
            Albums.on("remove", this.removeAlbum, this);

            Albums.fetch();
        },

        render: function () {
            this.$el.find("article").remove();

            _.each(Albums.models, function (item) {
                this.renderAlbum(item);
            }, this);
        },

        renderAlbum: function (item) {
            var albumView = new AlbumView({
                model: item
            });
            this.$el.append(albumView.render().el);
        },

        addAlbum: function (e) {
            e.preventDefault();

            var formData = {};
            $("#addAlbum").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                    formData[el.id] = $(el).val();
                }
            });

            Albums.create(formData);

        },

        removeAlbum: function (removedModel) {
            var removed = removedModel.attributes;

            if (removed.photo === "/img/placeholder.jpg") {
                delete removed.photo;
            }
        }
    });

    var albumsList = new AlbumListView();
});
