users = users or {
    itsrealkaran = {
        displayName = "Karan Singh",
        dateOfBirth = "2004-06-01",
        bio = "Tokenizee | Kapsul",
        wallet = "KkBpSPg-bFQDy3wyYUZ4dOEZyUf73ITMZcTspxIaH0s",
        posts = { "post-1709123456-1234" },
        bookmarkedPosts = {},
        score = 0,
        followers = {},
        following = {},
        createdAt = 1748131914411
    },
    ankushkun = {
        displayName = "Ankush Singh",
        dateOfBirth = "2004-06-15",
        bio = "BetterIdea",
        wallet = "8iD-Gy_sKx98oth27JhjjP2V_xUSIGqs_8-skb63YHg",
        posts = { "post-1709123456-5678" },
        bookmarkedPosts = {},
        score = 0,
        followers = {},
        following = {},
        createdAt = 1748131914415
    }
}

posts = posts or {
    ["post-1709123456-1234"] = {
        id = "post-1709123456-1234",
        author = {
            username = "itsrealkaran",
            displayName = "Karan Singh"
        },
        title = "First Test Article",
        content = "Welcome to the network!",
        topic = { "art", "tech" },
        upvotes = 3,
        downvotes = 0,
        createdAt = os.time() - 500,
        shares = 2,
        comments = { "comment-1709123456-1111", "comment-1709123456-2222" }
    },
    ["post-1709123456-5678"] = {
        id = "post-1709123456-5678",
        author = {
            username = "ankushkun",
            displayName = "Ankush Singh"
        },
        title = "Ankush Test",
        content = "GMAO",
        topic = {"tech"},
        upvotes = 5,
        downvotes = 1,
        createdAt = os.time() - 400,
        shares = 1,
        comments = { "comment-1709123456-3333" }
    }
}

comments = comments or {
    ["comment-1709123456-1111"] = {
        id = "comment-1709123456-1111",
        author = {
            username = "itsrealkaran",
            displayName = "Karan Singh"
        },
        content = "This is a test comment",
        createdAt = os.time() - 300
    },
    ["comment-1709123456-2222"] = {
        id = "comment-1709123456-2222",
        author = {
            username = "ankushkun",
            displayName = "Ankush Singh"
        },
        content = "Great post!",
        createdAt = os.time() - 250
    },
    ["comment-1709123456-3333"] = {
        id = "comment-1709123456-3333",
        author = {
            username = "itsrealkaran",
            displayName = "Karan Singh"
        },
        content = "Nice one!",
        createdAt = os.time() - 200
    }
}

-- users = users or {}
-- posts = posts or {}
-- comments = comments or {}

local function generateId(prefix)
    local timestamp = os.time()
    local random = math.random(1000, 9999)
    return string.format("%s-%d-%d", prefix, timestamp, random)
end

local json = require("json")

-- Add logging function at the top
local function log(level, message, data)
    local timestamp = os.date("%Y-%m-%d %H:%M:%S")
    local logMessage = string.format("[%s] [%s] %s", timestamp, level, message)
    if data then
        logMessage = logMessage .. " Data: " .. json.encode(data)
    end
    print(logMessage)
end

Handlers.add("Register", { Action = "Register" }, function(msg)
    log("INFO", "Register request received", {
        username = msg.Tags["Username"],
        displayName = msg.Tags["DisplayName"],
        wallet = msg.Tags["Wallet"]
    })

    local username = msg.Tags["Username"]
    local displayName = msg.Tags["DisplayName"]
    local dateOfBirth = msg.Tags["DateOfBirth"]
    local bio = msg.Tags["Bio"]
    local wallet = msg.Tags["Wallet"]

    -- Check if wallet is already used by any user
    for _, user in pairs(users) do
        if user.wallet == wallet then
            log("ERROR", "Wallet already exists", { wallet = wallet })
            ao.send({
                Target = msg.From,
                Tags = { Action = "RegisterResponse", Status = "Error" },
                Data = json.encode({ error = "Wallet already exists." })
            })
            return
        end
    end

    if not username or not displayName then
        log("ERROR", "Missing required fields", { username = username, displayName = displayName })
        ao.send({
            Target = msg.From,
            Tags = { Action = "RegisterResponse", Status = "Error" },
            Data = json.encode({ error = "Missing required fields." })
        })
        return
    end

    if users[username] then
        log("ERROR", "Username already exists", { username = username })
        ao.send({
            Target = msg.From,
            Tags = { Action = "RegisterResponse", Status = "Error" },
            Data = json.encode({ error = "Username already exists." })
        })
        return
    end

    local timestamp = os.time()
    users[username] = {
        username = username,
        displayName = displayName,
        dateOfBirth = dateOfBirth,
        bio = bio,
        wallet = wallet,
        posts = {},
        bookmarkedPosts = {},
        score = 0,
        followers = {},
        following = {},
        createdAt = timestamp
    }

    log("INFO", "User registered successfully", { username = username })
    ao.send({
        Target = msg.From,
        Tags = { Action = "RegisterResponse", Status = "Success" },
        Data = json.encode({ 
            message = "User registered successfully.",
            user = users[username]
        })
    })
end)

