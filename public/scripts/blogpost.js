
var postId = window.location.pathname.split('/')[2];
var renderedForm = false;
var formError = false;

/* Retrieve JSON data from posts.json file. On success, it will populate the DOM
   with information about our article. Afterwards, this will iterate through all
   the comments from the post and append them to the comments section.   */
   
$.ajax({
    method: 'GET',
    url: '../api/posts',
    success: function(data) {
        var post = data[postId - 1];
        $('#blog-title').html(post.title);
        $('#author').html(post.author);
        $('#post-text').html(post.text);
        if (post.comments.length) {
            for (var i = 0; i < post.comments.length; i++) {
                $('#comments').after("<p><span class='comment-poster'>" + post.comments[i].user + "</span>" +
                                 "<span class='comment-message'>" + post.comments[i].message + "</span></p>");
            }
            $('.comment-message:last').after("</br><button id='new-comment'>New Comment</button>");
        }
        else {
            $('#comments').after("</br><button id='new-comment'>New Comment</button></br></br>");
        }
    }
});

/* Event delegation syntax has to be used because the id with new-comment does
   not yet exist in the dom. Check to see if the form has already been rendered
   to prevent duplicate requests. This will create a form for adding new comments */
   
$('body').on('click', '#new-comment', function() {
    if (!renderedForm) {
        var input = $('#new-comment').after("<div class='form'><label>User: </label> \
                                            <input type='text' class='user' /></br> \
                                            <label>Message: </label> \
                                            <input type='text' class='message' /></br> \
                                            <button class='submit-comment'>Submit Comment</button></div>");
        renderedForm = true;
    }
});

/* The id with submit-comment does not yet exist, so this syntax is required. Classes
   have to be used here instead of ids because there will be multiple elements like
   this. This will update the comments section with new comments and post the data
   to the json file */
   
$('body').on('click', '.submit-comment', function() {
    var user = $('.user').val();
    var message = $('.message').val();

    // Form validation. The form cannot submit with blank values
    if (!user || !message) {
        if (!formError) {
            $('.message').after("<p class='error'>User or message can't be blank</p>");
            formError = true;
        }
        return false;
    }
    else {
        if ($('.comment-message').length) {
            
            $(".comment-message:last").after("<p><span class='comment-poster'>" + user + "</span>" + 
                                         "<span class='comment-message'>" + message + "</span></p>");
        }
        else {
            $("#comments").after("<p><span class='comment-poster'>" + user + "</span>" + 
                                         "<span class='comment-message'>" + message + "</span></p>");
        }
        $('.error').remove();
        $.ajax({
            method: 'POST',
            url: '../api/posts',
            data: {
                'user': $('.comment-poster:last').html(),
                'message': $('.comment-message:last').html()
            },
            success: function(data) {
                console.log('Data was successfully posted');
            }
        });
    }
});
