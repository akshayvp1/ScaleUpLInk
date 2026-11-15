import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Newspaper } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
        const queryParams = new URLSearchParams({
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
    } catch {
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
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-start gap-4 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Newspaper className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl [font-family:var(--font-display)]">
                Business &amp; Professional News
              </h1>
              <p className="mt-1 text-muted-foreground">
                Stay updated with the latest developments in the business world.
              </p>
            </div>
          </div>
        </header>

        {/* Category filter */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            News categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading latest news...</p>
          </div>
        )}

        {/* Error state with retry button */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="min-w-0">
                <h3 className="font-semibold text-destructive">Error loading news</h3>
                <p className="mt-1 text-sm text-destructive/90">{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">Showing sample data instead</p>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* News grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article, index) => (
              <article
                key={index}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-float"
              >
                {article.image_url && (
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/400/200";
                      }}
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                      {article.source_id || "News"}
                    </span>
                  </div>
                )}
                <div className="flex flex-grow flex-col p-5">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    {formatDate(article.pubDate)}
                  </div>
                  <h2 className="mb-3 line-clamp-2 text-lg font-semibold text-foreground">
                    {article.title}
                  </h2>
                  <p className="mb-4 line-clamp-3 flex-grow text-sm text-muted-foreground">
                    {article.description}
                  </p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Read full article
                    <svg
                      className="ml-1 size-3 transition-transform group-hover:translate-x-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && news.length === 0 && !error && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft">
            <Newspaper className="mb-4 size-14 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground">No news articles found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing the category or check back later.
            </p>
            <Button onClick={handleRetry} variant="outline" className="mt-6">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        )}

        {/* Footer with API attribution */}
        <footer className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {news.length} articles in the{" "}
            {category.charAt(0).toUpperCase() + category.slice(1)} category
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">Powered by newsdata.io</p>
        </footer>
      </div>
    </div>
  );
};

export default BusinessNewsComponent;