--update user
Handlers.add("UpdateUser", { Action = "UpdateUser" }, function(msg)
    log("INFO", "Update user request received", {
        username = msg.Tags["Username"],
        newUsername = msg.Tags["NewUsername"]
    })

    local username = msg.Tags["Username"]
    local newUsername = msg.Tags["NewUsername"]
    local displayName = msg.Tags["DisplayName"]
    local dateOfBirth = msg.Tags["DateOfBirth"]
    local bio = msg.Tags["Bio"]

    if not users[username] then
        log("ERROR", "User does not exist", { username = username })
        ao.send({
            Target = msg.From,
            Tags = { Action = "UpdateUserResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    -- Check if new username is already taken
    if newUsername ~= username and users[newUsername] then
        log("ERROR", "New username already exists", { newUsername = newUsername })
        ao.send({
            Target = msg.From,
            Tags = { Action = "UpdateUserResponse", Status = "Error" },
            Data = json.encode({ error = "New username already exists." })
        })
        return
    end

    -- Store the old user data
    local oldUserData = users[username]

    -- Create new user entry with updated data
    users[newUsername] = {
        username = newUsername,
        displayName = displayName,
        dateOfBirth = dateOfBirth,
        bio = bio,
        wallet = oldUserData.wallet,
        posts = oldUserData.posts,
        bookmarkedPosts = oldUserData.bookmarkedPosts,
        score = oldUserData.score,
        followers = oldUserData.followers,
        following = oldUserData.following,
        createdAt = oldUserData.createdAt
    }

    -- Remove old user entry if username changed
    if newUsername ~= username then
        users[username] = nil
    end

    -- Update posts
    for _, postId in ipairs(users[newUsername].posts) do
        if posts[postId] and posts[postId].author then
            posts[postId].author.username = newUsername
            posts[postId].author.displayName = displayName
        end
    end

    -- Update comments
    for _, postId in ipairs(users[newUsername].posts) do
        if posts[postId] and posts[postId].comments then
            for _, commentId in ipairs(posts[postId].comments) do
                if comments[commentId] and comments[commentId].author then
                    comments[commentId].author.username = newUsername
                    comments[commentId].author.displayName = displayName
                end
            end
        end
    end

    -- Update followers and following references
    for follower, _ in pairs(users[newUsername].followers) do
        if users[follower] then
            users[follower].following[username] = nil
            users[follower].following[newUsername] = true
        end
    end

    for following, _ in pairs(users[newUsername].following) do
        if users[following] then
            users[following].followers[username] = nil
            users[following].followers[newUsername] = true
        end
    end

    log("INFO", "User updated successfully", { 
        oldUsername = username,
        newUsername = newUsername
    })

    ao.send({
        Target = msg.From,
        Tags = { Action = "UpdateUserResponse", Status = "Success" },
        Data = json.encode({ 
            message = "User updated successfully.", 
            user = users[newUsername] 
        })
    })
end)

Handlers.add("CreatePost", { Action = "CreatePost" }, function(msg)
    log("INFO", "Create post request received", {
        username = msg.Tags["Username"],
        title = msg.Tags["Title"]
    })
    
    local username = msg.Tags["Username"]
    
    if not users[username] then
        log("ERROR", "User does not exist", { username = username })
        ao.send({
            Target = msg.From,
            Tags = { Action = "CreatePostResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local displayName = users[username].displayName
    local title = msg.Tags["Title"]
    local content = msg.Tags["Content"]
    local topic = msg.Tags["Topic"]

    if not title or not content then
        log("ERROR", "Invalid post format", { title = title, content = content })
        ao.send({
            Target = msg.From,
            Tags = { Action = "CreatePostResponse", Status = "Error" },
            Data = json.encode({ error = "Invalid post format. Expected 'title: content'" })
        })
        return
    end

    local postId = generateId("post")
    local timestamp = os.time()

    posts[postId] = {
        id = postId,
        author = {
            username = username,
            displayName = displayName
        },
        title = title,
        content = content,
        topic = topic,
        upvotes = 0,
        downvotes = 0,
        createdAt = timestamp,
        shares = 0,
        comments = {}
    }

    table.insert(users[username].posts, postId)

    log("INFO", "Post created successfully", { 
        postId = postId,
        username = username
    })

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
    log("INFO", "Comment post request received", {
        postId = msg.Tags["PostId"],
        username = msg.Tags["Username"],
        content = msg.Tags["Content"]
    })

    local postId = msg.Tags["PostId"]
    local username = msg.Tags["Username"]
    local content = msg.Tags["Content"]
    
    if not users[username] then
        log("ERROR", "User does not exist", { username = username })
        ao.send({
            Target = msg.From,
            Tags = { Action = "CommentPostResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    if not posts[postId] then
        log("ERROR", "Post does not exist", { postId = postId })
        ao.send({
            Target = msg.From,
            Tags = { Action = "CommentPostResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    local displayName = users[username].displayName

    if not content or content == "" then
        log("ERROR", "Empty comment content", { username = username })
        ao.send({
            Target = msg.From,
            Tags = { Action = "CommentPostResponse", Status = "Error" },
            Data = json.encode({ error = "Comment content cannot be empty." })
        })
        return
    end

    local commentId = generateId("comment")
    local timestamp = os.time()

    comments[commentId] = {
        id = commentId,
        author = {
            username = username,
            displayName = displayName
        },
        content = content,
        createdAt = timestamp,
        postId = postId
    }

    -- Add comment to post's comments array
    table.insert(posts[postId].comments, commentId)

    log("INFO", "Comment posted successfully", { 
        commentId = commentId,
        postId = postId,
        username = username,
        content = content
    })

    ao.send({
        Target = msg.From,
        Tags = { Action = "CommentPostResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Comment posted successfully.",
            commentId = commentId,
            comment = comments[commentId]
        })
    })
end)

Handlers.add("LoadComments", { Action = "LoadComments" }, function(msg)
    local postId = msg.Tags["PostId"]
    
    if not postId then
        ao.send({
            Target = msg.From,
            Tags = { Action = "LoadCommentsResponse", Status = "Error" },
            Data = json.encode({ error = "Missing PostId tag." })
        })
        return
    end

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
        if comments[commentId] then
            table.insert(commentData, comments[commentId])
        end
    end

    -- Sort comments by creation time (newest first)
    table.sort(commentData, function(a, b)
        return a.createdAt > b.createdAt
    end)
    
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
    local username = posts[postId].author.username
    users[username].score = users[username].score + 1

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
    local username = posts[postId].author.username
    users[username].score = users[username].score - 1

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
    local foundUsername = nil

    for uname, user in pairs(users) do
        if user.wallet == wallet or uname == username then
            foundUser = user
            foundUsername = uname
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
        username = foundUsername,
        displayName = foundUser.displayName,
        dateOfBirth = foundUser.dateOfBirth,
        bio = foundUser.bio,
        wallet = foundUser.wallet,
        followers = foundUser.followers,
        following = foundUser.following,
        score = foundUser.score,
        posts = foundUser.posts,
        createdAt = foundUser.createdAt
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
                bio = user.bio,
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

    -- Sort posts by creation time (newest first)
    table.sort(feed, function(a, b)
        return a.createdAt > b.createdAt
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

    -- Sort posts by net score (highest first)
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
    
    if not username then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserCommentsResponse", Status = "Error" },
            Data = json.encode({ error = "Missing Username tag." })
        })
        return
    end

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
            if comments[commentId] and comments[commentId].author.username == username then
                -- Create a new table with all comment data plus post info
                local commentWithPost = {
                    id = comments[commentId].id,
                    author = comments[commentId].author,
                    content = comments[commentId].content,
                    createdAt = comments[commentId].createdAt,
                    postId = post.id,
                    postTitle = post.title
                }
                table.insert(userComments, commentWithPost)
            end
        end
    end

    -- Sort comments by creation time (newest first)
    table.sort(userComments, function(a, b)
        return a.createdAt > b.createdAt
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetUserCommentsResponse", Status = "Success" },
        Data = json.encode({ comments = userComments })
    })
end)

Handlers.add("BookmarkPost", { Action = "BookmarkPost" }, function(msg)
    local username = msg.Tags["Username"]
    local postId = msg.Tags["PostId"]
    local action = msg.Tags["Action"] -- "add" or "remove"

    if not users[username] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "BookmarkPostResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    if not posts[postId] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "BookmarkPostResponse", Status = "Error" },
            Data = json.encode({ error = "Post does not exist." })
        })
        return
    end

    if action == "add" then
        -- Check if post is already bookmarked
        for _, id in ipairs(users[username].bookmarkedPosts) do
            if id == postId then
                ao.send({
                    Target = msg.From,
                    Tags = { Action = "BookmarkPostResponse", Status = "Error" },
                    Data = json.encode({ error = "Post already bookmarked." })
                })
                return
            end
        end
        table.insert(users[username].bookmarkedPosts, postId)
    elseif action == "remove" then
        -- Remove post from bookmarks
        for i, id in ipairs(users[username].bookmarkedPosts) do
            if id == postId then
                table.remove(users[username].bookmarkedPosts, i)
                break
            end
        end
    else
        ao.send({
            Target = msg.From,
            Tags = { Action = "BookmarkPostResponse", Status = "Error" },
            Data = json.encode({ error = "Invalid action. Use 'add' or 'remove'." })
        })
        return
    end

    ao.send({
        Target = msg.From,
        Tags = { Action = "BookmarkPostResponse", Status = "Success" },
        Data = json.encode({ 
            message = "Bookmark updated successfully.",
            bookmarkedPosts = users[username].bookmarkedPosts
        })
    })
end)

Handlers.add("GetPersonalizedFeed", { Action = "GetPersonalizedFeed" }, function(msg)
    local username = msg.Tags["Username"]
    
    if not users[username] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetPersonalizedFeedResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local feed = {}
    local user = users[username]

    -- Get posts from followed users
    for following, _ in pairs(user.following) do
        if users[following] then
            for _, postId in ipairs(users[following].posts) do
                if posts[postId] then
                    table.insert(feed, posts[postId])
                end
            end
        end
    end

    -- Add user's own posts
    for _, postId in ipairs(user.posts) do
        if posts[postId] then
            table.insert(feed, posts[postId])
        end
    end

    -- Sort posts by creation time (newest first)
    table.sort(feed, function(a, b)
        return a.createdAt > b.createdAt
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetPersonalizedFeedResponse", Status = "Success" },
        Data = json.encode({ posts = feed })
    })
end)

Handlers.add("GetBookmarkedFeed", { Action = "GetBookmarkedFeed" }, function(msg)
    local username = msg.Tags["Username"]
    
    if not users[username] then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetBookmarkedFeedResponse", Status = "Error" },
            Data = json.encode({ error = "User does not exist." })
        })
        return
    end

    local feed = {}
    local user = users[username]

    for _, postId in ipairs(user.bookmarkedPosts) do
        if posts[postId] then
            table.insert(feed, posts[postId])
        end
    end

    -- Sort posts by creation time (newest first)
    table.sort(feed, function(a, b)
        return a.createdAt > b.createdAt
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetBookmarkedFeedResponse", Status = "Success" },
        Data = json.encode({ posts = feed })
    })
end)

Handlers.add("GetTopicFeed", { Action = "GetTopicFeed" }, function(msg)
    local topic = msg.Tags["Topic"]
    
    if not topic then
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetTopicFeedResponse", Status = "Error" },
            Data = json.encode({ error = "Missing Topic tag." })
        })
        return
    end

    local feed = {}

    for _, post in pairs(posts) do
        if post.topic == topic then
            table.insert(feed, post)
        end
    end

    -- Sort posts by creation time (newest first)
    table.sort(feed, function(a, b)
        return a.createdAt > b.createdAt
    end)

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetTopicFeedResponse", Status = "Success" },
        Data = json.encode({ posts = feed })
    })
end)