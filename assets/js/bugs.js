(function(window, document) {
    "use strict";

    // load essential elements and options
    var $content_bugs = $("#bugs-content");
    var $btn_back = $("#btn-bugs-back");
    var $btn_add = $("#btn-bugs-add");
    var editorOptions = {
        toolbar: {
            "font-styles": false
        }
    };

    // helper functions
    function registerEditors() {
        $("#bug-description").wysihtml5(editorOptions); // from add page
        $("#bug-comment-description").wysihtml5(editorOptions);

        $("#bugs-all").dataTable();

        $("#addon-name").typeahead({
                hint     : true,
                highlight: true,
                minLength: 2
            },
            {
                name      : 'addon-search',
                displayKey: "id",
                source    : function(query, cb) {
                    var matches = [];
                    $.get(SITE_ROOT + 'json/search.php', {"data-type": "addon", "search-filter": "name", "query": query}, function(data) {
                        var jData = parseJSON(data);
                        if (jData.hasOwnProperty("error")) {
                            console.error(jData["error"]);
                            return;
                        }

                        for (var i = 0; i < jData["addons"].length; i++) {
                            matches.push({"id": jData["addons"][i]})
                        }

                        cb(matches);
                    });
                }
        });
    }

    function btnToggle() {
        $btn_add.toggleClass("hide");
        $btn_back.toggleClass("hide");
        registerEditors();
    }

    function bugFormSubmit(form_identifier, callback_success) {
        if (!_.isFunction(callback_success)) {
            throw "callback parameter is not a function";
        }

        $content_bugs.on("submit", form_identifier, function() {
            $.ajax({
                type   : "POST",
                url    : SITE_ROOT + "json/bugs.php",
                data   : $(form_identifier).serialize(),
                success: callback_success
            }).fail(function() {
                console.error("bugFormSubmit post request failed");
            });

            return false;
        });
    }

    var NavigateTo = {
        index: function() {
            History.back();
            loadContentWithAjax("#bug-content", BUGS_LOCATION + 'all.php', {}, function() {
                btnToggle();
            });
        },
        add  : function() {
            History.pushState({state: "add"}, '', "?add");
            loadContentWithAjax("#bug-content", BUGS_LOCATION + 'add.php', {}, function() {
                btnToggle();
            });
        },
        view : function(bug_id) {
            History.pushState({state: "view"}, '', "?bug_id=" + bug_id);
            loadContentWithAjax("#bug-content", BUGS_LOCATION + 'view.php', {bug_id: bug_id}, function() {
                btnToggle();
            });
        }
    };

    // navigate add button clicked
    $content_bugs.on("click", "#btn-bugs-add", function() { // handle higher up the level for ajax
        NavigateTo.add();

        return false;
    });

    // navigate back button clicked
    $content_bugs.on("click", "#btn-bugs-back", function() {
        NavigateTo.index();

        return false;
    });

    // close bug clicked
    $content_bugs.on("click", "#btn-bugs-close", function() {
        var $modal = $("#modal-close");

        console.info("Close bug clicked");
        $modal.modal();

        bugFormSubmit("#modal-close-form", function(data) {
            var jData = parseJSON(data);
            if (jData.hasOwnProperty("error")) {
                growlError(jData["error"]);
            }
            if (jData.hasOwnProperty("success")) {
                growlSuccess(jData["success"]);

                $modal.modal("hide");
            }
        })
    });

    // edit bug clicked
    $content_bugs.on("click", "#btn-bugs-edit", function() {
        var $modal = $("#modal-edit"),
            el_modal_title = document.getElementById("bug-title-edit"),
            $modal_description = $("#bug-description-edit"),
            el_view_title = document.getElementById("bug-view-title"),
            el_view_description = document.getElementById("bug-view-description");

        console.info("Edit bug clicked");
        $modal.modal();

        $modal.on("shown.bs.modal", function(e) {
            if (!$modal_description.data("wysihtml5")) { // editor does not exist
                $modal_description.wysihtml5(editorOptions);
            }
        });

        bugFormSubmit("#modal-edit-form", function(data) {
            var jData = parseJSON(data);
            if (jData.hasOwnProperty("error")) {
                growlError(jData["error"]);
            }
            if (jData.hasOwnProperty("success")) {
                growlSuccess(jData["success"]);

                // update view
                el_view_title.innerHTML = el_modal_title.value;
                el_view_description.innerHTML = $modal_description.val();

                $modal.modal('hide');
            }
        });
    });

    // delete bug comment clicked
    $content_bugs.on("click", ".btn-bugs-comments-delete", function() {
        var $this = $(this), $modal = $("#modal-delete");
        var id =  $this.data("id");

        console.info("Delete comment clicked", id);
        $modal.data("id", id).modal(); // set the id to the modal

        return false;
    });

    // delete modal yes clicked
    $content_bugs.on("click", "#modal-delete-btn-yes", function() {
        var $modal = $("#modal-delete"),
            id = $modal.data("id");

        console.info("Delete modal btn yes clicked", id);
        $.post(SITE_ROOT + "json/bugs.php", {action: "delete-comment", "comment-id": id}, function(data) {
            var jData = parseJSON(data);
            if (jData.hasOwnProperty("error")) {
                growlError(jData["error"]);
            }
            if (jData.hasOwnProperty("success")) {
                growlSuccess(jData["success"]);

                // delete comment from view
                $("#c" + id).remove();

                $modal.modal('hide');
            }
        });
    });

    // edit bug comment clicked
    $content_bugs.on("click", ".btn-bugs-comments-edit", function() {
        var $this = $(this),
            $modal = $("#modal-comment-edit"),
            id = $this.data("id"),
            $modal_description = $("#bug-comment-edit-description"),
            $view_description = $("#c" + id + " .panel-body");

        console.info("Edit comment clicked", id);
        $modal.modal();

        $modal.on("shown.bs.modal", function(e) {
            if (!$modal_description.data("wysihtml5")) { // editor does not exist
                $modal_description.wysihtml5(editorOptions);
            }

            // update view
            $("#modal-comment-edit-id").val(id);
            $modal_description.data("wysihtml5").editor.setValue($view_description.html());
        });

        bugFormSubmit("#modal-comment-edit-form", function(data) {
            var jData = parseJSON(data);
            if (jData.hasOwnProperty("error")) {
                growlError(jData["error"]);
            }
            if (jData.hasOwnProperty("success")) {
                growlSuccess(jData["success"]);

                // update view
                $view_description.html($modal_description.val());

                $modal.modal("hide");
            }
        });

        return false;
    });

    // hover over close bug status
    $content_bugs.on("mouseenter", "#bug-view-status", function() {
       $("#bug-view-status").popover("toggle");
    });

    // clicked on a bug in the table
    $content_bugs.on("click", "table .bugs", function() {
        NavigateTo.view($(this).parent().attr("data-id"));

        return false;
    });

    // add bug form
    bugFormSubmit("#bug-add-form", function(data) {
        var jData = parseJSON(data);
        if (jData.hasOwnProperty("error")) {
            growlError(jData["error"]);
        }
        if (jData.hasOwnProperty("success")) {
            growlSuccess(jData["success"]);
            NavigateTo.index();
        }
    });

    // add bug comment form
    bugFormSubmit("#bug-add-comment-form", function(data) {
        var jData = parseJSON(data);
        if (jData.hasOwnProperty("error")) {
            growlError(jData["error"]);
        }
        if (jData.hasOwnProperty("success")) {
            growlSuccess(jData["success"]);

            $("#bug-comments").prepend(jData["comment"]);
            $("#bug-comment-description").html("");
        }
    });

    // search
    bugFormSubmit("#bug-search-form", function(data) {
        var jData = parseJSON(data);
        if (jData.hasOwnProperty("error")) {
            growlError(jData["error"]);
        } else {
            $("#bug-content").html(data);
        }
    });

    // Bind to StateChange Event
    // TODO fix browser back button
    History.Adapter.bind(window, 'statechange', function() {
        var state = History.getState();
        console.log(state);
    });

    registerEditors();

})(window, document);
