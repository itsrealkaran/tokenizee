if not users then
    users = {
        itsrealkaran = {
          displayName = "Karan Singh",
          dateOfBirth = "2004-06-01",
          wallet = "KkBpSPg-bFQDt2wyYUZ4dOEZyUf73ITMZcTspxIaH0s",
          posts = { "post-1709123456-1234" },
          score = 0
        },
        ankushkun = {
          displayName = "Ankush Singh",
          dateOfBirth = "2004-06-15",
          wallet = "8iD-Gy_sKx98oth27JhjjP2V_xUSIGqs_8-skb63YHg",
          posts = { "post-1709123456-5678" },
          score = 0
        }
    }
end

local function generateId(prefix)
    local timestamp = os.time()
    local random = math.random(1000, 9999)
    return string.format("%s-%d-%d", prefix, timestamp, random)
end

if not posts then
    posts = {
        ["post-1709123456-1234"] = {
            id = "post-1709123456-1234",
            author = "itsrealkaran",
            title = "First Test Article",
            content = "Welcome to the network!",
            upvotes = 3,
            downvotes = 0,
            timestamp = os.time() - 500,
            shares = 2,
            comments = { "comment-1709123456-1111", "comment-1709123456-2222" }
        },
        ["post-1709123456-5678"] = {
            id = "post-1709123456-5678",
            author = "ankushkun",
            title = "Ankush Test",
            content = "GMAO",
            upvotes = 5,
            downvotes = 1,
            timestamp = os.time() - 400,
            shares = 1,
            comments = { "comment-1709123456-3333" }
        }
    }
end

if not comment then
    comment = {
        ["comment-1709123456-1111"] = {
            id = "comment-1709123456-1111",
            author = "itsrealkaran",
            content = "This is a test comment",
            timestamp = os.time() - 300
        },
        ["comment-1709123456-2222"] = {
            id = "comment-1709123456-2222",
            author = "ankushkun",
            content = "Great post!",
            timestamp = os.time() - 250
        },
        ["comment-1709123456-3333"] = {
            id = "comment-1709123456-3333",
            author = "itsrealkaran",
            content = "Nice one!",
            timestamp = os.time() - 200
        }
    }
end

local json = require("json")

Handlers.add("Register", { Action = "Register" }, function(msg)
    local username = msg.Tags["Username"]
    local displayName = msg.Tags["DisplayName"]
    local dateOfBirth = msg.Tags["DateOfBirth"]
    local wallet = msg.Tags["Wallet"]

    if not username or not displayName then
        ao.send({
            Target = msg.From,
            Tags = { Action = "RegisterResponse", Status = "Error" },
            Data = json.encode({ error = "Missing required fields." })
        })
        return
    end

    if users[username] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "RegisterResponse", Status = "Error" },
            Data = json.encode({ error = "Username already exists." })
        })
        return
    end

    users[username] = {
        displayName = displayName,
        dateOfBirth = dateOfBirth,
        wallet = wallet,
        posts = {},
        score = 0,
        followers = {},
        following = {},
        createdAt = os.time()
    }

    print(username .. " registered")
    ao.send({
        Target = msg.From,
        Tags = { Action = "RegisterResponse", Status = "Success" },
        Data = json.encode({ message = "User registered successfully." })
    })
end)

Handlers.add("CreatePost", { Action = "CreatePost" }, function(msg)
    local username = msg.Tags["Username"]
    local title, content = string.match(msg.Data, "([^:]+):(.+)")

    if not title or not content then
        ao.send({
            Target = msg.From,
            Tags = { Action = "CreatePostResponse", Status = "Error" },
            Data = json.encode({ error = "Invalid post format. Expected 'title: content'" })
        })
        return
    end

    if not users[username] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "CreatePostResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local postId = generateId("post")
    local timestamp = os.time()

    posts[postId] = {
        id = postId,
        author = username,
        title = title,
        content = content,
        upvotes = 0,
        downvotes = 0,
        createdAt = timestamp,
        shares = 0,
        comments = {}
    }

    table.insert(users[username].posts, postId)

    ao.send({
        Target = msg.From,
        Tags = { Action = "CreatePostResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Post created successfully.",
            postId = postId,
            post = posts[postId]
        })
    })
