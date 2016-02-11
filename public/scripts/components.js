// This file deals with react components 

var Post = React.createClass({
    render: function() {
        return (
        <div className="post">
            <h3><a href={"/posts/" + this.props.id}>{this.props.title}</a></h3>
            <address className="postAuthor">Written By {this.props.author}</address>
            <time>{this.props.date}</time>
            <p>{this.props.children}</p>
        </div>
        );
    }
});

var PostBox = React.createClass({
    loadPostsFromServer: function() {
        $.getJSON(this.props.url)
            .then(function(newPosts) {
                this.setState({ data: newPosts });
            }.bind(this))
            .fail(function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            });
    },
    handlePostSubmit: function(post) {
        var posts = this.state.data;

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: post,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: posts});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
        
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadPostsFromServer();
        setInterval(this.loadPostsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
        <div className="PostBox">
            <h1>Blog Posts</h1>
            <PostList data={this.state.data} />
            <PostForm onPostSubmit={this.handlePostSubmit} />
        </div>
        );
    }
});

var PostList = React.createClass({
    render: function() {
        var postNodes = this.props.data.map(function(post) {
            return (
            <Post author={post.author} id={post.id} title={post.title} date={post.date}>
                {post.text}
            </Post>
            );
        });
        return <div className="PostList">{postNodes}</div>
    }
});

var PostForm = React.createClass({
    getInitialState: function() {
        return {author: '', text: '', title: ''};
    },
    handleAuthorChange: function(e) {
        this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleTitleChange: function(e) {
        this.setState({title: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        var title = this.state.title.trim();
        if (!text || !author || !title) {
            return;
        }
        this.props.onPostSubmit({title: title, author: author, text: text});
        this.setState({title: '', author: '', text: ''});
    },
    render: function() {
        return (
        <form className="PostForm" onSubmit={this.handleSubmit}>
            <h3>Create a blog post</h3>
            <div className="form-group">
                <label>Title</label>
                <input type="text" value={this.state.title} onChange={this.handleTitleChange} />
            </div>
        
            <div className="form-group">
                <label>Author</label>
                <input type="text" value={this.state.author} onChange={this.handleAuthorChange} />
            </div>
        
            <div className="form-group">
                <label>Body</label>
                <textarea rows='4' cols = '50' value={this.state.text} onChange={this.handleTextChange}></textarea>
            </div>
        
            <input type="submit" value="Post" className='submit-comment'/>
        </form>
        );
    }
});

ReactDOM.render(
    <PostBox url="/api/posts" pollInterval={2000} />,
    document.getElementById('content')
);
