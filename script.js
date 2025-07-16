class NewsFeeder {
    constructor() {
        this.feeds = [
            { url: 'https://pitchfork.com/rss/news/', name: 'Pitchfork' },
            { url: 'https://edm.com/.rss/full/', name: 'EDM.com' }
        ];
        this.articles = [];
        this.filteredArticles = [];
        this.maxArticles = 10;
        this.currentFilters = {
            provider: 'all',
            sort: 'newest',
            topic: 'all'
        };
        this.topics = new Set();
        this.init();
    }

    async init() {
        this.hideLoading();
        this.initializeDropdowns();
        await this.fetchAllFeeds();
    }

    initializeDropdowns() {
        // Provider dropdown
        const providerToggle = document.getElementById('providerFilter');
        const providerDropdown = document.getElementById('providerDropdown');
        
        // Sort dropdown
        const sortToggle = document.getElementById('sortFilter');
        const sortDropdown = document.getElementById('sortDropdown');
        
        // Topic dropdown
        const topicToggle = document.getElementById('topicFilter');
        const topicDropdown = document.getElementById('topicDropdown');

        // Toggle dropdowns
        providerToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(providerToggle, providerDropdown);
        });

        sortToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(sortToggle, sortDropdown);
        });

        topicToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(topicToggle, topicDropdown);
        });

        // Handle dropdown selections
        providerDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                this.handleProviderFilter(e.target);
            }
        });

        sortDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                this.handleSortFilter(e.target);
            }
        });

        topicDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                this.handleTopicFilter(e.target);
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }

    toggleDropdown(toggle, dropdown) {
        const isOpen = dropdown.classList.contains('show');
        this.closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('show');
            toggle.classList.add('active');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }

    handleProviderFilter(item) {
        const provider = item.dataset.provider;
        this.currentFilters.provider = provider;
        
        // Update active state
        item.parentElement.querySelectorAll('.dropdown-item').forEach(el => {
            el.classList.remove('active');
        });
        item.classList.add('active');
        
        // Update button text
        document.getElementById('providerFilter').querySelector('span').textContent = item.textContent;
        
        this.applyFilters();
        this.closeAllDropdowns();
    }

    handleSortFilter(item) {
        const sort = item.dataset.sort;
        this.currentFilters.sort = sort;
        
        // Update active state
        item.parentElement.querySelectorAll('.dropdown-item').forEach(el => {
            el.classList.remove('active');
        });
        item.classList.add('active');
        
        // Update button text
        document.getElementById('sortFilter').querySelector('span').textContent = item.textContent;
        
        this.applyFilters();
        this.closeAllDropdowns();
    }

    handleTopicFilter(item) {
        const topic = item.dataset.topic;
        this.currentFilters.topic = topic;
        
        // Update active state
        item.parentElement.querySelectorAll('.dropdown-item').forEach(el => {
            el.classList.remove('active');
        });
        item.classList.add('active');
        
        // Update button text
        document.getElementById('topicFilter').querySelector('span').textContent = item.textContent;
        
        this.applyFilters();
        this.closeAllDropdowns();
    }

    detectTopics(article) {
        const topics = [];
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        // Define topic keywords
        const topicKeywords = {
            'Electronic': ['electronic', 'edm', 'techno', 'house', 'dubstep', 'trance', 'drum', 'bass'],
            'Hip-Hop': ['hip-hop', 'rap', 'rapper', 'hip hop', 'beats', 'mixtape'],
            'Pop': ['pop', 'mainstream', 'chart', 'billboard', 'single'],
            'Rock': ['rock', 'metal', 'punk', 'guitar', 'band'],
            'Indie': ['indie', 'independent', 'alternative', 'underground'],
            'Jazz': ['jazz', 'blues', 'swing', 'improvisation'],
            'Classical': ['classical', 'orchestra', 'symphony', 'piano', 'violin'],
            'Festival': ['festival', 'concert', 'live', 'tour', 'performance'],
            'Album': ['album', 'record', 'release', 'new music', 'debut'],
            'Interview': ['interview', 'talks', 'discusses', 'speaks', 'conversation']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                topics.push(topic);
            }
        }

        return topics.length > 0 ? topics : ['General'];
    }

    updateTopicDropdown() {
        const topicDropdown = document.getElementById('topicDropdown');
        const allTopicsItem = topicDropdown.querySelector('[data-topic="all"]');
        
        // Clear existing topics except "All Topics"
        topicDropdown.querySelectorAll('.dropdown-item:not([data-topic="all"])').forEach(item => {
            item.remove();
        });

        // Add detected topics
        Array.from(this.topics).sort().forEach(topic => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'dropdown-item';
            item.dataset.topic = topic;
            item.textContent = topic;
            topicDropdown.appendChild(item);
        });
    }

    applyFilters() {
        let filtered = [...this.articles];

        // Apply provider filter
        if (this.currentFilters.provider !== 'all') {
            filtered = filtered.filter(article => article.source === this.currentFilters.provider);
        }

        // Apply topic filter
        if (this.currentFilters.topic !== 'all') {
            filtered = filtered.filter(article => 
                article.topics && article.topics.includes(this.currentFilters.topic)
            );
        }

        // Apply sort filter
        if (this.currentFilters.sort === 'newest') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (this.currentFilters.sort === 'oldest') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        this.filteredArticles = filtered;
        this.renderArticles();
    }

    async fetchAllFeeds() {
        // Fetch feeds in parallel and render immediately as each completes
        const promises = this.feeds.map(feed => this.fetchFeed(feed));
        
        promises.forEach(async (promise, index) => {
            try {
                const articles = await promise;
                
                // Add topics to each article
                articles.forEach(article => {
                    article.topics = this.detectTopics(article);
                    article.topics.forEach(topic => this.topics.add(topic));
                });
                
                this.articles.push(...articles);
                
                // Sort and limit articles each time we get new ones
                this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.articles = this.articles.slice(0, this.maxArticles);
                
                // Update topic dropdown and apply filters
                this.updateTopicDropdown();
                this.applyFilters();
            } catch (error) {
                console.error(`Failed to fetch ${this.feeds[index].name}:`, error);
            }
        });
    }

    async fetchFeed(feed) {
        try {
            // Try allorigins first as it's often faster
            const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
            
            const response = await fetch(fallbackUrl);
            const data = await response.json();
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            
            return this.parseRSSXML(xmlDoc, feed.name);
        } catch (error) {
            // Fallback to rss2json
            try {
                const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=10`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                
                if (data.status === 'ok' && data.items) {
                    return data.items.map(item => ({
                        title: item.title,
                        description: this.stripHtml(item.description || item.content || ''),
                        link: item.link,
                        date: new Date(item.pubDate),
                        source: feed.name,
                        thumbnail: item.thumbnail || this.extractThumbnailFromContent(item.content || item.description || '')
                    }));
                }
            } catch (fallbackError) {
                console.error(`Error fetching ${feed.name}:`, fallbackError);
            }
            return [];
        }
    }

    parseRSSXML(xmlDoc, sourceName) {
        const items = xmlDoc.querySelectorAll('item');
        const articles = [];

        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || 'No title';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            
            // Extract thumbnail from media:thumbnail or media:content
            let thumbnail = '';
            const mediaThumbnail = item.querySelector('thumbnail') || item.querySelector('media\\:thumbnail, media\\:content');
            if (mediaThumbnail) {
                thumbnail = mediaThumbnail.getAttribute('url');
            } else {
                // Try to extract from description/content
                thumbnail = this.extractThumbnailFromContent(description);
            }

            articles.push({
                title: title,
                description: this.stripHtml(description),
                link: link,
                date: new Date(pubDate),
                source: sourceName,
                thumbnail: thumbnail
            });
        });

        return articles;
    }

    extractThumbnailFromContent(content) {
        // Try to extract image URLs from content
        const imgRegex = /<img[^>]+src="([^">]+)"/i;
        const match = content.match(imgRegex);
        return match ? match[1] : '';
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const articleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = today - articleDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    }

    truncateText(text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    renderArticles() {
        const grid = document.getElementById('newsGrid');
        
        const articlesToRender = this.filteredArticles.length > 0 ? this.filteredArticles : this.articles;
        
        if (articlesToRender.length === 0) {
            return; // wait until we have at least one article
        }

        grid.innerHTML = articlesToRender.map(article => `
            <div class="news-item">
                <article class="news-article">
                    <div class="article-image" ${article.thumbnail ? `style="background-image: url('${article.thumbnail}')"` : ''} onclick="return openPopup('${article.link}', '${article.title.replace(/'/g, "\\'")}')"></div>
                </article>
                <div class="article-details">
                    <a href="${article.link}" target="_blank" class="article-title" onclick="return openPopup('${article.link}', '${article.title.replace(/'/g, "\\'")}')">
                        ${article.title}
                    </a>
                    <div class="article-meta">
                        <span class="article-date">${this.formatDate(article.date)}</span>
                        <a href="${article.link}" target="_blank" class="read-more" onclick="return openPopup('${article.link}', '${article.title.replace(/'/g, "\\'")}')">Read More</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }

    showError() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'block';
    }
}

// Initialize the news feeder when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsFeeder();
});

// Function to open article in popup window
function openPopup(url, title) {
    const width = 800;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
        url,
        title,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no`
    );
    
    return false; // Prevent default link behavior
}