end)

Handlers.add("CommentPost", { Action = "CommentPost" }, function(msg)
    local postId = msg.Tags["PostId"]
    local username = msg.Tags["Username"]
    local content = msg.Data

    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "CommentPostResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    local commentId = generateId("comment")
    local timestamp = os.time()

    comment[commentId] = {
        id = commentId,
        author = username,
        content = content,
        timestamp = timestamp
    }

    table.insert(posts[postId].comments, commentId)

    ao.send({
        Target = msg.From,
        Tags = { Action = "CommentPostResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Comment posted successfully.",
            commentId = commentId,
            comment = comment[commentId]
        })
    })
end)

-- load comments of particular post
Handlers.add("LoadComments", { Action = "LoadComments" }, function(msg)
    local postId = msg.Tags["PostId"]
    
    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "LoadCommentsResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    local commentIds = posts[postId].comments
    local commentData = {}
    
    for _, commentId in ipairs(commentIds) do
        if comment[commentId] then
            table.insert(commentData, comment[commentId])
        end
    end
    
    ao.send({
        Target = msg.From,
        Tags = { Action = "LoadCommentsResponse", Status = "Success" },
        Data = json.encode({ comments = commentData })
    })
end)

Handlers.add("UpvotePost", { Action = "Upvote" }, function(msg)
    local postId = msg.Tags["PostId"]

    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "UpvoteResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    posts[postId].upvotes = posts[postId].upvotes + 1
    local author = posts[postId].author
    users[author].score = users[author].score + 1

    ao.send({
        Target = msg.From,
        Tags = { Action = "UpvoteResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Post upvoted successfully.",
            post = posts[postId]
        })
    })
end)

Handlers.add("DownvotePost", { Action = "Downvote" }, function(msg)
    local postId = msg.Tags["PostId"]

    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "DownvoteResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    posts[postId].downvotes = posts[postId].downvotes + 1
    local author = posts[postId].author
    users[author].score = users[author].score - 1

    ao.send({
        Target = msg.From,
        Tags = { Action = "DownvoteResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Post downvoted successfully.",
            post = posts[postId]
        })
    })
end)

Handlers.add("SharePost", { Action = "SharePost" }, function(msg)
    local postId = msg.Tags["PostId"]
    local username = msg.Tags["Username"]

    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "SharePostResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    posts[postId].shares = posts[postId].shares + 1

    ao.send({
        Target = msg.From,
        Tags = { Action = "SharePostResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Post shared successfully.",
            post = posts[postId]
        })
    })
end)

Handlers.add("FollowUser", { Action = "FollowUser" }, function(msg)
    local follower = msg.Tags["Follower"]
    local following = msg.Tags["Following"]

    if not users[follower] or not users[following] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "FollowUserResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    users[follower].following[following] = true
    users[following].followers[follower] = true

    ao.send({
        Target = msg.From,
        Tags = { Action = "FollowUserResponse", Status = "Success" },
        Data = json.encode({ 
            message = "User followed successfully.",
            follower = users[follower],
            following = users[following]
        })
    })
end)

