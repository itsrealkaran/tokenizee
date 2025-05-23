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
posts = {
    ["1"] = {
      author = "itsrealkaran",
      content = "Welcome to the network!",
      upvotes = 3,
      downvotes = 0,
      timestamp = os.time() - 500
    },
    ["2"] = {
      author = "ankushkun",
      content = "Building the future, one block at a time.",
      upvotes = 5,
      downvotes = 1,
      timestamp = os.time() - 400
    }
}
postCounter = 2

local json = require("json")

Handlers.add("Register", { Action = "Register" }, function(msg)
    local username = msg.Tags["Username"]
    local displayName = msg.Tags["DisplayName"]
    local dateOfBirth = msg.Tags["DateOfBirth"]
    local wallet = msg.Tags["Wallet"]

    if not username or not displayNam then
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
        score = 0
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
    local content = msg.Data

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
        content = content,
        upvotes = 0,
        downvotes = 0,
        timestamp = timestamp
    }

    table.insert(users[username].posts, postId)

    ao.send({
        Target = msg.From,
        Tags = { Action = "CreatePostResponse", Status = "Success", PostId = postId },
        Data = "Post created successfully."
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
        score = foundUser.score
    }

    ao.send({
        Target = msg.From,
        Tags = { Action = "GetUserResponse", Status = "Success" },
        Data = userInfo
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
