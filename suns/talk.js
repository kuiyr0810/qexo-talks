/*
 * talk.js
 *
 * 直接可用的 Qexo 叨叨前端渲染脚本。
 * 根据 qexo-dao.decoded.js 还原并优化：不依赖 Vue / axios，直接用原生 JS + fetch。
 *
 * 基本用法：
 *   <div id="ispeak"></div>
 *   <script src="/path/to/talk.js"></script>
 *   <script>
 *     myQexoShouts.init({
 *       el: '#ispeak',
 *       baseURL: 'https://your-qexo.example.com/',
 *       title: '叨叨',
 *       name: '你的名字',
 *       avatar: 'https://example.com/avatar.png',
 *       limit: 5
 *     });
 *   </script>
 */

(function (window, document) {
  'use strict';

  const PACKAGE = {
    name: 'qexo-daodao',
    version: '1.0.2',
    warehouse: 'https://github.com/Uyoahz26/daodao',
  };

  const DEFAULT_LOADING_IMG = 'https://img.5200810.xyz/file/vip/1780824012256_Loading.gif';
  const ONE_MONTH = 2678400000;

  const LIKED_HEART_PATH = 'M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z';
  const UNLIKED_HEART_PATH = 'M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z';

  const LEFT_ARROW_SVG = '<svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M31 36L19 24L31 12" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const RIGHT_ARROW_SVG = '<svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M19 12L31 24L19 36" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CLOSE_SVG = '<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M8 8L40 40" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 40L40 8" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const myQexoShouts = {
    talks: [],
    currentPage: 1,
    total: 0,
    isLoading: false,
    execIng: false,
    config: {},

    init(userConfig) {
      this.config = {
        el: '#ispeak',
        baseURL: '',
        title: 'Sunshine',
        name: 'Qexo User',
        avatar: '',
        limit: 5,
        fromColor: 'black',
        labelColor: '#000a85',
        useLoadingImg: true,
        loadingImg: DEFAULT_LOADING_IMG,
        format: '',
        injectStyle: true,
        enableImagePreview: true,
        showFooter: true,
        showAllTags: false,
        ...userConfig,
      };

      if (!this.config.el || !this.config.baseURL) {
        console.error("Qexo Talks Error: 'el' and 'baseURL' are required.");
        return;
      }

      this.config.baseURL = this._normalizeBaseURL(this.config.baseURL);
      this.talks = [];
      this.currentPage = 1;
      this.total = 0;
      this.isLoading = false;
      this.execIng = false;

      if (this.config.injectStyle) this._injectStyle();
      if (this.config.enableImagePreview) this._initViewImage();

      const container = this._container();
      if (!container) {
        console.error(`Qexo Talks Error: container '${this.config.el}' not found.`);
        return;
      }

      container.classList.add('ispeak');
      this._renderShell();
      this.loadMoreTalks();
    },

    async loadMoreTalks() {
      if (this.isLoading) return;
      this.isLoading = true;
      this._removeLoadMoreButton();
      this._setLoading(true);
      this._hideMessage();

      try {
        const url = new URL('pub/talks/', this.config.baseURL);
        url.searchParams.set('page', this.currentPage);
        url.searchParams.set('limit', this.config.limit);

        const response = await fetch(url.href, { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const result = await response.json();
        if (!result.status) throw new Error(this._apiErrorMessage(result) || 'API returned an error.');

        const data = Array.isArray(result.data) ? result.data : [];
        this.total = Number(result.count || 0);
        this.talks = this.talks.concat(data);
        this.currentPage += 1;

        this._appendTalks(data);
        this._updateTotal();
        this._updateLoadMoreButton();

        if (this.talks.length >= this.total) {
          this._showMessage('当你看到这段话的时候，就说明已经全部加载完了...');
        }
      } catch (error) {
        console.error('Failed to fetch talks:', error);
        this._showMessage(this.currentPage === 1 ? '哦吼，加载失败了，刷新看看~' : '加载失败，请稍后再试~');
      } finally {
        this.isLoading = false;
        this._setLoading(false);
      }
    },

    async likeTalk(id) {
      if (!id || this.execIng) return;

      const talk = this.talks.find((item) => String(item.id) === String(id));
      if (!talk) return;

      // 原 qexo-dao 逻辑：点赞后不允许取消。
      if (talk.liked) {
        this._toast('哈哈哈，点赞了就休想取消啦~', 'error');
        return;
      }

      this._toast('点赞成功，只不过有点慢，让点赞飞一会~', 'success');
      this.execIng = true;

      try {
        const url = new URL('pub/like_talk/', this.config.baseURL);
        const response = await fetch(url.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: `id=${encodeURIComponent(id)}`,
        });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const result = await response.json();
        if (!result.status) throw new Error(this._apiErrorMessage(result) || 'Like action failed.');

        talk.like = Number(talk.like || 0) + 1;
        talk.liked = true;
        this._updateLikeDOM(talk);
      } catch (error) {
        console.error('Failed to like talk:', error);
      } finally {
        this.execIng = false;
      }
    },

    _renderShell() {
      const container = this._container();
      if (!container) return;

      container.innerHTML = `
        <section class="qexot" style="--qexot-label-color:${this._escapeAttr(this.config.labelColor)};--qexot-label-bg:${this._escapeAttr(this.config.labelColor)}1a;">
          <div class="xk-info qexot-info">
            <div class="count">
              <i class="iconfont icon-pinlun"></i>
              ${this._escapeHTML(this.config.title)} 「<span class="qexot-total" style="font-size:26px">0</span>」
            </div>
          </div>
          <div class="qexot-list" view-image></div>
          <div class="loading qexot-loading" hidden></div>
          <div class="btn-area qexot-btn-area"></div>
          <div class="qexot-message" hidden></div>
          ${this.config.showFooter ? `<div class="xk-footer qexot-footer">Powered by <a href="${PACKAGE.warehouse}" target="_blank" rel="noopener">${PACKAGE.name}</a> v${PACKAGE.version}</div>` : ''}
        </section>
      `;
    },

    _appendTalks(items) {
      const list = this._container()?.querySelector('.qexot-list');
      if (!list || !items.length) return;

      list.insertAdjacentHTML('beforeend', items.map((talk) => this._createTalkItemHTML(talk)).join(''));

      if (window.ViewImage && this.config.enableImagePreview) {
        window.ViewImage.init('.xk-card-content img, .qexot-content img');
      }
    },

    _createTalkItemHTML(talk) {
      const id = this._escapeAttr(talk.id);
      const tagInfo = this._normalizeTalkTags(talk.tags);
      const label = tagInfo.labels[0] || '';
      const extraTags = this.config.showAllTags ? tagInfo.labels.slice(1) : [];
      const timeMs = this._toMilliseconds(talk.time);
      const date = new Date(timeMs);
      const title = Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
      const isoTime = Number.isNaN(date.getTime()) ? '' : date.toISOString();
      const content = String(talk.content || '').replace(/^<p><br><\/p>*|<p><br><\/p>*$/g, '');

      return `
        <article class="xk-card qexot-item wow animate__zoomIn" id="qexot-item-${id}" data-id="${id}">
          <header class="xk-card-header qexot-header">
            <div class="xk-card-name qexot-card-name">
              <div class="avatar qexot-avatar-wrap" style="width:40px;height:40px;min-width:40px;min-height:40px;max-width:40px;max-height:40px;overflow:hidden;border-radius:50%;display:block;line-height:0;">
                <img class="avatar-img qexot-avatar" src="${this._escapeAttr(this.config.avatar)}" alt="${this._escapeAttr(this.config.name)}" style="display:block;width:40px;height:40px;min-width:40px;min-height:40px;max-width:40px;max-height:40px;object-fit:cover;border-radius:50%;aspect-ratio:1/1;" onerror="this.style.display='none'">
              </div>
              <div class="name-info qexot-user-info">
                <div class="name qexot-name">${this._escapeHTML(this.config.name)}</div>
                <time class="xk-card-time qexot-datatime" title="${this._escapeAttr(title)}" datetime="${this._escapeAttr(isoTime)}">${this._escapeHTML(this._formatTime(talk.time, this.config.format))}</time>
              </div>
            </div>
            <div class="qexot-tags">
              ${label ? `<span class="dao-label qexot-tag-item">#${this._escapeHTML(label)}</span>` : ''}
              ${extraTags.map((tag) => `<span class="dao-label qexot-tag-item">#${this._escapeHTML(tag)}</span>`).join('')}
            </div>
          </header>

          <div class="xk-card-content qexot-content">
            <div class="datacont">${content}</div>
          </div>

          <footer class="xk-card-footer qexot-bottom">
            <button class="dao-like qexot-like" type="button" onclick="myQexoShouts.likeTalk('${id}')" aria-label="点赞">
              ${this._heartIcon(Boolean(talk.liked))}
              <span class="qexot-like-count">${this._escapeHTML(Number(talk.like || 0))}</span>
            </button>
          </footer>
        </article>
      `;
    },

    _updateLikeDOM(talk) {
      const item = document.getElementById(`qexot-item-${talk.id}`);
      if (!item) return;

      const like = item.querySelector('.qexot-like');
      const count = item.querySelector('.qexot-like-count');
      const icon = item.querySelector('.like-svg');
      if (icon) icon.outerHTML = this._heartIcon(Boolean(talk.liked));
      if (count) count.textContent = Number(talk.like || 0);
      if (like) like.classList.toggle('is-liked', Boolean(talk.liked));
    },

    _updateTotal() {
      const total = this._container()?.querySelector('.qexot-total');
      if (total) total.textContent = this.total;
    },

    _updateLoadMoreButton() {
      this._removeLoadMoreButton();
      if (this.talks.length >= this.total) return;

      const area = this._container()?.querySelector('.qexot-btn-area');
      if (!area) return;
      area.innerHTML = '<button id="qexot-more" class="push-btn color-1 qexot-more" type="button" onclick="myQexoShouts.loadMoreTalks()">更早之前的</button>';
    },

    _removeLoadMoreButton() {
      const area = this._container()?.querySelector('.qexot-btn-area');
      if (area) area.innerHTML = '';
    },

    _setLoading(loading) {
      const loadingEl = this._container()?.querySelector('.qexot-loading');
      if (!loadingEl) return;

      loadingEl.hidden = !loading;
      if (!loading) {
        loadingEl.innerHTML = '';
        return;
      }

      if (this.config.useLoadingImg) {
        loadingEl.innerHTML = `<img src="${this._escapeAttr(this.config.loadingImg)}" alt="loading">`;
      } else {
        loadingEl.innerHTML = `
          <div class="bbddloading-inner">
            <div class="bbddloading-line-wrap"><div class="bbddloading-line"></div></div>
            <div class="bbddloading-line-wrap"><div class="bbddloading-line"></div></div>
            <div class="bbddloading-line-wrap"><div class="bbddloading-line"></div></div>
            <div class="bbddloading-line-wrap"><div class="bbddloading-line"></div></div>
            <div class="bbddloading-line-wrap"><div class="bbddloading-line"></div></div>
          </div>
        `;
      }
    },

    _showMessage(message) {
      const messageEl = this._container()?.querySelector('.qexot-message');
      if (!messageEl) return;
      messageEl.hidden = false;
      messageEl.textContent = message;
    },

    _hideMessage() {
      const messageEl = this._container()?.querySelector('.qexot-message');
      if (!messageEl) return;
      messageEl.hidden = true;
      messageEl.textContent = '';
    },

    _formatTime(timestamp, format) {
      const timeMs = this._toMilliseconds(timestamp);
      const date = new Date(timeMs);
      if (Number.isNaN(date.getTime())) return '';

      if (format && String(format).trim()) {
        return this._formatByPattern(date, format);
      }

      const diff = Date.now() - date.getTime();
      if (diff < 0) return this._formatByPattern(date, 'yyyy-MM-dd');
      if (diff < 60 * 1000) return '刚刚';
      if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
      if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      if (diff <= ONE_MONTH) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      return this._formatByPattern(date, 'yyyy-MM-dd');
    },

    _formatByPattern(date, pattern) {
      const pad = (value, length = 2) => String(value).padStart(length, '0');
      const replacements = {
        yyyy: date.getFullYear(),
        YYYY: date.getFullYear(),
        yy: String(date.getFullYear()).slice(-2),
        MM: pad(date.getMonth() + 1),
        M: date.getMonth() + 1,
        dd: pad(date.getDate()),
        DD: pad(date.getDate()),
        d: date.getDate(),
        HH: pad(date.getHours()),
        H: date.getHours(),
        hh: pad(date.getHours()),
        h: date.getHours(),
        mm: pad(date.getMinutes()),
        m: date.getMinutes(),
        ss: pad(date.getSeconds()),
        s: date.getSeconds(),
      };
      return String(pattern).replace(/yyyy|YYYY|yy|MM|M|dd|DD|d|HH|H|hh|h|mm|m|ss|s/g, (token) => replacements[token]);
    },

    _toMilliseconds(timestamp) {
      if (timestamp == null) return NaN;
      const value = String(timestamp).trim();
      if (!value) return NaN;

      const numeric = Number(value);
      if (!Number.isNaN(numeric)) return value.length <= 10 ? numeric * 1000 : numeric;
      return new Date(value).getTime();
    },

    _normalizeTalkTags(tags) {
      const values = (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag ?? '').trim())
        .filter(Boolean);

      const labels = [];
      let from = '';

      values.forEach((tag) => {
        if (!from && this._looksLikeBrowserTag(tag)) {
          from = tag;
          return;
        }
        labels.push(tag.replace(/^#/, ''));
      });

      return {
        labels,
        from: from || 'Chrome',
      };
    },

    _looksLikeBrowserTag(tag) {
      const value = String(tag || '').trim();
      if (!value) return false;

      return /^(chrome|chromium|firefox|safari|edge|edg|opera|opr|qqbrowser|quark|ucbrowser|uc browser|baidu|sogou|wechat|micromessenger|weixin|android|ios|iphone|ipad|macos|windows|linux)(\b|[\s/._-])/i.test(value)
        || /\b(chrome|chromium|firefox|safari|edge|edg|opera|opr|qqbrowser|quark|ucbrowser|uc browser|baidu|sogou|wechat|micromessenger|weixin)\b/i.test(value)
        || /\b(android|ios|iphone|ipad|macos|windows|linux)\b/i.test(value);
    },

    _heartIcon(liked) {
      return liked
        ? `<svg class="like-svg" style="margin-right:2px" xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="red"><path transform="scale(0.03,0.03)" d="${LIKED_HEART_PATH}"></path></svg>`
        : `<svg class="like-svg" xmlns="http://www.w3.org/2000/svg" height="16" width="16"><path transform="scale(0.03,0.03)" d="${UNLIKED_HEART_PATH}"></path></svg>`;
    },

    _normalizeBaseURL(baseURL) {
      return String(baseURL).endsWith('/') ? String(baseURL) : `${baseURL}/`;
    },

    _apiErrorMessage(result) {
      if (!result) return '';
      if (typeof result.msg === 'string') return result.msg;
      if (typeof result.message === 'string') return result.message;
      if (result.data && typeof result.data.msg === 'string') return result.data.msg;
      if (result.data && typeof result.data.message === 'string') return result.data.message;
      return '';
    },

    _container() {
      return document.querySelector(this.config.el);
    },

    _escapeHTML(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    _escapeAttr(value) {
      return this._escapeHTML(value).replace(/`/g, '&#96;');
    },

    _toast(message, type) {
      let box = document.querySelector('.qexot-toast-box');
      if (!box) {
        box = document.createElement('div');
        box.className = 'qexot-toast-box';
        document.body.appendChild(box);
      }

      if (box.querySelector(`.qexot-toast--${type}`)) return;

      const toast = document.createElement('div');
      toast.className = `qexot-toast qexot-toast--${type || 'default'}`;
      toast.textContent = message;
      box.appendChild(toast);
      setTimeout(() => toast.remove(), 3524);
    },

    _initViewImage() {
      if (window.ViewImage && window.ViewImage.__qexotReady) return;

      window.ViewImage = {
        __qexotReady: true,
        target: '.qexot-content img',
        listener: null,
        init(selector) {
          if (selector) this.target = selector;
          if (this.listener) document.removeEventListener('click', this.listener, false);

          this.listener = (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            const selectorText = String(this.target.split(',').map((item) => `${item.trim()}:not([no-view])`));
            const target = event.target.closest(selectorText);
            if (!target) return;

            const root = target.closest('[view-image]') || target.closest('.qexot-list') || document.body;
            const images = Array.from(root.querySelectorAll(selectorText)).map((item) => item.href || item.currentSrc || item.src).filter(Boolean);
            this.display(images, target.href || target.currentSrc || target.src);
            event.preventDefault();
            event.stopPropagation();
          };

          document.addEventListener('click', this.listener, false);
        },
        display(images, current) {
          if (!images.length || !current) return;
          let index = Math.max(0, images.indexOf(current));
          const overlay = document.createElement('div');
          overlay.className = 'view-image';
          overlay.innerHTML = `
            <div class="view-image-container">
              <div class="view-image-lead"><img class="view-image-img" src="${current}" alt="ViewImage" no-view></div>
              <div class="view-image-loading"></div>
              <button class="view-image-close view-image-close__full" type="button" aria-label="关闭"></button>
            </div>
            <div class="view-image-tools">
              <div class="view-image-tools__count"><span><b class="view-image-index">${index + 1}</b>/${images.length}</span></div>
              <div class="view-image-tools__flip">
                <button class="view-image-btn view-image-tools__flip-prev" type="button" aria-label="上一张">${LEFT_ARROW_SVG}</button>
                <button class="view-image-btn view-image-tools__flip-next" type="button" aria-label="下一张">${RIGHT_ARROW_SVG}</button>
              </div>
              <button class="view-image-btn view-image-close" type="button" aria-label="关闭">${CLOSE_SVG}</button>
            </div>
          `;

          const image = overlay.querySelector('.view-image-img');
          const indexEl = overlay.querySelector('.view-image-index');
          const show = (nextIndex) => {
            index = (nextIndex + images.length) % images.length;
            image.src = images[index];
            indexEl.textContent = index + 1;
          };
          const close = () => {
            window.removeEventListener('keydown', keydown);
            overlay.classList.add('view-image__out');
            setTimeout(() => overlay.remove(), 290);
          };
          const keydown = (event) => {
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowLeft') show(index - 1);
            if (event.key === 'ArrowRight') show(index + 1);
          };

          overlay.addEventListener('click', (event) => {
            if (event.target.closest('.view-image-close')) close();
            if (event.target.closest('.view-image-tools__flip-prev')) show(index - 1);
            if (event.target.closest('.view-image-tools__flip-next')) show(index + 1);
          });
          window.addEventListener('keydown', keydown);
          document.body.appendChild(overlay);
        },
      };
    },

    _injectStyle() {
      if (document.getElementById('qexot-style')) return;
      const style = document.createElement('style');
      style.id = 'qexot-style';
      style.textContent = `
.qexot{padding-bottom:40px}.qexot-info{display:flex;justify-content:space-between;align-items:center}.qexot-info .count{font-weight:700;font-size:16px}.xk-card,.qexot-item{padding:15px 20px 2px;border-radius:10px;background:rgba(255,255,255,.1);box-shadow:0 0 14px 2px rgb(7 17 27 / 6%);overflow:hidden;margin-top:20px;user-select:none;position:relative;transition:all .15s ease-in-out}.xk-card:hover,.qexot-item:hover{box-shadow:0 5px 10px 8px rgba(7,17,27,.16);transform:scale(1.015)}.xk-card-header,.qexot-header{display:flex;justify-content:space-between;align-items:center;gap:12px}.xk-card-header::before,.qexot-header::before{content:" ";width:4.5px;height:30px;background-color:var(--qexot-label-color);position:absolute;left:0;border-top-right-radius:5px;border-bottom-right-radius:5px;transition:height .2s ease}.xk-card:hover .xk-card-header::before,.qexot-item:hover .qexot-header::before{height:45px}.xk-card-name,.qexot-card-name{display:flex;align-items:center;min-width:0}.avatar,.qexot-avatar-wrap{width:40px;height:40px;margin-right:10px;flex:0 0 auto;overflow:hidden;border-radius:50%}.avatar-img,.qexot-avatar{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;box-shadow:0 0 3px 0 #00000066}.name-info,.qexot-user-info{display:inline-flex;flex-direction:column;align-items:flex-start;min-width:0}.name,.qexot-name{font-weight:bold;transition:letter-spacing .2s ease}.xk-card:hover .name,.qexot-item:hover .qexot-name{letter-spacing:1px}.xk-card-time,.qexot-datatime{font-size:12px;font-weight:400;font-style:oblique}.qexot-tags{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.dao-label,.qexot-tag-item{color:var(--qexot-label-color);font-weight:bold;font-style:oblique;font-size:13px;background-color:var(--qexot-label-bg);padding:2px 6px;border-radius:.4em;text-decoration:none}.xk-card-content,.qexot-content{padding:.8rem 0;word-break:break-word}.xk-card-content img,.qexot-content img{cursor:zoom-in;max-width:100%;height:auto}.xk-card-content iframe,.qexot-content iframe{width:100%!important}.xk-card-footer,.qexot-bottom{display:flex;padding-bottom:10px;justify-content:flex-end;align-items:center}.dao-like,.qexot-like{margin-left:auto;display:inline-flex;align-items:center;gap:2px;border:0;background:transparent;padding:0;color:inherit;cursor:pointer;font:inherit}.xk-card-label>span::before,.qexot-from>span::before{content:" ";display:inline-block;width:14px;height:14px;margin-right:3px;vertical-align:middle;background-size:contain;background-position:center;background-repeat:no-repeat;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAEvElEQVR4nO2aT2zbVBzHP892kiZuGK2hYUXTVqRqVO0FDkyCE5uGEEi7TOJSisQBxoEJ0MR2GxO7ICHQJv6IjQPSChdOlD8TQmxHxMSBSyc2/mxllHTtllRakrZpbD8OadPW6dYkfrEbls+pec9+/n2+9rMT90GbNm3atGnT5m5FHDv2ZTR5M38cxAiwNeyCAiKNYDRnmUeNZKbwNojDYVcUML1IjiQzBQwkIwADz+6is6cr7MICITc9y6WzF0AyogG9wF0jD5BMVVx7DW/nb99dID8zG2xFikimunj4mV3A+h6r+5epBKCnLABELNLsOptGLB6lr/8BAK4mouQ9/UbHSv8vy23eQQaH9zazxpowhKDH1DE0saY9O++QL7mVz4mIhhXXEZ79HQkDw3spObLS1h3X6YxoVceqbgkZFfIzc3ZN8rDJAghaHjZRAH7kTc1pSB4UBrDDlBtvdBv8yCc0hy7DprBYvzwoCsCKQW9cYsXq39eP/BbdptuwARhIOvTEygHUKg8KArBi0GeWC+0z3bpC8Dvns7ZBer7c+mdOMFMUdcnDOo/BethhSnrjK5ddVIOdSZe0IZgoeMv1HFjRDc92BFLCjQbkwWcAEwVBzhb0mS5RDRZduFrQyBQ3OKjiu/3fc43Jg4IpkCmWpQGuhCAP9c35qnoa2stDpghpQ5BtMXlQ+BgMas6rlAdFV8BG6EKQ6tTRxVqtzLxDYZW8uSTvxZUwXbCx3RV5K65j+pSHAAJYPvNe+axHPhR6F5HvnK3d9eeeT/yswtO5e+mfhXejJf97IJDbnHl2E0LoBXkoUkBtIo8NCGAVpIHxQG0mjwoDKAV5UFRAH7khQhPHhQE4EsesIwSt4rhyIPPAPxe9p2aTYdw2R530Zc6g5QHH98EVcz533OwNSaYnBe4Mnh5aDAAlTe8a3Pl3jDkoYEp0Kp3+9tR11H/b/JQRwCbQf6+Ux9hnf648nl2weH4P19xcvqbNduNXZph7PJMTWNW7gE/v/NFzYUExT2pe3nq4D40rRxS5NpEpW/5zF8tTlftdz1f/Wrq4ugP5P69UdUeyAuRRnFLLpnrWYQoB7C8fufmVBaAxKptE4Vc1f6r23S5/jSpBLD74D6f5Tafua3b8M6tfuN+PO9aeDBhVE3BR/c/sebz+Q++Bjb5FeDlr/3PV7Ud3rKnqu257Z01j1kJIJdfbLCs1kYD0lBeOHS3kF9xTRsIRpEcuXT2Qpg1hYKAM0bOMo8mMwWWlsv1hl1UQKQRjN6yzLfu/N8Mhbz36mcSwNo9dMftMufHATj04YuB1LZpVoiERTuAsAsIG+Xz7NTLpxL5aPSQlAwLwUOA35WXJSm5omnyc7NYev/A6QNzKupcRmkA775ypkcz7O9BPKJy3BXkr65tPP3mJy/U9lOvBpQFcOK1T1OOY5wDBiOJqNs1uE3rsDoRur9ZJh2XhUye7PiktOeLArio6/ae10++VP0zsAGUBFA+8+45kEORRKyYerw/pitec+wu2kz99EfRLizEpOSyHjGefOPEyJTfcZX8GNIizrdIhgBKc8XY5I/jKoZdjxiAEOx0HXsMeMzvgGqeAq70LsxuOkJS/QKgTZs2berkP82M1TLgT8x4AAAAAElFTkSuQmCC")}.qexot-like.is-liked{color:red}.like-svg{cursor:pointer}.qexot-loading{text-align:center;padding:20px}.qexot-loading img{width:282px;max-width:100%;height:auto}.bbddloading-inner{height:100px;margin:auto;position:relative;width:100px}.bbddloading-line-wrap{animation:spin 2000ms cubic-bezier(.175,.885,.32,1.275) infinite;box-sizing:border-box;height:50px;left:0;overflow:hidden;position:absolute;top:0;transform-origin:50% 100%;width:100px}.bbddloading-line{border:4px solid transparent;border-radius:100%;box-sizing:border-box;height:100px;left:0;margin:0 auto;position:absolute;right:0;top:0;width:100px}.bbddloading-line-wrap:nth-child(1){animation-delay:-50ms}.bbddloading-line-wrap:nth-child(2){animation-delay:-100ms}.bbddloading-line-wrap:nth-child(3){animation-delay:-150ms}.bbddloading-line-wrap:nth-child(4){animation-delay:-200ms}.bbddloading-line-wrap:nth-child(5){animation-delay:-250ms}.bbddloading-line-wrap:nth-child(1) .bbddloading-line{border-color:hsl(0,80%,60%);height:90px;width:90px;top:7px}.bbddloading-line-wrap:nth-child(2) .bbddloading-line{border-color:hsl(60,80%,60%);height:76px;width:76px;top:14px}.bbddloading-line-wrap:nth-child(3) .bbddloading-line{border-color:hsl(120,80%,60%);height:62px;width:62px;top:21px}.bbddloading-line-wrap:nth-child(4) .bbddloading-line{border-color:hsl(180,80%,60%);height:48px;width:48px;top:28px}.bbddloading-line-wrap:nth-child(5) .bbddloading-line{border-color:hsl(240,80%,60%);height:34px;width:34px;top:35px}@keyframes spin{0%,15%{transform:rotate(0)}100%{transform:rotate(360deg)}}.qexot-btn-area{text-align:center}.push-btn,.qexot-more{position:relative;isolation:isolate;overflow:hidden;min-width:148px;width:auto;padding:0 24px;font-size:16px;font-weight:800;letter-spacing:.08em;color:#fff;cursor:pointer;margin:20px;height:55px;text-align:center;border:2px solid #111;background:#111;border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.18);transition:color .28s ease,transform .28s ease,box-shadow .28s ease}.push-btn::before,.qexot-more::before{content:"";position:absolute;inset:0;z-index:-2;background:repeating-linear-gradient(115deg,#000 0 12px,#fff 12px 24px);background-size:56px 56px;animation:qexot-more-roll 1.2s linear infinite}.push-btn::after,.qexot-more::after{content:"";position:absolute;inset:4px;z-index:-1;border-radius:inherit;background:#111;transition:background .28s ease}.push-btn:hover,.qexot-more:hover{color:#111;transform:translateY(-2px);box-shadow:0 14px 30px rgba(0,0,0,.26)}.push-btn:hover::after,.qexot-more:hover::after{background:#fff}.push-btn:active,.qexot-more:active{transform:translateY(0)}@keyframes qexot-more-roll{to{background-position:56px 0}}@media (prefers-reduced-motion:reduce){.push-btn::before,.qexot-more::before{animation:none}}.qexot-message{text-align:center;margin-top:20px}.xk-footer,.qexot-footer{width:100%;text-align:end;font-size:.75em;color:#999;margin-top:1em}.qexot-toast-box{position:fixed;top:1em;right:1em;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none}.qexot-toast{min-width:260px;max-width:600px;padding:16px 20px;border-radius:8px;color:#fff;box-shadow:0 1px 10px rgba(0,0,0,.1);animation:qexot-toast-in .25s ease}.qexot-toast--success{background:#4caf50}.qexot-toast--error{background:#ff5252}.qexot-toast--default{background:#1976d2}@keyframes qexot-toast-in{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}.view-image{position:fixed;inset:0;z-index:500;padding:1rem;display:flex;flex-direction:column;animation:view-image-in 300ms;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}.view-image__out{animation:view-image-out 300ms}@keyframes view-image-in{0%{opacity:0}}@keyframes view-image-out{100%{opacity:0}}.view-image-container{height:0;flex:1;display:flex;align-items:center;justify-content:center}.view-image-lead{display:contents}.view-image-img{position:relative;z-index:1;max-width:100%;max-height:100%;object-fit:contain;border-radius:3px}.view-image-close__full{position:absolute;inset:0;background-color:rgba(48,55,66,.3);z-index:unset;cursor:zoom-out;margin:0;border:0}.view-image-tools{position:absolute;bottom:5%;left:1rem;right:1rem;max-width:600px;margin:0 auto;padding:10px;border-radius:5px;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);z-index:1;display:flex;justify-content:space-between;align-items:center;color:#fff}.view-image-tools__count{width:60px;display:flex;align-items:center;justify-content:center}.view-image-tools__flip{display:flex;gap:10px}.view-image-btn{width:32px;height:32px;display:flex;justify-content:center;align-items:center;cursor:pointer;border:0;border-radius:3px;background-color:rgba(255,255,255,.2);color:#fff}.view-image-btn:hover{background-color:rgba(255,255,255,.5)}@media screen and (min-width:768px){.xk-card-content .fancybox,.xk-card-content video,.qexot-content .fancybox,.qexot-content video{display:inline-block;max-width:50%}}@media screen and (max-width:768px){.xk-card-content .fancybox,.xk-card-content video,.qexot-content .fancybox,.qexot-content video{display:inline-block;max-width:100%}.qexot-header{align-items:flex-start}.qexot-tags{max-width:45%;justify-content:flex-end}.qexot-toast-box{left:0;right:0;top:0}.qexot-toast{border-radius:0;max-width:none}}
      `;
      document.head.appendChild(style);
    },
  };

  window.myQexoShouts = myQexoShouts;
})(window, document);
