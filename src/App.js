import "./styles.css";
import React, { useEffect, useState } from "react";

async function fetchNewsArticles(include=[], exclude=[]) {

  const NEWS_API_URL = 'https://newsdata.io/api/1/news';

  // build search string
  let q = '';
  include = include.join(' OR ') 
  exclude = exclude.join(' AND ')

  if (!include && !exclude) {
    // do nothing
  } else if (!include) {
    q = `NOT (${exclude})`;
  } else if (!exclude) {
    q = include;
  } else {  // both parts present
    q = `(${include}) NOT (${exclude})`;
  }

  let apiUrl = `${NEWS_API_URL}?language=en`;

  if (q) {
    apiUrl += `&q=${q}`;
  }

  console.log(apiUrl);

  const url = '/retrieve-summarized-news';
  const data = {
    url_without_key: apiUrl,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data) // Convert your data to a JSON string
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('summarized news: ' + toString(data));
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [news, setNews] = useState([]); // Initialize the state for news

  // Track the clicked state for each list item
  const [clickedItems, setClickedItems] = useState({});

  const handleSearch = async () => {
    try {
      // Pass the searchQuery as a parameter to fetchNewsArticles
      const newsData = await fetchNewsArticles([searchQuery]);
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    // Call handleSearch when the component mounts
    handleSearch();
  }, []);

  // Function to toggle the clicked state for an item
  const toggleClicked = (index) => {
    setClickedItems((prevClicked) => ({
      ...prevClicked,
      [index]: !prevClicked[index],
    }));
  };

  return (
    <div className="App">
      <h1>NewsSwipe</h1>
      <div>
        <input
          type="text"
          placeholder="Enter country name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <ul>
        {news.map((item, index) => (
          <li
            key={index}
            onClick={() => toggleClicked(index)}
            className="list-item"
            style={{
              cursor: "pointer",
              fontWeight: clickedItems[index] ? "normal" : "bold",
            }}
          >
            {clickedItems[index] ? item[2] : item[0]}
          </li>
        ))}
      </ul>
    </div>
  );
}