import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Newspaper } from 'lucide-react';

// Define an interface for news article from newsdata.io
interface NewsArticle {
  title: string;
  description: string;
  link: string;
  image_url: string;
  pubDate: string;
  source_id: string;
  content?: string;
  creator?: string[];
  category?: string[];
}

// API response interface for newsdata.io
interface NewsDataResponse {
  status: string;
  totalResults?: number;
  results?: NewsArticle[];
  message?: string;
  code?: string;
  nextPage?: string;
}

const BusinessNewsComponent = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('business');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Using newsdata.io API
        const apiKey = 'pub_7787892fc6472cfb52f0734951e19e10972d3';
        
        // Map our UI categories to api parameters
        const categoryMap: Record<string, string> = {
          'business': 'business',
          'technology': 'technology',
          'finance': 'business',
          'economy': 'business'
        };
        
        // Build query params based on category
        let queryParams = new URLSearchParams({
          apikey: apiKey,
          language: 'en',
          country: 'in' // India as default, can be made configurable
        });
        
        // Add category parameter
        queryParams.append('category', categoryMap[category] || 'business');
        
        // Add additional keyword search for finance/economy
        if (category === 'finance') {
          queryParams.append('q', 'finance OR investment OR banking');
        } else if (category === 'economy') {
          queryParams.append('q', 'economy OR economic OR gdp OR inflation');
        } else if (category === 'business') {
          queryParams.append('q', 'business');
        }
        
        const url = `https://newsdata.io/api/1/news?${queryParams.toString()}`;
        
        // For demonstration, if API call fails we can detect it and use sample data
        let useLocalData = false;
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: controller.signal,
            cache: 'no-cache'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            useLocalData = true;
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data: NewsDataResponse = await response.json();
          
          if (data.status !== 'success') {
            useLocalData = true;
            throw new Error(data.message || 'API returned an error');
          }
          
          if (!data.results || data.results.length === 0) {
            useLocalData = true;
            throw new Error('No articles found');
          }
          
          setNews(data.results);
          setError(null);
        } catch (fetchErr) {
          console.warn('Fetch error - using local data instead:', fetchErr);
          if (useLocalData) {
            // Filter sample data based on category
            const filteredSampleNews = getSampleNewsForCategory(category);
            setNews(filteredSampleNews);
            setError("Using sample data - Could not connect to newsdata.io API");
          } else {
            throw fetchErr;
          }
        }
      } catch (err) {
        console.error('News API error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        setNews(getSampleNewsForCategory(category));
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [category, retryCount]);

  // Get sample news filtered by category
  const getSampleNewsForCategory = (cat: string): NewsArticle[] => {
    // Filter sample data based on category
    if (cat === 'business') {
      return sampleNews.filter((_, index) => index < 4);
    }
    if (cat === 'technology') {
      return sampleNews.filter((article) => article.category?.includes('technology') );
    }
    if (cat === 'finance') {
      return sampleNews.filter((article) => 
        article.title.toLowerCase().includes('financial') || 
        article.title.toLowerCase().includes('market') || 
        article.description.toLowerCase().includes('funding')
      );
    }
    if (cat === 'economy') {
      return sampleNews.filter((article) => 
        article.title.toLowerCase().includes('economic') || 
        article.description.toLowerCase().includes('growth') ||
        article.title.toLowerCase().includes('forecast')
      );
    }
    return sampleNews;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const categories = ['business', 'technology', 'finance', 'economy'];

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString || 'Unknown date';
    }
  };

  // Expanded sample news data using the newsdata.io format
  const sampleNews: NewsArticle[] = [
    {
      title: "Tech Giant Announces New Business Intelligence Platform",
      description: "The new platform aims to revolutionize how businesses analyze and visualize their data with AI-powered insights and real-time dashboards.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-04-03T09:30:00Z",
      source_id: "business_tech_today",
      category: ["business", "technology"]
    },
    {
      title: "Global Markets React to Federal Reserve Interest Rate Decision",
      description: "Stock markets worldwide showed mixed reactions to the latest Federal Reserve policy announcement as investors weigh inflation concerns against growth prospects.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-04-02T16:45:00Z",
      source_id: "financial_times",
      category: ["business", "finance"]
    },
    {
      title: "Major Merger Announced Between Two Leading Industry Players",
      description: "The $50 billion merger is expected to reshape the competitive landscape in the sector and create one of the largest companies in the industry.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-04-02T11:20:00Z",
      source_id: "business_insider",
      category: ["business"]
    },
    {
      title: "Startup Secures Record Funding for Sustainable Business Solution",
      description: "The innovative company raised $200 million in Series C funding to expand its eco-friendly business operations platform to new markets.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-04-01T14:15:00Z",
      source_id: "techcrunch",
      category: ["business", "startup"]
    },
    {
      title: "New AI Technology Transforms Supply Chain Management",
      description: "Companies implementing the new AI-driven logistics platform report 30% reduction in inventory costs and 25% faster delivery times.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-03-30T10:20:00Z",
      source_id: "tech_insights",
      category: ["technology", "business"]
    },
    {
      title: "Economic Outlook: Analysts Predict Steady Growth in Q2",
      description: "Leading economists forecast continued expansion with inflation rates stabilizing and consumer confidence reaching a three-year high.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-03-29T08:45:00Z",
      source_id: "financial_review",
      category: ["economy", "business"]
    },
    {
      title: "Renewable Energy Investments Hit Record High in Q1",
      description: "Global investments in clean energy projects exceeded $120 billion in the first quarter, marking a 15% increase year-over-year.",
      link: "#",
      image_url: "/api/placeholder/400/200",
      pubDate: "2025-03-28T14:30:00Z",
      source_id: "energy_journal",
      category: ["business", "energy"]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
        <div className="flex items-center mb-4">
          <Newspaper className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold">Business & Professional News</h1>
        </div>
        <p className="text-gray-600">Stay updated with the latest developments in the business world</p>
      </div>
      
      {/* Category filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-3 text-gray-700">News Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading latest news...</p>
          </div>
        </div>
      )}
      
      {/* Error state with retry button */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700">Error loading news</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <p className="mt-2 text-gray-600">Showing sample data instead</p>
              <button 
                onClick={handleRetry}
                className="mt-4 flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* News grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
              {article.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/api/placeholder/400/200";
                    }}
                  />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 m-2 rounded">
                    {article.source_id || "News"}
                  </div>
                </div>
              )}
              <div className="p-5 flex-grow flex flex-col">
                <div className="text-xs text-gray-500 mb-2">
                  {formatDate(article.pubDate)}
                </div>
                <h2 className="text-lg font-semibold mb-3 line-clamp-2 flex-grow-0">{article.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{article.description}</p>
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group"
                >
                  Read full article
                  <svg className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && news.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center">
            <Newspaper className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No news articles found</h3>
            <p className="text-gray-500 mt-2">Try changing the category or check back later</p>
            <button 
              onClick={handleRetry}
              className="mt-6 flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      )}
      
      {/* Footer with API attribution */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Showing {news.length} articles in the {category.charAt(0).toUpperCase() + category.slice(1)} category
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Powered by newsdata.io
        </p>
      </div>
    </div>
  );
};

export default BusinessNewsComponent;