-- get user by wallet address and username
Handlers.add("GetUser", { Action = "GetUser" }, function(msg)
    local wallet = msg.Tags["Wallet"]
    local username = msg.Tags["Username"]
    if not wallet and not username then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserResponse", Status = "Error" },
            Data = json.encode({ error = "Missing Wallet or Username tag." })
        })
        return
    end

    local foundUser = nil

    for uname, user in pairs(users) do
        if user.wallet == wallet or uname == username then
            foundUser = user
            break
        end
    end

    if not foundUser then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserResponse", Status = "Error" },
            Data = json.encode({ error = "User not found." })
        })
        return
    end

    local userInfo = {
        username = username,
        displayName = foundUser.displayName,
        dateOfBirth = foundUser.dateOfBirth,
        wallet = foundUser.wallet,
        followers = foundUser.followers,
        following = foundUser.following,
        score = foundUser.score,
        posts = foundUser.posts
    }

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetUserResponse", Status = "Success" },
        Data = json.encode({ user = userInfo })
    })
end)

Handlers.add("SearchUser", { Action = "SearchUser" }, function(msg)
    local searchTerm = msg.Tags["SearchTerm"]
    local results = {}

    for username, user in pairs(users) do
        if string.find(username, searchTerm) or string.find(user.wallet, searchTerm) or string.find(user.displayName, searchTerm) then
            table.insert(results, {
                username = username,
                displayName = user.displayName,
                score = user.score,
                followers = user.followers,
                following = user.following
            })
        end
    end

    ao.send({
        Target = msg.From,
        Tags = { Action = "SearchUserResponse", Status = "Success" },
        Data = json.encode({ users = results })
    })
end)

Handlers.add("GetFeed", { Action = "GetFeed" }, function(msg)
    local feed = {}

    for postId, post in pairs(posts) do
        table.insert(feed, post)
    end

    table.sort(feed, function(a, b)
        return a.timestamp > b.timestamp
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetFeedResponse", Status = "Success" },
        Data = json.encode({ posts = feed })
    })
end)

Handlers.add("GetTrending", { Action = "GetTrending" }, function(msg)
    local trending = {}

    for postId, post in pairs(posts) do
        post.netScore = post.upvotes - post.downvotes
        table.insert(trending, post)
    end

    table.sort(trending, function(a, b)
        return a.netScore > b.netScore
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetTrendingResponse", Status = "Success" },
        Data = json.encode({ posts = trending })
    })
end)

Handlers.add("GetLeaderboard", { Action = "GetLeaderboard" }, function(msg)
    local leaderboard = {}

    for username, user in pairs(users) do
        table.insert(leaderboard, {
            username = username,
            displayName = user.displayName,
            score = user.score
        })
    end

    table.sort(leaderboard, function(a, b)
        return a.score > b.score
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetLeaderboardResponse", Status = "Success" },
        Data = json.encode({ users = leaderboard })
    })
end)

Handlers.add("GetUserPosts", { Action = "GetUserPosts" }, function(msg)
    local username = msg.Tags["Username"]
    local user = users[username]

    if not user then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserPostsResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local userPosts = {}
    for _, postId in ipairs(user.posts) do
        if posts[postId] then
            table.insert(userPosts, posts[postId])
        end
    end

    -- Sort posts by creation time (newest first)
    table.sort(userPosts, function(a, b)
        return a.createdAt > b.createdAt
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetUserPostsResponse", Status = "Success" },
        Data = json.encode({ posts = userPosts })
    })
end)

Handlers.add("GetUserComments", { Action = "GetUserComments" }, function(msg)
    local username = msg.Tags["Username"]
    local user = users[username]

    if not user then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserCommentsResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local userComments = {}
    -- Search through all posts to find comments by this user
    for _, post in pairs(posts) do
        for _, commentId in ipairs(post.comments) do
            if comment[commentId] and comment[commentId].author == username then
                -- Add post reference to the comment
                local commentWithPost = {
                    ...comment[commentId],
                    postId = post.id,
                    postTitle = post.title
                }
                table.insert(userComments, commentWithPost)
            end
        end
    end

    -- Sort comments by timestamp (newest first)
    table.sort(userComments, function(a, b)
        return a.timestamp > b.timestamp
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetUserCommentsResponse", Status = "Success" },
        Data = json.encode({ comments = userComments })
    })
end)
