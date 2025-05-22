-- Tokenizee AO Process
-- Handles user interactions and content management

-- State
local State = {
  users = {},  -- {username = {displayName, dateOfBirth, wallet, score, posts = {postId = {content, upvotes, downvotes, timestamp}}}}
  posts = {},  -- {postId = {author, content, upvotes, downvotes, timestamp}}
  settings = {
    minUsernameLength = 3,
    minDisplayNameLength = 2,
    minPostLength = 10,
    maxPostLength = 1000
  }
}

-- Helper Functions
local function generateId()
  return tostring(os.time()) .. "-" .. tostring(math.random(1000, 9999))
end

local function validateUser(userData)
  if not userData.username or #userData.username < State.settings.minUsernameLength then
    return false, "Username must be at least " .. State.settings.minUsernameLength .. " characters"
  end
  if not userData.displayName or #userData.displayName < State.settings.minDisplayNameLength then
    return false, "Display name must be at least " .. State.settings.minDisplayNameLength .. " characters"
  end
  if not userData.dateOfBirth then
    return false, "Date of birth is required"
  end
  return true
end

local function validatePost(postData)
  if not postData.content then
    return false, "Content is required"
  end
  if #postData.content < State.settings.minPostLength then
    return false, "Post is too short"
  end
  if #postData.content > State.settings.maxPostLength then
    return false, "Post is too long"
  end
  return true
end

-- Handlers
Handlers.add("register",
  Handlers.utils.hasMatchingTag("Action", "Register"),
  function(msg)
    local userData = json.decode(msg.Data)
    local valid, error = validateUser(userData)
    
    if not valid then
      ao.send({
        Target = msg.From,
        Action = "Register-Error",
        Data = error
      })
      return
    end

    if State.users[userData.username] then
      ao.send({
        Target = msg.From,
        Action = "Register-Error",
        Data = "Username already exists"
      })
      return
    end

    local user = {
      username = userData.username,
      displayName = userData.displayName,
      dateOfBirth = userData.dateOfBirth,
      wallet = msg.From,
      score = 0,
      posts = {},  -- Will store post data directly
      createdAt = os.time()
    }

    State.users[userData.username] = user

    ao.send({
      Target = msg.From,
      Action = "Register-Success",
      Data = json.encode(user)
    })
  end
)

Handlers.add("create-post",
  Handlers.utils.hasMatchingTag("Action", "CreatePost"),
  function(msg)
    local postData = json.decode(msg.Data)
    local valid, error = validatePost(postData)
    
    if not valid then
      ao.send({
        Target = msg.From,
        Action = "CreatePost-Error",
        Data = error
      })
      return
    end

    local user = State.users[postData.author]
    if not user then
      ao.send({
        Target = msg.From,
        Action = "CreatePost-Error",
        Data = "User not found"
      })
      return
    end

    local postId = generateId()
    local timestamp = os.time()
    
    -- Create post data
    local post = {
      id = postId,
      author = postData.author,
      content = postData.content,
      upvotes = 0,
      downvotes = 0,
      timestamp = timestamp
    }

    -- Store in posts table
    State.posts[postId] = post

    -- Store in user's posts table
    user.posts[postId] = {
      content = postData.content,
      upvotes = 0,
      downvotes = 0,
      timestamp = timestamp
    }

    ao.send({
      Target = msg.From,
      Action = "CreatePost-Success",
      Data = json.encode(post)
    })
  end
)

Handlers.add("upvote",
  Handlers.utils.hasMatchingTag("Action", "Upvote"),
  function(msg)
    local voteData = json.decode(msg.Data)
    local post = State.posts[voteData.postId]
    
    if not post then
      ao.send({
        Target = msg.From,
        Action = "Upvote-Error",
        Data = "Post not found"
      })
      return
    end

    -- Update post in posts table
    post.upvotes = post.upvotes + 1

    -- Update post in user's posts table
    local author = State.users[post.author]
    if author and author.posts[voteData.postId] then
      author.posts[voteData.postId].upvotes = author.posts[voteData.postId].upvotes + 1
      author.score = author.score + 2
    end

    ao.send({
      Target = msg.From,
      Action = "Upvote-Success",
      Data = json.encode({
        upvotes = post.upvotes,
        authorScore = author and author.score or 0
      })
    })
  end
)

