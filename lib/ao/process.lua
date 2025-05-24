if not users then
    users = {
        itsrealkaran = {
          displayName = "Karan Singh",
          dateOfBirth = "2004-06-01",
          wallet = "KkBpSPg-bFQDt2wyYUZ4dOEZyUf73ITMZcTspxIaH0s",
          posts = { "1" },
          score = 0
        },
        ankushkun = {
          displayName = "Ankush Singh",
          dateOfBirth = "2004-06-15",
          wallet = "8iD-Gy_sKx98oth27JhjjP2V_xUSIGqs_8-skb63YHg",
          posts = { "2" },
          score = 0
        }
    }
end

if not posts then
    posts = {
        ["1"] = {
          author = "itsrealkaran",
          title = "First Test Article",
          content = "Welcome to the network!",
          upvotes = 3,
          downvotes = 0,
          timestamp = os.time() - 500
        },
        ["2"] = {
          author = "ankushkun",
          title = "Ankush Test",
          content = "GMAO",
          upvotes = 5,
          downvotes = 1,
          timestamp = os.time() - 400
        }
    }
end

if not postCounter then
    postCounter = 2
end

if not comment then
    comment = {
        ["1"] = {
            author = "itsrealkaran",
            content = "This is a test comment",
            timestamp = os.time() - 300
        }
    }
end

if not commentCounter then
    commentCounter = 1
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
                Data = "Missing required fields."
            })
            return
        end
    
        if users[username] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "RegisterResponse", Status = "Error" },
                Data = "Username already exists."
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
            Data = "User registered successfully."
        })
    end)
    
    Handlers.add("CreatePost", { Action = "CreatePost" }, function(msg)
        local username = msg.Tags["Username"]
        local title, content = string.match(msg.Data, "([^:]+):(.+)")
        if not title or not content then
            ao.send({
                Target = msg.From,
                Tags = { Action = "CreatePostResponse", Status = "Error" },
                Data = "Invalid post format. Expected 'title: content'"
            })
            return
        end
    
        if not users[username] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "CreatePostResponse", Status = "Error" },
                Data = "User does not exist."
            })
            return
        end
    
        postCounter = postCounter + 1
        local postId = tostring(postCounter)
        local timestamp = os.time()
    
        posts[postId] = {
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
            Tags = { Action = "CreatePostResponse", Status = "Success", PostId = postId },
            Data = "Post created successfully."
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
                Data = "Post does not exist."
            })
            return
        end

        commentCounter = commentCounter + 1
        local commentId = tostring(commentCounter)
        local timestamp = os.time() 

        comment[commentId] = {
            author = username,
            content = content,
            timestamp = timestamp
        }   

        table.insert(posts[postId].comments, commentId)

        ao.send({
            Target = msg.From,
            Tags = { Action = "CommentPostResponse", Status = "Success" },
            Data = "Comment posted successfully."
        })
    end)
    
    Handlers.add("UpvotePost", { Action = "Upvote" }, function(msg)
        local postId = msg.Tags["PostId"]
    
        if not posts[postId] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "UpvoteResponse", Status = "Error" },
                Data = "Post does not exist."
            })
            return
        end
    
        posts[postId].upvotes = posts[postId].upvotes + 1
        local author = posts[postId].author
        users[author].score = users[author].score + 1
    
        ao.send({
            Target = msg.From,
            Tags = { Action = "UpvoteResponse", Status = "Success" },
            Data = "Post upvoted successfully."
        })
    end)
    
    Handlers.add("DownvotePost", { Action = "Downvote" }, function(msg)
        local postId = msg.Tags["PostId"]
    
        if not posts[postId] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "DownvoteResponse", Status = "Error" },
                Data = "Post does not exist."
            })
            return
        end
    
        posts[postId].downvotes = posts[postId].downvotes + 1
        local author = posts[postId].author
        users[author].score = users[author].score - 1
    
        ao.send({
            Target = msg.From,
            Tags = { Action = "DownvoteResponse", Status = "Success" },
            Data = "Post downvoted successfully."
        })
    end)

    Handlers.add("SharePost", { Action = "SharePost" }, function(msg)
        local postId = msg.Tags["PostId"]
        local username = msg.Tags["Username"]
    
        if not posts[postId] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "SharePostResponse", Status = "Error" },
                Data = "Post does not exist."
            })
            return
        end

        posts[postId].shares = posts[postId].shares + 1
    
        ao.send({
            Target = msg.From,
            Tags = { Action = "SharePostResponse", Status = "Success" },
            Data = "Post shared successfully."
        })
    end)
    
    Handlers.add("FollowUser", { Action = "FollowUser" }, function(msg)
        local follower = msg.Tags["Follower"]
        local following = msg.Tags["Following"]

        if not users[follower] or not users[following] then
            ao.send({
                Target = msg.From,
                Tags = { Action = "FollowUserResponse", Status = "Error" },
                Data = "User does not exist."
            })
            return
        end

        users[follower].following[following] = true
        users[following].followers[follower] = true

        ao.send({
            Target = msg.From,
            Tags = { Action = "FollowUserResponse", Status = "Success" },
            Data = "User followed successfully."
        })
    end)

    Handlers.add("GetUser", { Action = "GetUser" }, function(msg)
        local wallet = msg.Tags["Wallet"]
        if not wallet then
            ao.send({
                Target = msg.From,
                Tags = { Action = "GetUserResponse", Status = "Error" },
                Data = "Missing Wallet tag."
            })
            return
        end
    
        local foundUser = nil
        local username = nil
    
        for uname, user in pairs(users) do
            if user.wallet == wallet then
                foundUser = user
                username = uname
                break
            end
        end
    
        if not foundUser then
            ao.send({
                Target = msg.From,
                Tags = { Action = "GetUserResponse", Status = "Error" },
                Data = "User not found."
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
            Data = userInfo
        })
    end)

    Handlers.add("SearchUser", { Action = "SearchUser" }, function(msg)
        local searchTerm = msg.Tags["SearchTerm"]
        local results = {}

        for username, user in pairs(users) do
            if string.find(username, searchTerm) or string.find(user.wallet, searchTerm) or string.find(user.displayName, searchTerm) then
                table.insert(results, user)
            end
        end

        ao.send({
            Target = msg.From,
            Tags = { Action = "SearchUserResponse", Status = "Success" },
            Data = results
        })
    end) 
    
    Handlers.add("GetUserProfile", { Action = "GetUserProfile" }, function(msg)
        local username = msg.Tags["Username"]
        local user = users[username]
    
        if not user then
            ao.send({
                Target = msg.From,
                Tags = { Action = "GetUserProfileResponse", Status = "Error" },
                Data = "User does not exist."
            })
            return
        end
    
        local userPosts = {}
        for _, postId in ipairs(user.posts) do
            table.insert(userPosts, posts[postId])
        end
    
        local profile = {
            user = {
                username = user.username,
                displayName = user.displayName,
                dateOfBirth = user.dateOfBirth,
                wallet = user.wallet,
                score = user.score,
                followers = user.followers,
                following = user.following,
                posts = user.posts
            },
            posts = userPosts
        }
    
        ao.send({
            Target = msg.From,
            Tags = { Action = "GetUserProfileResponse", Status = "Success" },
            Data = profile
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
            Data = feed
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
            Data = trending
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
            Data = leaderboard
        })
    end)
    