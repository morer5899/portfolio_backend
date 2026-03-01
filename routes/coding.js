const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();


// =============================
// 🟡 LEETCODE CONTROLLER
// =============================
router.get("/leetcode/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username }
    };

    const response = await axios.post(
      "https://leetcode.com/graphql",
      query,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const stats =
      response.data.data.matchedUser.submitStats.acSubmissionNum;

    const formatted = {
      easy: stats.find(s => s.difficulty === "Easy")?.count || 0,
      medium: stats.find(s => s.difficulty === "Medium")?.count || 0,
      hard: stats.find(s => s.difficulty === "Hard")?.count || 0,
      total: stats.find(s => s.difficulty === "All")?.count || 0
    };

    res.json({
      platform: "LeetCode",
      username,
      stats: formatted
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch LeetCode data",
      details: error.message
    });
  }
});


/// =============================
// 🟢 GFG CONTROLLER - FIXED VERSION
// =============================

router.get("/gfg/:username", async (req, res) => {
  const { username } = req.params;

  try {
    console.log(`🔍 Fetching GFG data for username: ${username}`);
    
    // Use the new profile URL structure
    const { data } = await axios.get(
      `https://www.geeksforgeeks.org/profile/${username}/?tab=activity`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );

    const $ = cheerio.load(data);
    
    // Initialize variables
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let rank = 'N/A';
    let streak = 0;
    let score = 0;
    
    // Look for data in script tags
    const scripts = $('script').toString();
    
    // Method 1: Look for user data in the page's Next.js props
    const nextDataMatch = scripts.match(/__NEXT_DATA__\s*=\s*({.+?});/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        // Navigate through the Next.js props structure
        const pageProps = nextData?.props?.pageProps;
        
        // From your actual profile data
        if (pageProps?.userData?.data) {
          const userData = pageProps.userData.data;
          totalSolved = userData.total_problems_solved || 0;
          score = userData.score || 0;
          // Note: The new profile might not show difficulty-wise counts
          // You may need to calculate these from other data
        }
      } catch (e) {
        console.log('Error parsing Next.js data:', e.message);
      }
    }
    
    // Method 2: Look for specific data patterns in scripts
    if (totalSolved === 0) {
      // Look for total_problems_solved
      const problemsMatch = scripts.match(/"total_problems_solved":(\d+)/);
      if (problemsMatch) {
        totalSolved = parseInt(problemsMatch[1]);
      }
      
      // Look for score
      const scoreMatch = scripts.match(/"score":(\d+)/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
      }
    }
    
    // Method 3: Look for visible elements on the page
    if (totalSolved === 0) {
      // Look for problem count in the profile stats
      $('.profile-stats, .user-stats, .stats').each((i, el) => {
        const text = $(el).text();
        const match = text.match(/(\d+)\s*problems?\s*solved/i);
        if (match) {
          totalSolved = parseInt(match[1]);
        }
      });
    }
    
    console.log(`✅ GFG Data for ${username}:`, {
      totalSolved,
      score,
      rank,
      streak
    });

    res.json({
      platform: "GeeksForGeeks",
      username,
      totalSolved: totalSolved || 0,
      easySolved: 0, // Difficulty breakdown not available in new profile
      mediumSolved: 0,
      hardSolved: 0,
      score: score || 0,
      rank: rank || 'N/A',
      streak: streak || 0,
      profile: `https://www.geeksforgeeks.org/profile/${username}/`
    });

  } catch (error) {
    console.error('❌ GFG Scraper Error:', error.message);
    
    // Return default values
    res.json({
      platform: "GeeksForGeeks",
      username,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      score: 0,
      rank: 'N/A',
      streak: 0,
      profile: `https://www.geeksforgeeks.org/profile/${username}/`,
      error: error.message
    });
  }
});


// =============================
// 🔵 HACKERRANK CONTROLLER
// =============================
router.get("/hackerrank/:username", async (req, res) => {
  const { username } = req.params;
  console.log(username)
  try {
    const { data } = await axios.get(
      `https://www.hackerrank.com/profile/@${username}`
    );

    console.log(data)

    res.json({
      platform: "HackerRank",
      username,
      message:
        "HackerRank blocks simple scraping. Use Puppeteer for full stats extraction."
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: "Failed to fetch HackerRank data",
      details: error.message
    });
  }
});


module.exports = router;