Handlers.add("downvote",
  Handlers.utils.hasMatchingTag("Action", "Downvote"),
  function(msg)
    local voteData = json.decode(msg.Data)
    local post = State.posts[voteData.postId]
    
    if not post then
      ao.send({
        Target = msg.From,
        Action = "Downvote-Error",
        Data = "Post not found"
      })
      return
    end

    -- Update post in posts table
    post.downvotes = post.downvotes + 1

    -- Update post in user's posts table
    local author = State.users[post.author]
    if author and author.posts[voteData.postId] then
      author.posts[voteData.postId].downvotes = author.posts[voteData.postId].downvotes + 1
      author.score = author.score - 1
    end

    ao.send({
      Target = msg.From,
      Action = "Downvote-Success",
      Data = json.encode({
        downvotes = post.downvotes,
        authorScore = author and author.score or 0
      })
    })
  end
)

-- Query Handlers
Handlers.add("check-user",
  Handlers.utils.hasMatchingTag("Action", "CheckUser"),
  function(msg)
    local username = msg.Tags.Username
    local user = State.users[username]
    
    ao.send({
      Target = msg.From,
      Action = "CheckUser-Success",
      Data = json.encode({
        exists = user ~= nil,
        user = user
      })
    })
  end
)

Handlers.add("get-profile",
  Handlers.utils.hasMatchingTag("Action", "GetProfile"),
  function(msg)
    local username = msg.Tags.Username
    local user = State.users[username]
    
    if not user then
      ao.send({
        Target = msg.From,
        Action = "GetProfile-Error",
        Data = "User not found"
      })
      return
    end

    -- Convert user's posts table to array and sort by timestamp
    local posts = {}
    for postId, postData in pairs(user.posts) do
      table.insert(posts, {
        id = postId,
        content = postData.content,
        upvotes = postData.upvotes,
        downvotes = postData.downvotes,
        timestamp = postData.timestamp
      })
    end

    -- Sort posts by timestamp
    table.sort(posts, function(a, b)
      return a.timestamp > b.timestamp
    end)

    ao.send({
      Target = msg.From,
      Action = "GetProfile-Success",
      Data = json.encode({
        user = user,
        posts = posts
      })
    })
  end
)

Handlers.add("get-feed",
  Handlers.utils.hasMatchingTag("Action", "GetFeed"),
  function(msg)
    local posts = {}
    for _, post in pairs(State.posts) do
      table.insert(posts, post)
    end

    -- Sort by timestamp
    table.sort(posts, function(a, b)
      return a.timestamp > b.timestamp
    end)

    ao.send({
      Target = msg.From,
      Action = "GetFeed-Success",
      Data = json.encode({ posts = posts })
    })
  end
)

Handlers.add("get-trending",
  Handlers.utils.hasMatchingTag("Action", "GetTrending"),
  function(msg)
    local posts = {}
    for _, post in pairs(State.posts) do
      table.insert(posts, post)
    end

    -- Sort by (upvotes - downvotes)
    table.sort(posts, function(a, b)
      local scoreA = a.upvotes - a.downvotes
      local scoreB = b.upvotes - b.downvotes
      return scoreA > scoreB
    end)

    ao.send({
      Target = msg.From,
      Action = "GetTrending-Success",
      Data = json.encode({ posts = posts })
    })
  end
)

Handlers.add("get-leaderboard",
  Handlers.utils.hasMatchingTag("Action", "GetLeaderboard"),
  function(msg)
    local users = {}
    for username, user in pairs(State.users) do
      table.insert(users, {
        username = username,
        displayName = user.displayName,
        score = user.score,
        posts = #user.posts
      })
    end

    -- Sort by score
    table.sort(users, function(a, b)
      return a.score > b.score
    end)

    ao.send({
      Target = msg.From,
      Action = "GetLeaderboard-Success",
      Data = json.encode({ users = users })
    })
  end
) 