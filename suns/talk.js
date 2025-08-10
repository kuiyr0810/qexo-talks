
const myQexoShouts = {
  // --- Internal State ---
  talks: [],
  currentPage: 1,
  isLoading: false,
  config: {},

  _formatTime: function(timestamp) {
    // 检查时间戳是否是10位数（秒），如果是，则乘以1000转为毫秒
    const ts = timestamp.toString().length === 10 ? Number(timestamp) * 1000 : Number(timestamp);
    // ----------------------

    const now = new Date();
    const past = new Date(ts); // 使用修正后的时间戳
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    if (diffInSeconds < minute) {
      return '刚刚';
    } else if (diffInSeconds < hour) {
      return `${Math.floor(diffInSeconds / minute)}分钟前`;
    } else if (diffInSeconds < day) {
      return `${Math.floor(diffInSeconds / hour)}小时前`;
    } else if (diffInSeconds < week) {
      return `${Math.floor(diffInSeconds / day)}天前`;
    } else {
      const year = past.getFullYear();
      const month = (past.getMonth() + 1).toString().padStart(2, '0');
      const date = past.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${date}`;
    }
  },


  _createTalkItemHTML: function(talk) {
    const formattedTime = this._formatTime(talk.time);
    const isoTime = new Date(Number(talk.time)).toISOString();
    
    // 使用 map 循环遍历标签数组，为每个标签生成一个独立的<a>标签
    const tagsHTML = talk.tags.map(tag => 
      `<a class="qexot-tag-item">#${tag}</a>`
    ).join(''); 
    // ----------------------

    const likedIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="red"><path transform="scale(0.03,0.03)" d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9L0 190.9z"/></svg>`;
    const unlikeIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16"><path transform="scale(0.03,0.03)" d="M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"/></svg>`;

    return `
      <div class="qexot-item" id="qexot-item-${talk.id}">
        <div class="qexot-header">
          <img class="qexot-avatar" src="${this.config.avatar}" alt="${this.config.name}" onerror="this.style.display='none'">
          <div class="qexot-user-info">
            <span class="qexot-name">${this.config.name}</span>
            <time class="qexot-datatime" datetime="${isoTime}">${formattedTime}</time>
          </div>
          <div class="qexot-tags-container">${tagsHTML}</div>
        </div>
        <div class="qexot-content">
          <div class="datacont">${talk.content}</div>
        </div>
        <div class="qexot-bottom">
          <a class="qexot-like" onclick="myQexoShouts.likeTalk('${talk.id}')">
            ${talk.liked ? likedIcon : unlikeIcon}
            <span class="qexot-like-count">${talk.like}</span>
          </a>
        </div>
      </div>
    `;
  },
  
  // (The rest of the script: _render, _updateLoadMoreButton, loadMoreTalks, likeTalk remains the same as v3.0)
  _render: function(items, append = false) { /* ... */ },
  _updateLoadMoreButton: function(totalCount) { /* ... */ },
  loadMoreTalks: async function() { /* ... */ },
  likeTalk: async function(id) { /* ... */ },

  init: function(userConfig) {
    this.config = {
      el: null,
      baseURL: null,
      limit: 5,
      name: 'Qexo User', // Default name
      avatar: '',      // Default avatar
      timeFormat: 'YYYY-mm-dd HH:MM:SS', // Default time format
      ...userConfig
    };
    
    if (!this.config.el || !this.config.baseURL) {
      console.error("Qexo Talks Error: 'el' and 'baseURL' are required.");
      return;
    }
    this.loadMoreTalks();
  }
};

myQexoShouts._render = function(items, append = false) {const container = document.querySelector(this.config.el);if (!container) return;const listContainer = container.querySelector('.qexot-list');if (!append && !listContainer) {container.innerHTML = `<section class="qexot"><div class="qexot-list"></div></section>`;}const targetList = container.querySelector('.qexot-list');const itemsHTML = items.map(talk => this._createTalkItemHTML(talk)).join('');targetList.insertAdjacentHTML('beforeend', itemsHTML);};
myQexoShouts._updateLoadMoreButton = function(totalCount) {const container = document.querySelector(this.config.el);let moreButton = document.getElementById("qexot-more");if (moreButton) moreButton.remove();if (this.talks.length < totalCount) {const buttonHTML = `<center id="qexot-more"><div class="qexot-more" onclick="myQexoShouts.loadMoreTalks()">加载更多</div></center>`;container.insertAdjacentHTML('beforeend', buttonHTML);}};
myQexoShouts.loadMoreTalks = async function() {if (this.isLoading) return;this.isLoading = true;const container = document.querySelector(this.config.el);const moreButton = document.getElementById("qexot-more");if (moreButton) moreButton.innerHTML = '加载中...';if (this.currentPage === 1) {container.innerHTML = '<div class="qexo_loading"><p style="text-align: center; display: block">说说加载中...</p></div>';}try {const url = new URL('/pub/talks/', this.config.baseURL);url.searchParams.append('page', this.currentPage);url.searchParams.append('limit', this.config.limit);const response = await fetch(url.href);if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);const res = await response.json();if (res.status) {this._render(res.data, this.currentPage > 1);this.talks = this.talks.concat(res.data);this._updateLoadMoreButton(res.count);this.currentPage++;} else {throw new Error(res.data.msg || "API returned an error.");}} catch (error) {console.error("Failed to fetch talks:", error);if (this.currentPage === 1) {container.innerHTML = '<blockquote>说说加载失败，请检查 API 地址或网络连接。<br>错误详情请查看 F12 控制台。</blockquote>';}} finally {this.isLoading = false;}};
myQexoShouts.likeTalk = async function(id) {const url = new URL('/pub/like_talk/', this.config.baseURL);const talk = this.talks.find(t => t.id === id);if (!talk) return;try {const response = await fetch(url.href, {method: 'POST',headers: { 'Content-Type': 'application/x-www-form-urlencoded' },body: `id=${id}`});if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);const res = await response.json();if (res.status) {talk.liked = res.action;talk.like += res.action ? 1 : -1;const talkElement = document.getElementById(`qexot-item-${id}`);if (talkElement) {const likeElement = talkElement.querySelector('.qexot-like');const likeCountElement = likeElement.querySelector('.qexot-like-count');const svgElement = likeElement.querySelector('svg');const newIcon = this._createTalkItemHTML(talk).match(/<a class="qexot-like".*?>([\s\S]*?)<\/a>/s)[1].trim().split(/<span/)[0];svgElement.outerHTML = newIcon;likeCountElement.textContent = talk.like;}} else {throw new Error(res.data.msg || "Like action failed.");}} catch (error) {console.error("Failed to like talk:", error);}};
